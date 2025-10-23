import 'reflect-metadata'; // Sans cet import, les tests de validation échouent
import { validate } from "class-validator";
import { UpdatePublicationDto } from "../../../src/publication/dto/update-publication.dto";

describe("UpdatePublicationDto", () => {
	it("should pass when empty (all optional)", async () => {
		const dto = new UpdatePublicationDto({});
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should pass with message only", async () => {
		const dto = new UpdatePublicationDto({});
		dto.message = "Updated";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should fail when datePublication is invalid", async () => {
		const dto = new UpdatePublicationDto({});
		dto.datePublication = "not-a-date" as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});
	
	it("should fail when likes is not an array", async () => {
		const dto = new UpdatePublicationDto({});
		dto.likes = "not-array" as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});
	
	it("should fail when likes contains empty string", async () => {
		const dto = new UpdatePublicationDto({});
		dto.likes = [""];
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});
	
	it("should fail when parentPublication_id is empty string", async () => {
		const dto = new UpdatePublicationDto({});
		dto.parentPublication_id = "";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});
});
