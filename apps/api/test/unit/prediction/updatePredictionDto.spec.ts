import { validate } from "class-validator";
import { UpdatePredictionDto } from "../../../src/prediction/dto/updateprediction.dto";
import { PredictionStatus } from "../../../src/prediction/prediction.schema";

describe("UpdatePredictionDto", () => {
	let dto: UpdatePredictionDto;

	describe("title validation", () => {
		it("should pass when title is valid", async () => {
			dto = new UpdatePredictionDto({ title: "Valid title" });
			const errors = await validate(dto);
			expect(errors.length).toBe(0);
		});

		it("should fail when title is too short", async () => {
			dto = new UpdatePredictionDto({ title: "ab" });
			const errors = await validate(dto);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0].property).toBe("title");
		});

		it("should fail when title is not a string", async () => {
			dto = new UpdatePredictionDto({ title: 123 as any });
			const errors = await validate(dto);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0].property).toBe("title");
		});

		it("should fail when title is empty string", async () => {
			dto = new UpdatePredictionDto({ title: "" });
			const errors = await validate(dto);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0].property).toBe("title");
		});
	});

	describe("dateFin validation", () => {
		it("should pass when dateFin is a valid ISO date", async () => {
			dto = new UpdatePredictionDto({ dateFin: new Date() });
			const errors = await validate(dto);
			expect(errors.length).toBe(0);
		});

		it("should fail when dateFin is not a valid date", async () => {
			dto = new UpdatePredictionDto({ dateFin: "not-a-date" as any });
			const errors = await validate(dto);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0].property).toBe("dateFin");
		});
	});

	describe("options validation", () => {
		it("should pass when options is an object with numeric values", async () => {
			dto = new UpdatePredictionDto({ options: { a: 1, b: 2 } });
			const errors = await validate(dto);
			expect(errors.length).toBe(0);
		});

		it("should fail when options is not an object", async () => {
			dto = new UpdatePredictionDto({ options: "not-an-object" as any });
			const errors = await validate(dto);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0].property).toBe("options");
		});

		it("should pass when options is omitted", async () => {
			dto = new UpdatePredictionDto({});
			const errors = await validate(dto);
			expect(errors.length).toBe(0);
		});
	});

	describe("status validation", () => {
		it("should pass when status is a valid enum value", async () => {
			dto = new UpdatePredictionDto({ status: undefined as any });
			const errors = await validate(dto);
			expect(errors.length).toBe(0);
		});

		it("should pass when status is a valid enum value (explicit)", async () => {
			dto = new UpdatePredictionDto({ status: PredictionStatus.Valid });
			const errors = await validate(dto);
			expect(errors.length).toBe(0);
		});

		it("should fail when status is invalid", async () => {
			dto = new UpdatePredictionDto({ status: "NOT_VALID" as any });
			const errors = await validate(dto);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0].property).toBe("status");
		});
	});

	describe("result validation", () => {
		it("should pass when result is a string", async () => {
			dto = new UpdatePredictionDto({ result: "optionA" });
			const errors = await validate(dto);
			expect(errors.length).toBe(0);
		});

		it("should fail when result is not a string", async () => {
			dto = new UpdatePredictionDto({ result: 123 as any });
			const errors = await validate(dto);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0].property).toBe("result");
		});
	});

	describe("description validation", () => {
		it("should pass when description is a string", async () => {
			dto = new UpdatePredictionDto({ description: "A description" });
			const errors = await validate(dto);
			expect(errors.length).toBe(0);
		});

		it("should fail when description is not a string", async () => {
			dto = new UpdatePredictionDto({ description: 123 as any });
			const errors = await validate(dto);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0].property).toBe("description");
		});
	});
});
