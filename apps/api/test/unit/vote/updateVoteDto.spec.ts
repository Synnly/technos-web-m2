import { validate } from "class-validator";
import { UpdateVoteDto } from "../../../src/vote/dto/updatevote.dto";

describe("UpdateVoteDto", () => {
	it("should pass with no fields", async () => {
		const dto = new UpdateVoteDto();
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should pass with valid amount", async () => {
		const dto = new UpdateVoteDto();
		dto.amount = 5;
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should pass with valid prediction_id", async () => {
		const dto = new UpdateVoteDto();
		dto.prediction_id = "507f1f77bcf86cd799439011";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should pass with valid option", async () => {
		const dto = new UpdateVoteDto();
		dto.option = "B";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should pass with valid date", async () => {
		const dto = new UpdateVoteDto();
		dto.date = new Date().toISOString();
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should pass with valid user_id", async () => {
		const dto = new UpdateVoteDto();
		dto.user_id = "507f1f77bcf86cd799439012";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should fail with amount as string", async () => {
		const dto = new UpdateVoteDto();
		dto.amount = "five" as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail with date as invalid string", async () => {
		const dto = new UpdateVoteDto();
		dto.date = "not-a-date";
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});
});
