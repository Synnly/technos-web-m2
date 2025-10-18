import { validate } from "class-validator";
import { UpdateUserDto } from "../../../src/user/dto/updateuser.dto";

describe("UpdateUserDto", () => {
	let dto: UpdateUserDto;

	beforeEach(() => {});

	describe("username validation", () => {
		it("should pass when username is a valid non-empty string", async () => {
			dto = new UpdateUserDto({ username: "validUser", motDePasse: "StrongPass1!" });

			const errors = await validate(dto);
			expect(errors.length).toBe(0);
		});

		it("should fail when username is missing", async () => {
			dto = new UpdateUserDto({ motDePasse: "StrongPass1!" });

			const errors = await validate(dto);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0].property).toBe("username");
		});

		it("should fail when username is not a string", async () => {
			dto = new UpdateUserDto({ username: 123 as any, motDePasse: "StrongPass1!" });

			const errors = await validate(dto);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0].property).toBe("username");
		});

		it("should fail when username is an empty string", async () => {
			dto = new UpdateUserDto({ username: "", motDePasse: "StrongPass1!" });

			const errors = await validate(dto);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0].property).toBe("username");
		});
	});

	describe("motDePasse validation", () => {
		it("should pass when motDePasse meets strong password criteria", async () => {
			dto = new UpdateUserDto({ username: "validUser", motDePasse: "StrongPass1!" });

			const errors = await validate(dto);
			expect(errors.length).toBe(0);
		});

		it("should fail when motDePasse is not a string", async () => {
			dto = new UpdateUserDto({ username: "validUser", motDePasse: 12345678 as any });

			const errors = await validate(dto);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0].property).toBe("motDePasse");
		});

		it("should fail when motDePasse is an empty string", async () => {
			dto = new UpdateUserDto({ username: "validUser", motDePasse: "" });

			const errors = await validate(dto);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0].property).toBe("motDePasse");
		});

		it("should fail when motDePasse is missing a number", async () => {
			dto = new UpdateUserDto({ username: "validUser", motDePasse: "WeakPass!" });

			const errors = await validate(dto);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0].property).toBe("motDePasse");
		});

		it("should fail when motDePasse is missing an uppercase letter", async () => {
			dto = new UpdateUserDto({ username: "validUser", motDePasse: "weakpass1!" });

			const errors = await validate(dto);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0].property).toBe("motDePasse");
		});

		it("should fail when motDePasse is missing a lowercase letter", async () => {
			dto = new UpdateUserDto({ username: "validUser", motDePasse: "WEAKPASS1!" });

			const errors = await validate(dto);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0].property).toBe("motDePasse");
		});

		it("should fail when motDePasse is missing a symbol", async () => {
			dto = new UpdateUserDto({ username: "validUser", motDePasse: "WeakPass1" });

			const errors = await validate(dto);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0].property).toBe("motDePasse");
		});

		it("should fail when motDePasse is too short", async () => {
			dto = new UpdateUserDto({ username: "validUser", motDePasse: "Wp1!" });

			const errors = await validate(dto);
			expect(errors.length).toBeGreaterThan(0);
			expect(errors[0].property).toBe("motDePasse");
		});
	});

    describe("points validation", () => {
        it("should pass when points is a positive number", async () => {
            dto = new UpdateUserDto({username: "validUser", points: 10});

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it("should pass when points is zero", async () => {
            dto = new UpdateUserDto({username: "validUser", points: 0});
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it("should fail when points is a negative number", async () => {
            dto = new UpdateUserDto({username: "validUser", points: -5});

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe("points");
        });

        it("should fail when points is not a number", async () => {
            dto = new UpdateUserDto({username: "validUser", points: "ten" as any});

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe("points");
        });
    });

    describe("dateDerniereRecompenseQuotidienne validation", () => {
        it("should pass when dateDerniereRecompenseQuotidienne is a valid date", async () => {
            dto = new UpdateUserDto({username: "validUser", dateDerniereRecompenseQuotidienne: new Date()});

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it("should pass when dateDerniereRecompenseQuotidienne is null", async () => {
            dto = new UpdateUserDto({username: "validUser", dateDerniereRecompenseQuotidienne: null});

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it("should fail when dateDerniereRecompenseQuotidienne is not a valid date", async () => {
            dto = new UpdateUserDto({username: "validUser", dateDerniereRecompenseQuotidienne: "invalid-date" as any});

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe("dateDerniereRecompenseQuotidienne");
        });
    });

    describe("predictions validation", () => {
        it("should pass when predictions is an array of ids", async () => {
            dto = new UpdateUserDto({username: "validUser", predictions: ["pred1", "pred2"]});
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it("should fail when predictions is not an array", async () => {
            dto = new UpdateUserDto({username: "validUser", predictions: "not-an-array" as any});

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe("predictions");
        });

        it("should fail when predictions contains non-string elements", async () => {
            dto = new UpdateUserDto({username: "validUser", predictions: ["pred1", 123 as any]});

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe("predictions");
        });

        it("should fail when predictions contains empty strings", async () => {
            dto = new UpdateUserDto({username: "validUser", predictions: ["pred1", ""]});

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe("predictions");
        });
    });

    describe("votes validation", () => {
        it("should pass when votes is an array of ids", async () => {
            dto = new UpdateUserDto({username: "validUser", votes: ["vote1", "vote2"]});
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it("should fail when votes is not an array", async () => {
            dto = new UpdateUserDto({username: "validUser", votes: "not-an-array" as any});

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe("votes");
        });

        it("should fail when votes contains non-string elements", async () => {
            dto = new UpdateUserDto({username: "validUser", votes: ["vote1", 123 as any]});

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe("votes");
        });

        it("should fail when votes contains empty strings", async () => {
            dto = new UpdateUserDto({username: "validUser", votes: ["vote1", ""]});

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe("votes");
        });
    });

    describe("role validation", () => {
        it("should pass when role is a valid string", async () => {
            dto = new UpdateUserDto({username: "validUser", role: "admin"});
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it("should fail when role is not a string", async () => {
            dto = new UpdateUserDto({username: "validUser", role: 123 as any});

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe("role");
        });

        it("should fail when role is an empty string", async () => {
            dto = new UpdateUserDto({username: "validUser", role: ""});

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe("role");
        });
    });

    describe("cosmeticsOwned validation", () => {
        it("should pass when cosmeticsOwned is an array of ids", async () => {
            dto = new UpdateUserDto({username: "validUser", cosmeticsOwned: ["cosmetic1", "cosmetic2"]});
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it("should fail when cosmeticsOwned is not an array", async () => {
            dto = new UpdateUserDto({username: "validUser", cosmeticsOwned: "not-an-array" as any});

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe("cosmeticsOwned");
        });

        it("should fail when cosmeticsOwned contains non-string elements", async () => {
            dto = new UpdateUserDto({username: "validUser", cosmeticsOwned: ["cosmetic1", 123 as any]});

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe("cosmeticsOwned");
        });

        it("should fail when cosmeticsOwned contains empty strings", async () => {
            dto = new UpdateUserDto({username: "validUser", cosmeticsOwned: ["cosmetic1", ""]});

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe("cosmeticsOwned");
        });
    });

    describe("currentCosmetic validation", () => {
        it("should pass when currentCosmetic is an array of two ids or nulls", async () => {
            dto = new UpdateUserDto({username: "validUser", currentCosmetic: ["cosmetic1", null]});
            let errors = await validate(dto);
            expect(errors.length).toBe(0);

            dto = new UpdateUserDto({username: "validUser", currentCosmetic: [null, "cosmetic2"]});
            errors = await validate(dto);
            expect(errors.length).toBe(0);

            dto = new UpdateUserDto({username: "validUser", currentCosmetic: ["cosmetic1", "cosmetic2"]});
            errors = await validate(dto);
            expect(errors.length).toBe(0);

            dto = new UpdateUserDto({username: "validUser", currentCosmetic: [null, null]});
            errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it("should fail when currentCosmetic is not an array", async () => {
            dto = new UpdateUserDto({username: "validUser", currentCosmetic: "not-an-array" as any});

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe("currentCosmetic");
        });

        it("should fail when currentCosmetic does not have exactly two elements", async () => {
            dto = new UpdateUserDto({username: "validUser", currentCosmetic: ["only-one"] as any});

            let errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe("currentCosmetic");

            dto = new UpdateUserDto({username: "validUser", currentCosmetic: ["too", "many", "elements"] as any});

            errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe("currentCosmetic");
        });

        it("should fail when currentCosmetic contains invalid elements", async () => {
            dto = new UpdateUserDto({username: "validUser", currentCosmetic: ["valid", 123 as any]});

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe("currentCosmetic");
        });
    });
});
