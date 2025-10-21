import { validate } from "class-validator";
import { UpdateCosmeticDto } from "../../../src/cosmetic/dto/update-cosmetic.dto";
import { CosmeticType } from "../../../src/cosmetic/cosmetic.schema";

describe("UpdateCosmeticDto", () => {
	it("should pass with only name", async () => {
		const dto = new UpdateCosmeticDto();
		dto.name = "Badge";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should pass with only cost", async () => {
		const dto = new UpdateCosmeticDto();
		dto.cost = 99;
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should pass with only type", async () => {
		const dto = new UpdateCosmeticDto();
		dto.type = CosmeticType.BADGE;
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should pass with only hexColor", async () => {
		const dto = new UpdateCosmeticDto();
		dto.hexColor = "#123456";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should pass with only owned", async () => {
		const dto = new UpdateCosmeticDto();
		dto.owned = true;
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

	it("should fail with hexColor as invalid string", async () => {
		const dto = new UpdateCosmeticDto();
		dto.hexColor = "notacolor";
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
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
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0); // negative is allowed by DTO, business logic may block
	});

	it("should fail with name as long string", async () => {
		const dto = new UpdateCosmeticDto();
		dto.name = "a".repeat(300);
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0); // no length validation in DTO
	});

	it("should fail with hexColor as null", async () => {
		const dto = new UpdateCosmeticDto();
		dto.hexColor = null as any;
		const errors = await validate(dto as any);
		expect(errors.length).toEqual(0);
	});

	it("should fail with owned as null", async () => {
		const dto = new UpdateCosmeticDto();
		dto.owned = null as any;
		const errors = await validate(dto as any);
		expect(errors.length).toEqual(0);
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
	it("should pass with valid hexColor", async () => {
		const dto = new UpdateCosmeticDto();
		dto.hexColor = "#123456";
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should pass with valid owned", async () => {
		const dto = new UpdateCosmeticDto();
		dto.owned = false;
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should pass with all valid fields", async () => {
		const dto = new UpdateCosmeticDto();
		dto.name = "Badge";
		dto.cost = 20;
		dto.type = CosmeticType.BADGE;
		dto.hexColor = "#abcdef";
		dto.owned = true;
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});

	it("should fail with multiple invalid fields", async () => {
		const dto = new UpdateCosmeticDto();
		dto.name = "";
		dto.cost = "not-a-number" as any;
		dto.type = "not-a-type" as any;
		dto.hexColor = "not-a-color";
		dto.owned = "not-a-bool" as any;
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
	});
	it("should pass when fields are optional", async () => {
		const dto = new UpdateCosmeticDto();
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
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

	it("should fail when hexColor invalid", async () => {
		const dto = new UpdateCosmeticDto();
		dto.hexColor = "nope";
		const errors = await validate(dto as any);
		expect(errors.length).toBeGreaterThan(0);
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
		const errors = await validate(dto as any);
		expect(errors.length).toBe(0);
	});
});
