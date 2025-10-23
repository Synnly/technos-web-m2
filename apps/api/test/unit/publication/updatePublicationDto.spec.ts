import { validate } from "class-validator";
import { UpdatePublicationDto } from "../../../src/publication/dto/update-publication.dto";

describe("UpdatePublicationDto", () => {
	it("should pass when empty (all optional)", async () => {
		const dto = new UpdatePublicationDto();
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should pass with message only", async () => {
		const dto = new UpdatePublicationDto();
		dto.message = "Updated";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should fail when datePublication is invalid", async () => {
		const dto = new UpdatePublicationDto();
		dto.datePublication = "not-a-date" as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});
});
