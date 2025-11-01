import type { User } from "../../../modules/user/user.interface";

export interface CosmeticPickerProps {
	user: User;
	setCurrentCosmetics: (cosmetics: (string | null)[]) => void;
}
