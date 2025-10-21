import { validate } from "class-validator";
import { CreateVoteDto } from "../../../src/vote/dto/createvote.dto";

describe("CreateVoteDto", () => {
	it("should fail when amount is less than 1", async () => {
		const dto = new CreateVoteDto();
		dto.amount = 0;
		dto.prediction_id = "507f1f77bcf86cd799439011";
		dto.option = "A";
		dto.date = new Date().toISOString();
		dto.user_id = "507f1f77bcf86cd799439012";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});
	it("should pass with valid data", async () => {
		const dto = new CreateVoteDto();
		dto.amount = 10;
		dto.prediction_id = "507f1f77bcf86cd799439011";
		dto.option = "A";
		dto.date = new Date().toISOString();
		dto.user_id = "507f1f77bcf86cd799439012";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should fail when amount missing", async () => {
		const dto = new CreateVoteDto();
		dto.prediction_id = "507f1f77bcf86cd799439011";
		dto.option = "A";
		dto.date = new Date().toISOString();
		dto.user_id = "507f1f77bcf86cd799439012";
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail when prediction_id missing", async () => {
		const dto = new CreateVoteDto();
		dto.amount = 10;
		dto.option = "A";
		dto.date = new Date().toISOString();
		dto.user_id = "507f1f77bcf86cd799439012";
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail when option missing", async () => {
		const dto = new CreateVoteDto();
		dto.amount = 10;
		dto.prediction_id = "507f1f77bcf86cd799439011";
		dto.date = new Date().toISOString();
		dto.user_id = "507f1f77bcf86cd799439012";
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail when date missing", async () => {
		const dto = new CreateVoteDto();
		dto.amount = 10;
		dto.prediction_id = "507f1f77bcf86cd799439011";
		dto.option = "A";
		dto.user_id = "507f1f77bcf86cd799439012";
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail when user_id missing", async () => {
		const dto = new CreateVoteDto();
		dto.amount = 10;
		dto.prediction_id = "507f1f77bcf86cd799439011";
		dto.option = "A";
		dto.date = new Date().toISOString();
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail when amount is not a number", async () => {
		const dto = new CreateVoteDto();
		dto.amount = "ten" as any;
		dto.prediction_id = "507f1f77bcf86cd799439011";
		dto.option = "A";
		dto.date = new Date().toISOString();
		dto.user_id = "507f1f77bcf86cd799439012";
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail when date is not ISO string", async () => {
		const dto = new CreateVoteDto();
		dto.amount = 10;
		dto.prediction_id = "507f1f77bcf86cd799439011";
		dto.option = "A";
		dto.date = "not-a-date";
		dto.user_id = "507f1f77bcf86cd799439012";
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});
});
