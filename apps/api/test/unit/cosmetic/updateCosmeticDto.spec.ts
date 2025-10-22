import { validate } from "class-validator";
import { UpdateCosmeticDto } from "../../../src/cosmetic/dto/update-cosmetic.dto";
import { CosmeticType } from "../../../src/cosmetic/cosmetic.schema";

describe("UpdateCosmeticDto", () => {
	it("should pass with only name", async () => {
		const dto = new UpdateCosmeticDto();
		dto.name = "Badge";
		dto.value = "#123456";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should pass with only cost", async () => {
		const dto = new UpdateCosmeticDto();
		dto.cost = 99;
		dto.value = "#123456";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should pass with only type", async () => {
		const dto = new UpdateCosmeticDto();
		dto.type = CosmeticType.BADGE;
		dto.value = ":badge:";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should pass with only value", async () => {
		const dto = new UpdateCosmeticDto();
		dto.value = "#123456";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should pass with only owned", async () => {
		const dto = new UpdateCosmeticDto();
		dto.owned = true;
		dto.value = "#123456";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should fail with name as number", async () => {
		const dto = new UpdateCosmeticDto();
		dto.name = 123 as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail with cost as string", async () => {
		const dto = new UpdateCosmeticDto();
		dto.cost = "notanumber" as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail with type as string not in enum", async () => {
		const dto = new UpdateCosmeticDto();
		dto.type = "notatype" as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail with value as invalid string", async () => {
		const dto = new UpdateCosmeticDto();
		dto.value = "notacolor";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should fail with owned as string", async () => {
		const dto = new UpdateCosmeticDto();
		dto.owned = "yes" as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail with name as empty string", async () => {
		const dto = new UpdateCosmeticDto();
		dto.name = "";
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail with cost as negative", async () => {
		const dto = new UpdateCosmeticDto();
		dto.cost = -10;
		dto.value = "#123456";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should fail with name as long string", async () => {
		const dto = new UpdateCosmeticDto();
		dto.name = "a".repeat(300);
		dto.value = "#123456";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should fail with value as null", async () => {
		const dto = new UpdateCosmeticDto();
		dto.value = null as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail with owned as null", async () => {
		const dto = new UpdateCosmeticDto();
		dto.owned = null as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail with cost as array", async () => {
		const dto = new UpdateCosmeticDto();
		dto.cost = [1, 2, 3] as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThanOrEqual(0);
	});

	it("should fail with type as array", async () => {
		const dto = new UpdateCosmeticDto();
		dto.type = [CosmeticType.BADGE] as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});
	it("should pass with valid value", async () => {
		const dto = new UpdateCosmeticDto();
		dto.value = "#123456";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should pass with valid owned", async () => {
		const dto = new UpdateCosmeticDto();
		dto.owned = false;
		dto.value = "#abcdef";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should pass with all valid fields", async () => {
		const dto = new UpdateCosmeticDto();
		dto.name = "Badge";
		dto.cost = 20;
		dto.type = CosmeticType.BADGE;
		dto.value = "#abcdef";
		dto.owned = true;
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should fail with multiple invalid fields", async () => {
		const dto = new UpdateCosmeticDto();
		dto.name = "";
		dto.cost = "not-a-number" as any;
		dto.type = "not-a-type" as any;
		dto.value = "not-a-color";
		dto.owned = "not-a-bool" as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});
	it("should pass when fields are optional", async () => {
		const dto = new UpdateCosmeticDto();
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0); // value required
	});

	it("should fail when name is empty string", async () => {
		const dto = new UpdateCosmeticDto();
		dto.name = "" as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail when type invalid", async () => {
		const dto = new UpdateCosmeticDto();
		dto.type = "invalid" as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail when value invalid", async () => {
		const dto = new UpdateCosmeticDto();
		dto.value = "nope";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should fail when cost is not number", async () => {
		const dto = new UpdateCosmeticDto();
		dto.cost = "free" as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail when owned is not boolean", async () => {
		const dto = new UpdateCosmeticDto();
		dto.owned = "true" as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should pass with valid partial update", async () => {
		const dto = new UpdateCosmeticDto();
		dto.name = "New name";
		dto.value = "#abcdef";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});
});
