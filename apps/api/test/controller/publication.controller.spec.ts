import { Test } from "@nestjs/testing";
import { PublicationController } from "../../src/publication/publication.controller";
import { PublicationService } from "../../src/publication/publication.service";
import { Publication } from "../../src/publication/publication.schema";
import { BadRequestException, HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "../../src/guards/auth.guard";
import { AdminGuard } from "../../src/guards/admin.guard";
import { ConfigService } from "@nestjs/config";

const expectedPub1 = {
	_id: "507f1f77bcf86cd799439011",
	message: "Hello world",
	datePublication: new Date("3025-10-01"),
	prediction_id: "507f1f77bcf86cd799439012",
	parentPublication_id: undefined,
	user_id: "507f1f77bcf86cd799439013",
} as unknown as Publication;

const expectedPub2 = {
	_id: "507f1f77bcf86cd799439014",
	message: "Reply",
	datePublication: new Date("3025-10-02"),
	prediction_id: "507f1f77bcf86cd799439012",
	parentPublication_id: "507f1f77bcf86cd799439011",
	user_id: "507f1f77bcf86cd799439015",
} as unknown as Publication;

const expectedPublications = [expectedPub1, expectedPub2];

const mockPublicationService = {
	getAll: jest.fn(),
	getById: jest.fn(),
	createPublication: jest.fn(),
	createOrUpdateById: jest.fn(),
	deleteById: jest.fn(),
	toggleLikePublication: jest.fn(),
};

describe("PublicationController", () => {
	let publicationController: PublicationController;
	let publicationService: PublicationService;

	beforeEach(async () => {
		jest.clearAllMocks();
		const moduleRef = await Test.createTestingModule({
			controllers: [PublicationController],
			providers: [
				{
					provide: PublicationService,
					useValue: mockPublicationService,
				},
				{
					provide: JwtService,
					useValue: { verify: jest.fn(), sign: jest.fn() },
				},
				{
					provide: AuthGuard,
					useValue: { canActivate: jest.fn().mockReturnValue(true) },
				},
				{ provide: AdminGuard, useValue: { canActivate: jest.fn().mockReturnValue(true) } },
				{ provide: APP_GUARD, useValue: { canActivate: () => true } },
				{ provide: ConfigService, useValue: { get: jest.fn(() => "test-secret") } },
			],
		}).compile();

		publicationService = moduleRef.get(PublicationService);
		publicationController = moduleRef.get(PublicationController);
	});

	describe("getPublications", () => {
		it("should return all publications", async () => {
			mockPublicationService.getAll.mockResolvedValue(expectedPublications);

			await publicationController.getPublications();

			expect(publicationService.getAll).toHaveBeenCalled();
		});

		it("should return empty array when none exists", async () => {
			mockPublicationService.getAll.mockResolvedValue([]);

			await publicationController.getPublications();

			expect(publicationService.getAll).toHaveBeenCalled();
		});
	});

	describe("getPublicationById", () => {
		it("should return a publication when found", async () => {
			mockPublicationService.getById.mockResolvedValue(expectedPub1);

			await publicationController.getPublicationById(expectedPub1._id!);

			expect(publicationService.getById).toHaveBeenCalledWith(expectedPub1._id);
		});

		it("should return 404 when not found", async () => {
			mockPublicationService.getById.mockResolvedValue(null);

			await expect(publicationController.getPublicationById("507f1f77bcf86cd799439999")).rejects.toThrow(
				NotFoundException,
			);

			expect(publicationService.getById).toHaveBeenCalledWith("507f1f77bcf86cd799439999");
		});

		it("should return 400 when id is missing", async () => {
			await expect(publicationController.getPublicationById("")).rejects.toThrow(BadRequestException);
		});
	});

	describe("createPublication", () => {
		it("should create a publication and return 201", async () => {
			mockPublicationService.createPublication.mockResolvedValue(expectedPub1);

			await publicationController.createPublication(expectedPub1);

			expect(publicationService.createPublication).toHaveBeenCalledWith(expectedPub1);
		});

		it("should return 400 when publication body is missing", async () => {
			await expect(publicationController.createPublication(undefined as any)).rejects.toThrow(
				BadRequestException,
			);
		});

		it("should return 400 when message is missing", async () => {
			const bad = {
				...expectedPub1,
				message: undefined,
			} as unknown as Publication;

			await expect(publicationController.createPublication(bad)).rejects.toThrow(BadRequestException);
		});

		it("should return 400 when datePublication is missing", async () => {
			const bad = {
				...expectedPub1,
				datePublication: undefined,
			} as unknown as Publication;

			await expect(publicationController.createPublication(bad)).rejects.toThrow(BadRequestException);
		});

		it("should return 400 when datePublication is before today", async () => {
			const bad = {
				...expectedPub1,
				datePublication: new Date("2020-01-01"),
			} as unknown as Publication;

			await expect(publicationController.createPublication(bad)).rejects.toThrow(BadRequestException);
		});

		it("should return 400 when user_id is missing", async () => {
			const bad = {
				...expectedPub1,
				user_id: undefined,
			} as unknown as Publication;

			await expect(publicationController.createPublication(bad)).rejects.toThrow(BadRequestException);
		});

		it("should return 400 when prediction_id is missing", async () => {
			const bad = {
				...expectedPub1,
				prediction_id: undefined,
			} as unknown as Publication;

			await expect(publicationController.createPublication(bad)).rejects.toThrow(BadRequestException);
		});

		it("should return 500 on service error", async () => {
			mockPublicationService.createPublication.mockImplementationOnce(() => {
				throw new Error("erreur");
			});

			await expect(publicationController.createPublication(expectedPub1)).rejects.toThrow();

			expect(publicationService.createPublication).toHaveBeenCalledWith(expectedPub1);
		});
	});

	describe("createOrUpdatePublicationById", () => {
		it("should update and return 200 when exists", async () => {
			mockPublicationService.createOrUpdateById.mockResolvedValue(expectedPub1);

			await publicationController.createOrUpdatePublicationById(expectedPub1._id!, expectedPub1);

			expect(publicationService.createOrUpdateById).toHaveBeenCalledWith(expectedPub1._id, expectedPub1);
		});

		it("should return 400 when publication body is missing", async () => {
			await expect(
				publicationController.createOrUpdatePublicationById(expectedPub1._id!, undefined as any),
			).rejects.toThrow(BadRequestException);
		});

		it("should return 400 when id is missing", async () => {
			await expect(publicationController.createOrUpdatePublicationById("", expectedPub1)).rejects.toThrow(
				BadRequestException,
			);
		});

		it("should return 400 when message is missing", async () => {
			const bad = {
				...expectedPub1,
				message: undefined,
			} as unknown as Publication;

			await expect(publicationController.createOrUpdatePublicationById(expectedPub1._id!, bad)).rejects.toThrow(
				BadRequestException,
			);
		});

		it("should return 400 when datePublication is missing", async () => {
			const bad = {
				...expectedPub1,
				datePublication: undefined,
			} as unknown as Publication;

			await expect(publicationController.createOrUpdatePublicationById(expectedPub1._id!, bad)).rejects.toThrow(
				BadRequestException,
			);
		});

		it("should return 400 when datePublication is before today", async () => {
			const bad = {
				...expectedPub1,
				datePublication: new Date("2020-01-01"),
			} as unknown as Publication;

			await expect(publicationController.createOrUpdatePublicationById(expectedPub1._id!, bad)).rejects.toThrow(
				BadRequestException,
			);
		});

		it("should return 400 when user_id is missing", async () => {
			const bad = {
				...expectedPub1,
				user_id: undefined,
			} as unknown as Publication;

			await expect(publicationController.createOrUpdatePublicationById(expectedPub1._id!, bad)).rejects.toThrow(
				BadRequestException,
			);
		});

		it("should return 400 when prediction_id is missing", async () => {
			const bad = {
				...expectedPub1,
				prediction_id: undefined,
			} as unknown as Publication;

			await expect(publicationController.createOrUpdatePublicationById(expectedPub1._id!, bad)).rejects.toThrow(
				BadRequestException,
			);
		});

		it("should return 500 on service error", async () => {
			mockPublicationService.createOrUpdateById.mockImplementationOnce(() => {
				throw new Error("erreur");
			});

			await expect(
				publicationController.createOrUpdatePublicationById(expectedPub1._id!, expectedPub1),
			).rejects.toThrow();

			expect(publicationService.createOrUpdateById).toHaveBeenCalledWith(expectedPub1._id, expectedPub1);
		});
	});

	describe("deletePublicationById", () => {
		it("should delete and return 200", async () => {
			mockPublicationService.deleteById.mockResolvedValue(expectedPub1);

			await publicationController.deletePublicationById(expectedPub1._id!);

			expect(publicationService.deleteById).toHaveBeenCalledWith(expectedPub1._id);
		});

		it("should return 400 when id missing", async () => {
			await expect(publicationController.deletePublicationById("")).rejects.toThrow(BadRequestException);
		});

		it("should return 500 when service throws", async () => {
			mockPublicationService.deleteById.mockImplementationOnce(() => {
				throw new Error("delete fail");
			});

			await expect(publicationController.deletePublicationById("507f1f77bcf86cd799439999")).rejects.toThrow();

			expect(publicationService.deleteById).toHaveBeenCalledWith("507f1f77bcf86cd799439999");
		});
	});

	describe("toggleLikePublication", () => {
		it("should toggle like and return 200", async () => {
			const updatedPub = {
				...expectedPub1,
				likes: ["507f1f77bcf86cd799439015"],
			};
			mockPublicationService.toggleLikePublication.mockResolvedValue(updatedPub);

			await publicationController.toggleLikePublication(expectedPub1._id!, "507f1f77bcf86cd799439015");

			expect(publicationService.toggleLikePublication).toHaveBeenCalledWith(
				expectedPub1._id,
				"507f1f77bcf86cd799439015",
			);
		});

		it("should return 400 when publication id is missing", async () => {
			await expect(publicationController.toggleLikePublication("", "507f1f77bcf86cd799439015")).rejects.toThrow(
				BadRequestException,
			);
		});

		it("should return 400 when user id is missing", async () => {
			await expect(publicationController.toggleLikePublication(expectedPub1._id!, "")).rejects.toThrow(
				BadRequestException,
			);
		});

		it("should return 500 when service throws error", async () => {
			mockPublicationService.toggleLikePublication.mockImplementationOnce(() => {
				throw new Error("toggle error");
			});

			await expect(
				publicationController.toggleLikePublication(expectedPub1._id!, "507f1f77bcf86cd799439015"),
			).rejects.toThrow();

			expect(publicationService.toggleLikePublication).toHaveBeenCalledWith(
				expectedPub1._id,
				"507f1f77bcf86cd799439015",
			);
		});
	});
});
