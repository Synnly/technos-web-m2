import type { User } from "../../modules/user/user.interface";
import type { Toast } from "../toast/Toast.interface";

export interface SidebarProps {
	user: User;
	token: string;
	setUser: (user: User) => void;
	setPoints: (points: number) => void;
	setToast: React.Dispatch<React.SetStateAction<Toast | null>>;
	onPredictionCreated?: () => void;
	onCollapsedChange?: (collapsed: boolean) => void;
}
