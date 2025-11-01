import type { Cosmetic } from "../../modules/cosmetic/cosmetic.interface";
import type { PredictionStatus } from "../../modules/prediction/prediction.interface";
import type { PublicUser } from "../../modules/user/user.interface";

export interface PredictionCardProps {
	id: string;
	title: string;
	author?: PublicUser;
	votes?: string | number;
	comments?: string | number;
	percent?: number;
	mostVotedOption?: string;
	endsIn?: string;
	onClick?: (id: string) => void;
	className?: string;
	status? : PredictionStatus;
	result? : string;
	cosmetics: Cosmetic[];
}
