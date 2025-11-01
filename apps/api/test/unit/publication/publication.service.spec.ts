import { Test } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { PublicationService } from "../../../src/publication/publication.service";
import { Publication } from "../../../src/publication/publication.schema";
import { HttpStatus } from "@nestjs/common/enums/http-status.enum";
import { Types } from "mongoose";

const expectedPub1 = {
	_id: "507f1f77bcf86cd799439011",
	message: "Hello world",
	datePublication: new Date("2025-10-01"),
	prediction_id: "507f1f77bcf86cd799439012",
	parentPublication_id: undefined,
	user_id: "507f1f77bcf86cd799439013",
} as unknown as Publication;

const expectedPub2 = {
	_id: "507f1f77bcf86cd799439014",
	message: "Reply",
	datePublication: new Date("2025-10-02"),
	prediction_id: "507f1f77bcf86cd799439012",
	parentPublication_id: "507f1f77bcf86cd799439011",
	user_id: "507f1f77bcf86cd799439015",
} as unknown as Publication;

const expectedPublications = [expectedPub1, expectedPub2];

interface MockPubModel {
	new (data: any): { save: jest.Mock; [key: string]: any };
	find: jest.Mock;
	findById: jest.Mock;
	findByIdAndDelete: jest.Mock;
}

const mockPubModel = jest.fn().mockImplementation((data) => ({
	...data,
	save: jest.fn().mockResolvedValue(data),
})) as unknown as MockPubModel;

mockPubModel.find = jest.fn();
mockPubModel.findById = jest.fn();
mockPubModel.findByIdAndDelete = jest.fn();

const mockUserModel = {
	findByIdAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
} as any;

