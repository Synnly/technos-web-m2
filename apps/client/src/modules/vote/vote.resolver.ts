import { VoteService } from "./vote.service";

export const VoteResolver = {
	async getAllVotes(token: string) {
		return VoteService.getAllVotes(token);
	},

	async createVote(
		amount: number,
		prediction_id: string,
		option: string,
		user_id: string,
		token: string,
	) {
		return VoteService.createVote(amount - (amount % 1), prediction_id, option, new Date(), user_id, token);
	}
};
