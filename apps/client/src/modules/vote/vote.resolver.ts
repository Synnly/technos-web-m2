import { VoteService } from "./vote.service";

export const VoteResolver = {
	async getAllVotes(token: string) {
		return VoteService.getAllVotes(token);
	},
};
