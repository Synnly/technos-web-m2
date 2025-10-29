import { Test } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { PredictionService } from "../../../src/prediction/prediction.service";
import { Prediction, PredictionStatus } from "../../../src/prediction/prediction.schema";
import { User, Role } from "../../../src/user/user.schema";
import { Vote } from "../../../src/vote/vote.schema";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import OpenAI from "openai";
import { log } from "console";

const expectedUser1 = {
	_id: "1",
	username: "testuser1",
	motDePasse: "H@sh3dpassword",
	points: 50,
	dateDerniereRecompenseQuotidienne: null,
	role: Role.USER,
	predictions: [],
	votes: [],
	cosmeticsOwned: [],
	currentCosmetic: [],
} as User;

const expectedPred1 = {
	_id: "p1",
	title: "Will it rain tomorrow?",
	description: "Simple weather prediction",
	status: PredictionStatus.Waiting,
	createdAt: new Date(),
	dateFin: new Date("3025-12-31"),
	options: { yes: 10, no: 5 },
	user_id: (expectedUser1 as any)._id,
	result: "",
	pronostics_ia: {},
} as Prediction;

const expectedPred2 = {
	_id: "p2",
	title: "Will team A win?",
	description: "Match outcome",
	status: PredictionStatus.Valid,
	createdAt: new Date(),
	dateFin: new Date("3025-11-30"),
	options: { teamA: 3, teamB: 7 },
	user_id: (expectedUser1 as any)._id,
	result: "",
	pronostics_ia: {},
} as Prediction;

const expectedPredictions = [expectedPred1, expectedPred2];

// Mock Mongoose Model shape
interface MockPredModel {
	new (data: any): { save: jest.Mock; [key: string]: any };
	find: jest.Mock;
	findById: jest.Mock;
	findByIdAndDelete: jest.Mock;
	findByIdAndUpdate: jest.Mock;
}

const mockPredModel = jest.fn().mockImplementation((data) => ({
	...data,
	// retourne les données construites afin que l'_id fourni soit préservé dans les tests
	save: jest.fn().mockResolvedValue(data),
})) as unknown as MockPredModel;

mockPredModel.find = jest.fn();
mockPredModel.findById = jest.fn();
mockPredModel.findByIdAndDelete = jest.fn();
mockPredModel.findByIdAndUpdate = jest.fn();

// helper that builds a chainable mock object mimicking Mongoose Query API used by the service
function createQueryMock(result: any) {
	return {
		sort: jest.fn().mockReturnThis(),
		populate: jest.fn().mockReturnThis(),
		lean: jest.fn().mockReturnThis(),
		skip: jest.fn().mockReturnThis(),
		limit: jest.fn().mockReturnThis(),
		exec: jest.fn().mockResolvedValue(result),
	};
}

const mockUserModel = {
	findByIdAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
} as any;

const mockVoteModel = {
	find: jest.fn(),
	create: jest.fn(),
} as any;

const mockConfigService = {
	get: jest.fn().mockImplementation((key: string) => {
		const configMap = {
			OPENAI_API_KEY: "test-api-key",
			LANGSEARCH_API_KEY: "langsearch-key",
			DATABASE_URL: "mongodb://localhost:27017/test",
		};
		return configMap[key];
	}),
} as any;

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

jest.mock("openai");
const MockedOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>;

