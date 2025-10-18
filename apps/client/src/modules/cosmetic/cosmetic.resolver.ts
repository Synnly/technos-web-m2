import { userService } from "../user/user.service";
import { CosmeticService } from "./cosmetic.service";

export const CosmeticResolver = {
	async getAll(token: string) {
		return await CosmeticService.getAll(token);
	},

	async getUser(username: string, token: string) {
		return await userService.getUserByUsername(username, token);
	},

	async apply(username: string, current: string[], token: string) {
		return await CosmeticService.applyCosmetic(username, current, token);
	},

	normalize(arr?: Array<string | null | any>): string[] {
		if (!arr) return [];
		return arr
			.map((v) =>
				v && typeof v === "object"
					? String((v as any)._id ?? v)
					: String(v),
			)
			.slice(0, 2);
	},
};
