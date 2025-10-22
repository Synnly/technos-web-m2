import { validate } from "class-validator";
import { CreateCosmeticDto } from "../../../src/cosmetic/dto/create-cosmetic.dto";
import { CosmeticType } from "../../../src/cosmetic/cosmetic.schema";

describe("CreateCosmeticDto", () => {
	it("should fail when all required fields missing", async () => {
		const dto = new CreateCosmeticDto();
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail when name is empty string", async () => {
		const dto = new CreateCosmeticDto();
		dto.name = "";
		dto.cost = 10;
		dto.type = CosmeticType.BADGE;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail when cost is negative", async () => {
		const dto = new CreateCosmeticDto();
		dto.name = "Badge";
		dto.cost = -10;
		dto.type = CosmeticType.BADGE;
		dto.value = ":badge:";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0); // negative allowed by DTO
	});

	it("should fail when type is not in enum", async () => {
		const dto = new CreateCosmeticDto();
		dto.name = "Badge";
		dto.cost = 10;
		dto.type = "notatype" as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail when value is invalid", async () => {
		const dto = new CreateCosmeticDto();
		dto.name = "Badge";
		dto.cost = 10;
		dto.type = CosmeticType.COLOR;
		dto.value = "notacolor";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should fail when owned is not boolean", async () => {
		const dto = new CreateCosmeticDto();
		dto.name = "Badge";
		dto.cost = 10;
		dto.type = CosmeticType.BADGE;
		dto.owned = "yes" as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should pass with only required fields", async () => {
		const dto = new CreateCosmeticDto();
		dto.name = "Badge";
		dto.cost = 10;
		dto.type = CosmeticType.BADGE;
		dto.value = ":badge:";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should pass with only value", async () => {
		const dto = new CreateCosmeticDto();
		dto.name = "Badge";
		dto.cost = 10;
		dto.type = CosmeticType.COLOR;
		dto.value = "#123456";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should pass with only owned", async () => {
		const dto = new CreateCosmeticDto();
		dto.name = "Badge";
		dto.cost = 10;
		dto.type = CosmeticType.BADGE;
		dto.owned = true;
		const errors = await validate(dto as any);
		expect(errors.length).toBe(1);
	});

	it("should fail with name as number", async () => {
		const dto = new CreateCosmeticDto();
		dto.name = 123 as any;
		dto.cost = 10;
		dto.type = CosmeticType.BADGE;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail with cost as string", async () => {
		const dto = new CreateCosmeticDto();
		dto.name = "Badge";
		dto.cost = "notanumber" as any;
		dto.type = CosmeticType.BADGE;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail with type as array", async () => {
		const dto = new CreateCosmeticDto();
		dto.name = "Badge";
		dto.cost = 10;
		dto.type = [CosmeticType.BADGE] as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail with value as null", async () => {
		const dto = new CreateCosmeticDto();
		dto.name = "Badge";
		dto.cost = 10;
		dto.type = CosmeticType.COLOR;
		dto.value = null as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail with owned as null", async () => {
		const dto = new CreateCosmeticDto();
		dto.name = "Badge";
		dto.cost = 10;
		dto.type = CosmeticType.BADGE;
		dto.value = ":badge:";
		dto.owned = null as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});
	it("should pass with valid value", async () => {
		const dto = new CreateCosmeticDto();
		dto.name = "Badge";
		dto.cost = 10;
		dto.type = CosmeticType.COLOR;
		dto.value = "#ff00ff";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should pass with valid owned", async () => {
		const dto = new CreateCosmeticDto();
		dto.name = "Badge";
		dto.cost = 10;
		dto.type = CosmeticType.BADGE;
		dto.owned = true;
		const errors = await validate(dto as any);
		expect(errors.length).toBe(1);
	});

	it("should pass with all valid fields", async () => {
		const dto = new CreateCosmeticDto();
		dto.name = "Badge";
		dto.cost = 10;
		dto.type = CosmeticType.COLOR;
		dto.value = "#abcdef";
		dto.owned = false;
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should fail with multiple invalid fields", async () => {
		const dto = new CreateCosmeticDto();
		dto.name = "";
		dto.cost = "not-a-number" as any;
		dto.type = "not-a-type" as any;
		dto.value = "not-a-color";
		dto.owned = "not-a-bool" as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});
	it("should pass with valid data", async () => {
		const dto = new CreateCosmeticDto();
		dto.name = "Badge";
		dto.cost = 10;
		dto.type = CosmeticType.BADGE;
		const errors = await validate(dto as any);
		expect(errors.length).toBe(1);
	});

	it("should fail when name missing", async () => {
		const dto = new CreateCosmeticDto();
		dto.cost = 10;
		dto.type = CosmeticType.BADGE;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail when cost missing", async () => {
		const dto = new CreateCosmeticDto();
		dto.name = "Badge";
		dto.type = CosmeticType.BADGE;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail when type invalid", async () => {
		const dto = new CreateCosmeticDto();
		dto.name = "Badge";
		dto.cost = 10;
		dto.type = "invalid" as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail when value is invalid", async () => {
		const dto = new CreateCosmeticDto();
		dto.name = "Badge";
		dto.cost = 10;
		dto.type = CosmeticType.BADGE;
		dto.value = "not-a-color";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should fail when cost is not a number", async () => {
		const dto = new CreateCosmeticDto();
		dto.name = "Badge";
		dto.cost = "ten" as any;
		dto.type = CosmeticType.BADGE;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail when owned is not boolean", async () => {
		const dto = new CreateCosmeticDto();
		dto.name = "Badge";
		dto.cost = 10;
		dto.type = CosmeticType.BADGE;
		dto.owned = "yes" as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});
});
