import { validate } from "class-validator";
import { CreatePredictionDto } from "../../../src/prediction/dto/createprediction.dto";

describe("CreatePredictionDto", () => {
	let dto: CreatePredictionDto;

	describe("title validation", () => {
		it("should pass when title is valid", async () => {
			dto = new CreatePredictionDto({
				title: "Valid title",
				dateFin: new Date(),
				options: { a: 1, b: 2 },
			});
			const errors = await validate(dto);
			expect(errors.length).toBe(0);
		});

		it("should fail when title is missing", async () => {
			dto = new CreatePredictionDto({ dateFin: new Date(), options: { a: 1 } as any });
			const errors = await validate(dto);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0].property).toBe("title");
		});

		it("should fail when title is too short", async () => {
			dto = new CreatePredictionDto({ title: "ab", dateFin: new Date(), options: { a: 1 } as any });
			const errors = await validate(dto);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0].property).toBe("title");
		});
	});

	describe("dateFin validation", () => {
		it("should pass when dateFin is a valid ISO date", async () => {
			dto = new CreatePredictionDto({
				title: "Valid title",
				dateFin: new Date(),
				options: { a: 1 },
			});
			const errors = await validate(dto);
			expect(errors.length).toBe(0);
		});

		it("should fail when dateFin is missing", async () => {
			dto = new CreatePredictionDto({ title: "Valid title", options: { a: 1 } as any });
			const errors = await validate(dto);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0].property).toBe("dateFin");
		});

		it("should fail when dateFin is not a valid date", async () => {
			dto = new CreatePredictionDto({
				title: "Valid title",
				dateFin: "not-a-date" as any,
				options: { a: 1 } as any,
			});
			const errors = await validate(dto);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0].property).toBe("dateFin");
		});
	});

	describe("options validation", () => {
		it("should pass when options is an object with numeric values", async () => {
			dto = new CreatePredictionDto({
				title: "Valid title",
				dateFin: new Date(),
				options: { a: 1, b: 2 },
			});
			const errors = await validate(dto);
			expect(errors.length).toBe(0);
		});

		it("should fail when options is missing", async () => {
			dto = new CreatePredictionDto({ title: "Valid title", dateFin: new Date() } as any);
			const errors = await validate(dto);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0].property).toBe("options");
		});

		it("should fail when options is not an object", async () => {
			dto = new CreatePredictionDto({
				title: "Valid title",
				dateFin: new Date(),
				options: "not-an-object" as any,
			});
			const errors = await validate(dto);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0].property).toBe("options");
		});
	});

	describe("status validation", () => {
		it("should pass when status is a valid enum value", async () => {
			dto = new CreatePredictionDto({
				title: "Valid title",
				dateFin: new Date(),
				options: { a: 1 },
				status: undefined as any,
			});
			const errors = await validate(dto);
			expect(errors.length).toBe(0);
		});
	});
});