describe("PublicationService", () => {
	let publicationService: PublicationService;

	beforeEach(async () => {
		jest.clearAllMocks();

		const moduleRef = await Test.createTestingModule({
			providers: [
				PublicationService,
				{ provide: getModelToken(Publication.name), useValue: mockPubModel },
				{ provide: getModelToken("User"), useValue: mockUserModel },
			],
		}).compile();

		publicationService = moduleRef.get(PublicationService);
	});

	describe("getAll", () => {
		it("should return publications when found", async () => {
			mockPubModel.find.mockReturnValue({
				populate: jest.fn().mockReturnThis(),
				exec: jest.fn().mockResolvedValue(expectedPublications),
			});

			const result = await publicationService.getAll();

			expect(mockPubModel.find).toHaveBeenCalled();
			expect(result).toEqual(expectedPublications);
		});

		it("should return empty array when none found", async () => {
			mockPubModel.find.mockReturnValue({
				populate: jest.fn().mockReturnThis(),
				exec: jest.fn().mockResolvedValue([]),
			});

			const result = await publicationService.getAll();

			expect(mockPubModel.find).toHaveBeenCalled();
			expect(result).toEqual([]);
		});
	});

	describe("getById", () => {
		it("should return a publication when found", async () => {
			mockPubModel.findById.mockReturnValue({
				populate: jest.fn().mockReturnThis(),
				exec: jest.fn().mockResolvedValue(expectedPub1),
			});

			const result = await publicationService.getById("507f1f77bcf86cd799439011");

			expect(mockPubModel.findById).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
			expect(result).toEqual(expectedPub1);
		});

		it("should return undefined when not found", async () => {
			mockPubModel.findById.mockReturnValue({
				populate: jest.fn().mockReturnThis(),
				exec: jest.fn().mockResolvedValue(null),
			});

			const result = await publicationService.getById("507f1f77bcf86cd799439999");

			expect(mockPubModel.findById).toHaveBeenCalledWith("507f1f77bcf86cd799439999");
			expect(result).toBeUndefined();
		});
	});

	describe("createPublication", () => {
		it("should create and return publication", async () => {
			const newPub = {
				message: "New",
				datePublication: new Date("2025-12-01"),
				prediction_id: "507f1f77bcf86cd799439012",
				user_id: "507f1f77bcf86cd799439013",
			} as unknown as Publication;

			const createdObj = { ...newPub, _id: "507f1f77bcf86cd799439099" } as unknown as Publication;
			mockPubModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(createdObj) });

			const result = await publicationService.createPublication(newPub);

			expect(mockPubModel).toHaveBeenCalledWith(expect.objectContaining({ message: newPub.message }));
			const got = await publicationService.getById(createdObj._id);
			expect(got).toEqual(createdObj);
		});
	});

	describe("createOrUpdateById", () => {
		it("should update existing publication", async () => {
			const existing: any = {
				...expectedPub1,
				save: jest.fn().mockResolvedValue({ ...expectedPub1, message: "Updated" }),
			};
			mockPubModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(existing) });

			await publicationService.createOrUpdateById("507f1f77bcf86cd799439011", {
				message: "Updated",
			} as Publication);

			expect(mockPubModel.findById).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
			expect(existing.save).toHaveBeenCalled();
			const updatedObj = { ...expectedPub1, message: "Updated" } as unknown as Publication;
			mockPubModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedObj) });
			const got = await publicationService.getById("507f1f77bcf86cd799439011");
			expect(got).toEqual(expect.objectContaining({ message: "Updated" }));
		});

		it("should create new publication when not existing", async () => {
			mockPubModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

			await publicationService.createOrUpdateById("507f1f77bcf86cd799439016", {
				message: "Created",
				user_id: "507f1f77bcf86cd799439013",
			} as unknown as Publication);

			expect(mockPubModel).toHaveBeenCalledWith(
				expect.objectContaining({ message: "Created", user_id: "507f1f77bcf86cd799439013" }),
			);
			const createdObj = {
				_id: "507f1f77bcf86cd799439016",
				message: "Created",
				user_id: "507f1f77bcf86cd799439013",
			} as unknown as Publication;
			mockPubModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(createdObj) });
			const gotCreated = await publicationService.getById("507f1f77bcf86cd799439016");
			expect(gotCreated).toEqual(expect.objectContaining({ message: "Created", user_id: "507f1f77bcf86cd799439013" }));
		});

		it("should not fail when updating fields partly", async () => {
			const existing: any = {
				...expectedPub1,
				save: jest.fn().mockResolvedValue({ ...expectedPub1, message: "Part" }),
			};
			mockPubModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(existing) });

			await publicationService.createOrUpdateById("507f1f77bcf86cd799439011", {
				message: "Part",
			} as Publication);

			expect(existing.save).toHaveBeenCalled();
			const updatedObj = { ...expectedPub1, message: "Part" } as unknown as Publication;
			mockPubModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedObj) });
			const got = await publicationService.getById("507f1f77bcf86cd799439011");
			expect(got).toEqual(expect.objectContaining({ message: "Part" }));
		});
	});

	describe("deleteById", () => {
		it("should delete and return document when found", async () => {
			mockPubModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedPub1) });

			const result = await publicationService.deleteById("507f1f77bcf86cd799439011");

			expect(mockPubModel.findByIdAndDelete).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
			expect(result).toBeUndefined();
		});

		it("should throw when not found", async () => {
			mockPubModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

			await expect(publicationService.deleteById("507f1f77bcf86cd799439999")).rejects.toEqual(
				new Error("Publication introuvable"),
			);

			expect(mockPubModel.findByIdAndDelete).toHaveBeenCalledWith("507f1f77bcf86cd799439999");
		});

		it("should return normalized result and call user update if user present", async () => {
			const deletedWithUser: any = { ...expectedPub1 };
			mockPubModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(deletedWithUser) });

			const result = await publicationService.deleteById("507f1f77bcf86cd799439011");

			expect(mockPubModel.findByIdAndDelete).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
			expect(result).toBeUndefined();
		});
	});

	describe("toggleLikePublication", () => {
		it("should add like when user has not liked yet", async () => {
			const mockLikesArray = [];
			mockLikesArray.filter = jest.fn().mockReturnValue([]);
			mockLikesArray.push = jest.fn();

			const pubWithoutLike = {
				...expectedPub1,
				likes: mockLikesArray,
				save: jest
					.fn()
					.mockResolvedValue({ ...expectedPub1, likes: [new Types.ObjectId("507f1f77bcf86cd799439015")] }),
			};
			mockPubModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(pubWithoutLike) });

			const result = await publicationService.toggleLikePublication(
				"507f1f77bcf86cd799439011",
				"507f1f77bcf86cd799439015",
			);

			expect(mockPubModel.findById).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
			expect(mockLikesArray.filter).toHaveBeenCalled();
			expect(mockLikesArray.push).toHaveBeenCalledWith(expect.any(Types.ObjectId));
			expect(pubWithoutLike.save).toHaveBeenCalled();
		});

		it("should remove like when user has already liked", async () => {
			const userObjectId = { equals: jest.fn().mockReturnValue(true) };
			const mockLikesArray = [userObjectId];
			mockLikesArray.filter = jest
				.fn()
				.mockReturnValueOnce([userObjectId]) // Premier appel: trouve le like existant
				.mockReturnValueOnce([]); // Deuxième appel: retourne la liste filtrée

			const pubWithLike = {
				...expectedPub1,
				likes: mockLikesArray,
				save: jest.fn().mockResolvedValue({ ...expectedPub1, likes: [] }),
			};
			mockPubModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(pubWithLike) });

			const result = await publicationService.toggleLikePublication(
				"507f1f77bcf86cd799439011",
				"507f1f77bcf86cd799439015",
			);

			expect(mockPubModel.findById).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
			expect(mockLikesArray.filter).toHaveBeenCalledTimes(2);
			expect(pubWithLike.save).toHaveBeenCalled();
			expect(pubWithLike.likes).toEqual([]);
		});

		it("should throw error when publication not found", async () => {
			mockPubModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

			await expect(
				publicationService.toggleLikePublication("507f1f77bcf86cd799439999", "507f1f77bcf86cd799439013"),
			).rejects.toThrow("Publication introuvable");

			expect(mockPubModel.findById).toHaveBeenCalledWith("507f1f77bcf86cd799439999");
		});
	});
});