describe("PredictionService", () => {
	let predictionService: PredictionService;
	let mockOpenAIInstance: any;

	beforeEach(async () => {
		jest.clearAllMocks();

		// Créer une instance mockée d'OpenAI avec des fonctions Jest
		mockOpenAIInstance = {
			responses: {
				create: jest.fn(),
			},
		};

		MockedOpenAI.mockImplementation(() => mockOpenAIInstance);

		const moduleRef = await Test.createTestingModule({
			providers: [
				PredictionService,
				{
					provide: getModelToken(Prediction.name),
					useValue: mockPredModel,
				},
				{ provide: getModelToken("User"), useValue: mockUserModel },
				{ provide: getModelToken(Vote.name), useValue: mockVoteModel },
				{ provide: ConfigService, useValue: mockConfigService },
			],
		}).compile();

		predictionService = moduleRef.get(PredictionService);
	});

	describe("getAll", () => {
		it("should return predictions when found", async () => {
			mockPredModel.find.mockReturnValue(createQueryMock(expectedPredictions));

			const result = await predictionService.getAll();

			expect(mockPredModel.find).toHaveBeenCalled();
			expect(result).toEqual(expectedPredictions);
		});

		it("should return empty array when none found", async () => {
			mockPredModel.find.mockReturnValue(createQueryMock([]));

			const result = await predictionService.getAll();

			expect(mockPredModel.find).toHaveBeenCalled();
			expect(result).toEqual([]);
		});
	});

	describe("getById", () => {
		it("should return a prediction when found", async () => {
			mockPredModel.findById.mockReturnValue({
				populate: jest.fn().mockReturnThis(),
				exec: jest.fn().mockResolvedValue(expectedPred1),
			});

			const result = await predictionService.getById("p1");

			expect(mockPredModel.findById).toHaveBeenCalledWith("p1");
			expect(result).toEqual(expectedPred1);
		});

		it("should return undefined when not found", async () => {
			mockPredModel.findById.mockReturnValue({
				populate: jest.fn().mockReturnThis(),
				exec: jest.fn().mockResolvedValue(null),
			});

			const result = await predictionService.getById("unknown");

			expect(mockPredModel.findById).toHaveBeenCalledWith("unknown");
			expect(result).toBeUndefined();
		});
	});

	describe("createPrediction", () => {
		it("should create a prediction (calls model.save)", async () => {
			const newPred = {
				title: "New pred",
				status: PredictionStatus.Waiting,
				dateFin: new Date("2025-01-01"),
				options: { a: 0, b: 0 },
			} as unknown as Prediction;

			await predictionService.createPrediction(newPred);

			expect(mockPredModel).toHaveBeenCalledWith(expect.objectContaining({ title: newPred.title }));

			// the constructor should have produced an instance whose save() was called
			const createdInstance = (mockPredModel as unknown as jest.Mock).mock.results[0].value;
			expect(createdInstance.save).toHaveBeenCalled();
		});

		it("should push prediction id to user when created with user_id", async () => {
			const newPredWithUser = {
				title: "With user",
				status: PredictionStatus.Waiting,
				dateFin: new Date("2025-01-03"),
				options: { a: 0, b: 0 },
				user_id: (expectedUser1 as any)._id,
				_id: "pnew",
			} as unknown as Prediction;

			await predictionService.createPrediction(newPredWithUser);

			// newPredWithUser._id is passed through by our mock save, so ensure userModel updated with that id
			expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith((expectedUser1 as any)._id, {
				$push: { predictions: newPredWithUser._id },
			});
		});
	});

	describe("createOrUpdateById", () => {
		it("should update existing prediction", async () => {
			const existing = {
				...expectedPred1,
				save: jest.fn().mockResolvedValue({ ...expectedPred1, title: "Updated" }),
			};
			mockPredModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue(existing),
			});

			await predictionService.createOrUpdateById("p1", {
				title: "Updated",
			} as Prediction);

			expect(mockPredModel.findById).toHaveBeenCalledWith("p1");
			expect(existing.save).toHaveBeenCalled();
			// createOrUpdate no longer returns the updated doc - it persists side-effects
		});

		it("should create new prediction when not existing", async () => {
			mockPredModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue(null),
			});

			await predictionService.createOrUpdateById("newid", { title: "Created" } as Prediction);

			// Le constructeur du modèle doit être appelé avec les données fournies, y compris _id
			expect(mockPredModel).toHaveBeenCalledWith(expect.objectContaining({ _id: "newid", title: "Created" }));
			// the created instance's save() should have been called (see mock)
			const createdInstance = (mockPredModel as unknown as jest.Mock).mock.results.find(
				(r) => r.value && r.value.save,
			)?.value;
			expect(createdInstance.save).toHaveBeenCalled();
		});

		it("should push prediction id to user when creating new with user_id", async () => {
			mockPredModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue(null),
			});

			await predictionService.createOrUpdateById("newid", {
				title: "Created",
				user_id: (expectedUser1 as any)._id,
			} as Prediction);

			expect(mockPredModel).toHaveBeenCalledWith(
				expect.objectContaining({
					_id: "newid",
					title: "Created",
					user_id: (expectedUser1 as any)._id,
				}),
			);
			expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith((expectedUser1 as any)._id, {
				$push: { predictions: "newid" },
			});
		});
	});

	describe("deleteById", () => {
		it("should delete and return document when found", async () => {
			mockPredModel.findByIdAndDelete.mockReturnValue({
				exec: jest.fn().mockResolvedValue(expectedPred1),
			});

			const result = await predictionService.deleteById("p1");

			expect(mockPredModel.findByIdAndDelete).toHaveBeenCalledWith("p1");
			expect(result).toEqual(expectedPred1);
		});

		it("should throw when not found", async () => {
			mockPredModel.findByIdAndDelete.mockReturnValue({
				exec: jest.fn().mockResolvedValue(null),
			});

			await expect(predictionService.deleteById("unknown")).rejects.toThrow("Prédiction introuvable");

			expect(mockPredModel.findByIdAndDelete).toHaveBeenCalledWith("unknown");
		});

		it("should remove prediction id from user when deleted and user_id present", async () => {
			const deletedWithUser = { ...expectedPred1 };
			mockPredModel.findByIdAndDelete.mockReturnValue({
				exec: jest.fn().mockResolvedValue(deletedWithUser),
			});

			const result = await predictionService.deleteById("p1");

			expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith((expectedUser1 as any)._id, {
				$pull: { predictions: deletedWithUser._id },
			});
			expect(result).toEqual(expectedPred1);
		});
	});

	describe("validatePrediction", () => {
		it("should throw if prediction is not found", async () => {
			mockPredModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue(null),
			});

			await expect(predictionService.validatePrediction("p1", "yes")).rejects.toThrow("Prédiction introuvable");
			expect(mockPredModel.findById).toHaveBeenCalledWith("p1");
		});

		it("should throw if winning option is invalid", async () => {
			mockPredModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue(expectedPred1),
			});

			await expect(predictionService.validatePrediction("p1", "invalid")).rejects.toThrow(
				"Option gagnante invalide",
			);
		});

		it("should throw if no points on winning option", async () => {
			const predWithNoPoints = {
				...expectedPred1,
				options: { yes: 0, no: 15 },
				save: jest.fn(),
			};
			mockPredModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue(predWithNoPoints),
			});

			// simulate no votes
			mockVoteModel.find.mockReturnValue({
				exec: jest.fn().mockResolvedValue([]),
			});

			await expect(predictionService.validatePrediction("p1", "yes")).rejects.toThrow(
				"Aucun point sur l’option gagnante",
			);
		});

		it("should distribute rewards correctly and update prediction", async () => {
			const pred = { ...expectedPred1, save: jest.fn() };
			const fakeVotes = [
				{ user_id: "u1", option: "yes", amount: 4 },
				{ user_id: "u2", option: "no", amount: 5 },
				{ user_id: "u3", option: "yes", amount: 6 },
			];

			mockPredModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue(pred),
			});
			mockVoteModel.find.mockReturnValue({
				exec: jest.fn().mockResolvedValue(fakeVotes),
			});
			mockUserModel.findByIdAndUpdate = jest.fn().mockResolvedValue({});

			const result = await predictionService.validatePrediction("p1", "yes");

			// totalPoints = 10 + 5 = 15, winningPoints = 10
			expect(result.ratio).toBe(15 / 10);
			expect(result.predictionId).toBe("p1");
			expect(result.winningOption).toBe("yes");

			expect(result.rewards).toEqual([
				{ user_id: "u1", gain: Math.floor(4 * (15 / 10)) },
				{ user_id: "u3", gain: Math.floor(6 * (15 / 10)) },
			]);

			expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
				"u1",
				{ $inc: { points: expect.any(Number) } },
				{ new: true },
			);
			expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
				"u3",
				{ $inc: { points: expect.any(Number) } },
				{ new: true },
			);

			expect(pred.status).toBe(PredictionStatus.Valid);
			expect(pred.result).toBe("yes");
			expect(pred.save).toHaveBeenCalled();
		});
	});

	describe("getExpiredPredictions", () => {
		it("should return expired valid predictions", async () => {
			const now = new Date();
			const expired = {
				...expectedPred2,
				dateFin: new Date(now.getTime() - 1000),
			};

			mockPredModel.find.mockReturnValue(createQueryMock([expired]));

			const result = await predictionService.getExpiredPredictions();

			expect(mockPredModel.find).toHaveBeenCalledWith({
				dateFin: { $lte: expect.any(Date) },
				result: "",
				status: PredictionStatus.Valid,
			});
			expect(result).toEqual([expired]);
		});
	});

	describe("getWaitingPredictions", () => {
		it("should return waiting predictions with no result", async () => {
			mockPredModel.find.mockReturnValue(createQueryMock([expectedPred1]));

			const result = await predictionService.getWaitingPredictions();

			expect(mockPredModel.find).toHaveBeenCalledWith({
				status: PredictionStatus.Waiting,
				result: "",
			});
			expect(result).toEqual([expectedPred1]);
		});
	});

	describe("getValidPredictions", () => {
		it("should return only predictions with status Valid and dateFin in the future", async () => {
			const now = new Date();
			const futurePred = {
				...expectedPred1,
				status: PredictionStatus.Valid,
				dateFin: new Date(now.getTime() + 100000),
				save: jest.fn(),
			};
			const pastPred = {
				...expectedPred2,
				status: PredictionStatus.Valid,
				dateFin: new Date(now.getTime() - 100000),
				save: jest.fn(),
			};

			// Simuler find pour qu'il ne retourne que la prédiction future
			mockPredModel.find.mockReturnValue(createQueryMock([futurePred]));

			const result = await predictionService.getValidPredictions();

			expect(mockPredModel.find).toHaveBeenCalledWith({
				status: PredictionStatus.Valid,
				dateFin: { $gt: expect.any(Date) },
			});

			expect(result).toEqual([futurePred]);
		});
	});

	describe("queryWebSearch", () => {
		it("should return search results when title provided", async () => {
			// Mock axios call
			mockAxios.post.mockResolvedValue({
				data: {
					code: 200,
					log_id: "3f077be5ec003b33",
					msg: null,
					data: {
						_type: "SearchResponse",
						queryContext: {
							originalQuery: "tell me the highlights from Apple's 2024 ESG report",
						},
						webPages: {
							webSearchUrl:
								"https://langsearch.com/search?q=tell me the highlights from Apple's 2024 ESG report",
							totalEstimatedMatches: null,
							value: [
								{
									id: "https://api.langsearch.com/v1/web-search#1",
									name: "ESG Report June 2024 - Apple Inc. (AAPL)",
									url: "https://www.crispidea.com/report/esg-report-june-2024-apple/",
									displayUrl: "https://www.crispidea.com/report/esg-report-june-2024-apple/",
									snippet: "snippet1",
									summary: "summary1",
									datePublished: null,
									dateLastCrawled: null,
								},
								{
									id: "https://api.langsearch.com/v1/web-search#2",
									name: "Apple ESG rating 2023: Key takeaways from Apple's ESG Report - Permutable",
									url: "https://permutable.ai/6-key-takeaways-from-the-apple-esg-report/",
									displayUrl: "https://permutable.ai/6-key-takeaways-from-the-apple-esg-report/",
									snippet: "snippet2",
									summary: "summary2",
									datePublished: null,
									dateLastCrawled: null,
								},
								{
									id: "https://api.langsearch.com/v1/web-search#3",
									name: "Apple (AAPL) ESG Score and Rating 2024",
									url: "https://www.marketbeat.com/stocks/NASDAQ/aapl/sustainability/",
									displayUrl: "https://www.marketbeat.com/stocks/NASDAQ/aapl/sustainability/",
									snippet: "snippet3",
									summary: "summary3",
									datePublished: null,
									dateLastCrawled: null,
								},
								{
									id: "https://api.langsearch.com/v1/web-search#4",
									name: "Apple ESG 2023: A Deep Dive into Apple's ESG Efforts",
									url: "https://permutable.ai/apple-esg/",
									displayUrl: "https://permutable.ai/apple-esg/",
									snippet: "snippet4",
									summary: "summary4",
									datePublished: null,
									dateLastCrawled: null,
								},
								{
									id: "https://api.langsearch.com/v1/web-search#5",
									name: "Apple ESG Report 2024 - Google Search",
									url: "https://www.google.bi/search?q=Apple+ESG+Report+2024&source=lnt&tbm=nws",
									displayUrl:
										"https://www.google.bi/search?q=Apple ESG Report 2024&source=lnt&tbm=nws",
									snippet: "snippet5",
									summary: "summary5",
									datePublished: null,
									dateLastCrawled: null,
								},
								{
									id: "https://api.langsearch.com/v1/web-search#6",
									name: "Apple : 2024 report - MarketScreener",
									url: "https://www.marketscreener.com/quote/stock/APPLE-INC-4849/news/Apple-2024-report-46468356/",
									displayUrl:
										"https://www.marketscreener.com/quote/stock/APPLE-INC-4849/news/Apple-2024-report-46468356/",
									snippet: "snippet6",
									summary: "summary6",
									datePublished: null,
									dateLastCrawled: null,
								},
								{
									id: "https://api.langsearch.com/v1/web-search#7",
									name: "Apple Shares 2024 Environmental Progress Report Ahead of Earth Day - MacRumors",
									url: "https://www.macrumors.com/2024/04/18/apple-2024-environmental-progress-report/",
									displayUrl:
										"https://www.macrumors.com/2024/04/18/apple-2024-environmental-progress-report/",
									snippet: "snippet7",
									summary: "summary7",
									datePublished: null,
									dateLastCrawled: null,
								},
								{
									id: "https://api.langsearch.com/v1/web-search#8",
									name: "Apple touts halving emissions and increased recycling rates in 2024 environmental progress report - 9to5Mac",
									url: "https://9to5mac.com/2024/04/18/apple-2024-environmental-report/",
									displayUrl: "https://9to5mac.com/2024/04/18/apple-2024-environmental-report/",
									snippet: "snippet8",
									summary: "summary8",
									datePublished: null,
									dateLastCrawled: null,
								},
								{
									id: "https://api.langsearch.com/v1/web-search#9",
									name: "Is Apple's Sustainability Report Alarming ? Must Read - 2024",
									url: "https://coderesist.com/apples-sustainability-report/",
									displayUrl: "https://coderesist.com/apples-sustainability-report/",
									snippet: "snippet9",
									summary: "summary9",
									datePublished: null,
									dateLastCrawled: null,
								},
								{
									id: "https://api.langsearch.com/v1/web-search#10",
									name: "Apple Shares 2024 Environmental Progress Report Ahead of Earth Day | MacRumors Forums",
									url: "https://forums.macrumors.com/threads/apple-shares-2024-environmental-progress-report-ahead-of-earth-day.2424424/",
									displayUrl:
										"https://forums.macrumors.com/threads/apple-shares-2024-environmental-progress-report-ahead-of-earth-day.2424424/",
									snippet: "snippet10",
									summary: "summary10",
									datePublished: null,
									dateLastCrawled: null,
								},
							],
							someResultsRemoved: true,
						},
					},
				},
			});

			const response = await predictionService.queryWebSearch("apple environment");

			expect(response).toEqual([
				"summary1",
				"summary2",
				"summary3",
				"summary4",
				"summary5",
				"summary6",
				"summary7",
				"summary8",
				"summary9",
				"summary10",
			]);
		});

		it("should throw an error if no content is found", async () => {
			// Mock axios call returning no webPages
			mockAxios.post.mockResolvedValue({
				data: {
					data: {
						webPages: {
							value: null,
						},
					},
				},
			});

			await expect(predictionService.queryWebSearch("apple environment")).rejects.toThrow(
				"Aucune recherche ne correspond aux mots clés",
			);
		});
	});

	describe("rerankDocuments", () => {
		it("should return reranked documents when documents are provided", async () => {
			const documents = [
				"Apple is looking at buying U.K. startup for $1 billion",
				"Apple is planning to open a new store in London",
			];

			// Mock axios call
			mockAxios.post.mockResolvedValue({
				data: {
					code: 200,
					log_id: "56a3067f9b92dfd0",
					msg: null,
					model: "langsearch-reranker-v1",
					results: [
						{
							index: 0,
							document: {
								text: "Apple is planning to open a new store in London",
							},
							relevance_score: 0.7166407801262326,
						},
						{
							index: 1,
							document: {
								text: "Apple is looking at buying U.K. startup for $1 billion",
							},
							relevance_score: 0.5658672473649548,
						},
					],
				},
			});

			const result = await predictionService.rerankDocuments("apple news", documents);

			expect(result).toEqual([
				"Apple is planning to open a new store in London",
				"Apple is looking at buying U.K. startup for $1 billion",
			]);
		});
	});

	describe("getQueryFromTitle", () => {
		it("should return a query from the title", async () => {
			mockOpenAIInstance.responses.create.mockResolvedValue({
				output_text: "apple buying uk startup 1 billion",
			});

			const result = await predictionService.getQueryFromTitle("apple news");

			expect(result).toEqual("apple buying uk startup 1 billion");
		});

		it("should throw an error if OpenAI call returns an empty string", async () => {
			mockOpenAIInstance.responses.create.mockResolvedValue({
				output_text: "",
			});

			await expect(predictionService.getQueryFromTitle("apple news")).rejects.toThrow(
				"L'IA n'a pas pu identifier au moins 2 mots clés",
			);
		});
	});

	describe("updatePronosticsByAI", () => {
		it("should update prediction title and description using AI", async () => {
			mockConfigService.get.mockImplementation((key: string) => {
				const configMap = {
					OPENAI_API_KEY: "test-api-key",
					LANGSEARCH_API_KEY: "langsearch-key",
					DATABASE_URL: "mongodb://localhost:27017/test",
					ENABLE_AI_PRONOSTICS: "true",
				};
				return configMap[key];
			});

			// Mock findById pour getById
			mockPredModel.findById.mockReturnValue({
				populate: jest.fn().mockReturnThis(),
				exec: jest.fn().mockResolvedValue(expectedPred2),
			});

			// Mock des méthodes du service
			predictionService.getQueryFromTitle = jest.fn().mockResolvedValue("team A match outcome");
			predictionService.queryWebSearch = jest.fn().mockResolvedValue(["doc1", "doc2"]);
			predictionService.rerankDocuments = jest.fn().mockResolvedValue(["doc1", "doc2"]);

			// Mock de la réponse OpenAI
			mockOpenAIInstance.responses.create.mockResolvedValue({
				output_text: '{ "teamA": 70.5, "teamB": 29.5 }',
			});

			// Mock findByIdAndUpdate
			mockPredModel.findByIdAndUpdate.mockResolvedValue({
				...expectedPred2,
				pronostics_ia: { teamA: 70.5, teamB: 29.5 },
			});

			await predictionService.updatePronosticsByAI(expectedPred2._id);

			expect(predictionService.getQueryFromTitle).toHaveBeenCalledWith(expectedPred2.title);
			expect(predictionService.queryWebSearch).toHaveBeenCalledWith("team A match outcome");
			expect(predictionService.rerankDocuments).toHaveBeenCalledWith(expectedPred2.title, ["doc1", "doc2"]);
			expect(mockOpenAIInstance.responses.create).toHaveBeenCalled();
			expect(mockPredModel.findByIdAndUpdate).toHaveBeenCalledWith(
				expectedPred2._id,
				expect.objectContaining({
					pronostics_ia: { teamA: 70.5, teamB: 29.5 },
				}),
			);
		});

		it("should not update pronostics if AI pronostics are disabled", async () => {
			mockConfigService.get.mockImplementation((key: string) => {
				const configMap = {
					OPENAI_API_KEY: "test-api-key",
					LANGSEARCH_API_KEY: "langsearch-key",
					DATABASE_URL: "mongodb://localhost:27017/test",
					ENABLE_AI_PRONOSTICS: "false",
				};
				return configMap[key];
			});

			await predictionService.updatePronosticsByAI(expectedPred2._id);
			expect(mockPredModel.findById).not.toHaveBeenCalled();
			expect(mockOpenAIInstance.responses.create).not.toHaveBeenCalled();
		});

		it("should throw an error if prediction not found", async () => {
			mockConfigService.get.mockImplementation((key: string) => {
				const configMap = {
					OPENAI_API_KEY: "test-api-key",
					LANGSEARCH_API_KEY: "langsearch-key",
					DATABASE_URL: "mongodb://localhost:27017/test",
					ENABLE_AI_PRONOSTICS: "true",
				};
				return configMap[key];
			});

			// Mock findById pour retourner null avec la structure chaînable
			mockPredModel.findById.mockReturnValue({
				populate: jest.fn().mockReturnThis(),
				exec: jest.fn().mockResolvedValue(null),
			});

			await expect(predictionService.updatePronosticsByAI(expectedPred2._id)).rejects.toThrow(
				"Prédiction non trouvée",
			);
		});

		it("should throw an error if the output cannot be parsed", async () => {
			mockConfigService.get.mockImplementation((key: string) => {
				const configMap = {
					OPENAI_API_KEY: "test-api-key",
					LANGSEARCH_API_KEY: "langsearch-key",
					DATABASE_URL: "mongodb://localhost:27017/test",
					ENABLE_AI_PRONOSTICS: "true",
				};
				return configMap[key];
			});

			// Mock findById pour getById
			mockPredModel.findById.mockReturnValue({
				populate: jest.fn().mockReturnThis(),
				exec: jest.fn().mockResolvedValue(expectedPred2),
			});

			// Mock de la réponse OpenAI
			mockOpenAIInstance.responses.create.mockResolvedValue({
				output_text: "invalid json",
			});

			await expect(predictionService.updatePronosticsByAI(expectedPred2._id)).rejects.toThrow();
		});
	});

	describe("getVotesTimeline", () => {
		it("should throw if prediction not found", async () => {
			mockPredModel.findById.mockReturnValue({
				populate: jest.fn().mockReturnThis(),
				exec: jest.fn().mockResolvedValue(null),
			});

			await expect(predictionService.getPredictionTimeline("p-missing", 5)).rejects.toThrow(
				"Prédiction introuvable",
			);
		});

		it("should return single interval with empty options when there are no votes", async () => {
			const now = new Date();
			const pred = { ...expectedPred1, createdAt: now };
			mockPredModel.findById.mockReturnValue({
				populate: jest.fn().mockReturnThis(),
				exec: jest.fn().mockResolvedValue(pred),
			});
			mockVoteModel.find.mockReturnValue({
				exec: jest.fn().mockResolvedValue([]),
			});

			const timeline = await predictionService.getPredictionTimeline(pred._id, 60, false, false);

			expect(Array.isArray(timeline)).toBe(true);
			expect(timeline.length).toBe(1);
			expect(timeline[0].options).toEqual({ no: 0, yes: 0 });
		});

		it("should compute cumulative counts when fromStart is true ", async () => {
			const start = new Date();
			start.setMinutes(start.getMinutes() - 10); // 10 minutes ago
			const pred = { ...expectedPred1, createdAt: start };
			mockPredModel.findById.mockReturnValue({
				populate: jest.fn().mockReturnThis(),
				exec: jest.fn().mockResolvedValue(pred),
			});

			const vote1 = {
				user_id: "u1",
				option: "yes",
				amount: 2,
				date: new Date(start.getTime() + 1 * 60000),
			};
			const vote2 = {
				user_id: "u2",
				option: "no",
				amount: 3,
				date: new Date(start.getTime() + 7 * 60000),
			};

			mockVoteModel.find.mockReturnValue({
				exec: jest.fn().mockResolvedValue([vote1, vote2]),
			});

			const timeline = await predictionService.getPredictionTimeline(pred._id, 5, false, true);

			expect(timeline.length).toBeGreaterThanOrEqual(2);
			expect(timeline[0].options).toEqual({ no: 0, yes: 2 });
			expect(timeline[1].options).toEqual({ no: 3, yes: 2 });
		});

		it("should compute per-interval counts when fromStart is false", async () => {
			const start = new Date();
			start.setMinutes(start.getMinutes() - 10);
			const pred = { ...expectedPred1, createdAt: start };
			mockPredModel.findById.mockReturnValue({
				populate: jest.fn().mockReturnThis(),
				exec: jest.fn().mockResolvedValue(pred),
			});

			const vote1 = {
				user_id: "u1",
				option: "yes",
				amount: 2,
				date: new Date(start.getTime() + 1 * 60000),
			};
			const vote2 = {
				user_id: "u2",
				option: "no",
				amount: 3,
				date: new Date(start.getTime() + 7 * 60000),
			};

			mockVoteModel.find.mockReturnValue({
				exec: jest.fn().mockResolvedValue([vote1, vote2]),
			});

			const timeline = await predictionService.getPredictionTimeline(pred._id, 5, false, false);
			expect(timeline[0].options).toEqual({ yes: 2, no: 0 });
			expect(timeline[1].options).toEqual({ yes: 0, no: 3 });
		});

		it("should include votes on the interval start boundary (>= interval) and exclude at end (< end)", async () => {
			const start = new Date();
			start.setMinutes(start.getMinutes() - 10);
			const pred = { ...expectedPred1, createdAt: start };
			mockPredModel.findById.mockReturnValue({
				populate: jest.fn().mockReturnThis(),
				exec: jest.fn().mockResolvedValue(pred),
			});

			// Vote exactly at interval start (should be included)
			const intervalStart = new Date(start.getTime()); // first interval start
			const voteOnBoundary = {
				user_id: "u1",
				option: "yes",
				amount: 1,
				date: new Date(intervalStart.getTime()),
			};
			// Vote exactly at interval end (should be excluded from that interval)
			const intervalEnd = new Date(intervalStart.getTime() + 5 * 60000);
			const voteOnEnd = {
				user_id: "u2",
				option: "no",
				amount: 1,
				date: new Date(intervalEnd.getTime()),
			};

			mockVoteModel.find.mockReturnValue({
				exec: jest.fn().mockResolvedValue([voteOnBoundary, voteOnEnd]),
			});

			const timeline = await predictionService.getPredictionTimeline(
				pred._id,
				5,
				false,
				false, // per-interval check
			);

			expect(timeline[0].options).toEqual({ no: 0, yes: 1 });
			expect(timeline[1].options).toEqual({ no: 1, yes: 0 });
		});

		it("should return percentages when votesAsPercentage is true", async () => {
			const start = new Date();
			start.setMinutes(start.getMinutes() - 10);
			const pred = { ...expectedPred1, createdAt: start };
			mockPredModel.findById.mockReturnValue({
				populate: jest.fn().mockReturnThis(),
				exec: jest.fn().mockResolvedValue(pred),
			});

			// Two votes in same interval
			const voteA = {
				user_id: "u1",
				option: "A",
				amount: 2,
				date: new Date(start.getTime() + 1 * 60000),
			};
			const voteB = {
				user_id: "u2",
				option: "B",
				amount: 3,
				date: new Date(start.getTime() + 2 * 60000),
			};

			mockVoteModel.find.mockReturnValue({
				exec: jest.fn().mockResolvedValue([voteA, voteB]),
			});

			const timeline = await predictionService.getPredictionTimeline(pred._id, 12, true, true);

			// Single interval expected; total = 5 => A = 40%, B = 60%
			expect(timeline.length).toBe(1);
			const options = timeline[0].options;
			expect(options.A).toBeCloseTo((2 / 5) * 100, 5);
			expect(options.B).toBeCloseTo((3 / 5) * 100, 5);
		});

		it("should handle large interval that covers all votes (single interval)", async () => {
			const start = new Date();
			start.setMinutes(start.getMinutes() - 30);
			const pred = { ...expectedPred1, createdAt: start };
			mockPredModel.findById.mockReturnValue({
				populate: jest.fn().mockReturnThis(),
				exec: jest.fn().mockResolvedValue(pred),
			});

			const v1 = {
				user_id: "u1",
				option: "no",
				amount: 1,
				date: new Date(start.getTime() + 5 * 60000),
			};
			const v2 = {
				user_id: "u2",
				option: "yes",
				amount: 2,
				date: new Date(start.getTime() + 15 * 60000),
			};

			mockVoteModel.find.mockReturnValue({
				exec: jest.fn().mockResolvedValue([v1, v2]),
			});

			const timeline = await predictionService.getPredictionTimeline(pred._id, 1000, false, true);
			// Only one interval should exist (since interval >> span)
			expect(timeline.length).toBe(1);
			expect(timeline[0].options).toEqual({ no: 1, yes: 2 });
		});
	});
});
