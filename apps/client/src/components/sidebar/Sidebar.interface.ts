import type { User } from "../../modules/user/user.interface";

export interface SidebarProps {
	user: User;
	token: string;
	setUser: (user: User) => void;
	setPoints: (points: number) => void;
	setToast: (message: string) => void;
}
