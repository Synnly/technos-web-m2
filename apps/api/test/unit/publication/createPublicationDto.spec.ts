import 'reflect-metadata'; // Sans cet import, les tests de validation échouent
import { validate } from "class-validator";
import { CreatePublicationDto } from "../../../src/publication/dto/create-publication.dto";

describe("CreatePublicationDto", () => {
	it("should pass with valid data", async () => {
		const dto = new CreatePublicationDto({});
		dto.message = "Hello world";
		dto.datePublication = new Date();
		dto.prediction_id = "507f1f77bcf86cd799439011";
		dto.user_id = "507f1f77bcf86cd799439012";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should fail when message missing", async () => {
		const dto = new CreatePublicationDto({});
		dto.datePublication = new Date();
		dto.prediction_id = "507f1f77bcf86cd799439011";
		dto.user_id = "507f1f77bcf86cd799439012";
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail when datePublication missing", async () => {
		const dto = new CreatePublicationDto({});
		dto.message = "Hi";
		dto.prediction_id = "507f1f77bcf86cd799439011";
		dto.user_id = "507f1f77bcf86cd799439012";
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail when prediction_id missing", async () => {
		const dto = new CreatePublicationDto({});
		dto.message = "Hi";
		dto.datePublication = new Date();
		dto.user_id = "507f1f77bcf86cd799439012";
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail when user_id missing", async () => {
		const dto = new CreatePublicationDto({});
		dto.message = "Hi";
		dto.datePublication = new Date();
		dto.prediction_id = "507f1f77bcf86cd799439011";
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should accept optional likes array", async () => {
		const dto = new CreatePublicationDto({});
		dto.message = "Hi";
		dto.datePublication = new Date();
		dto.prediction_id = "507f1f77bcf86cd799439011";
		dto.user_id = "507f1f77bcf86cd799439012";
		dto.likes = ["507f1f77bcf86cd799439013"];
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});
    
	it("should fail when likes is not an array", async () => {
		const dto = new CreatePublicationDto({});
		dto.message = "Hi";
		dto.datePublication = new Date();
		dto.prediction_id = "507f1f77bcf86cd799439011";
		dto.user_id = "507f1f77bcf86cd799439012";
		dto.likes = "not-an-array" as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});
    
	it("should fail when likes contains empty string", async () => {
		const dto = new CreatePublicationDto({});
		dto.message = "Hi";
		dto.datePublication = new Date();
		dto.prediction_id = "507f1f77bcf86cd799439011";
		dto.user_id = "507f1f77bcf86cd799439012";
		dto.likes = [""];
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});
    
	it("should fail when datePublication is invalid", async () => {
		const dto = new CreatePublicationDto({});
		dto.message = "Hi";
		dto.datePublication = "not-a-date" as any;
		dto.prediction_id = "507f1f77bcf86cd799439011";
		dto.user_id = "507f1f77bcf86cd799439012";
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});
    
	it("should fail when parentPublication_id is provided but empty", async () => {
		const dto = new CreatePublicationDto({});
		dto.message = "Hi";
		dto.datePublication = new Date();
		dto.prediction_id = "507f1f77bcf86cd799439011";
		dto.user_id = "507f1f77bcf86cd799439012";
		dto.parentPublication_id = "";
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});
});
