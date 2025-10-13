import { User } from "lucide-react";
import type { AccountTabItem } from "./types/AccountTabItem.interface";

export const makeAccountInfoTab = (): AccountTabItem => {
	return {
		key: "1",
		label: (
			<span className="flex items-center gap-2 text-gray-300">
				<User className="w-4 h-4" />
				Mon compte
			</span>
		),
		children: (
			<div className="p-4 text-gray-200">
				<h3 className="text-lg font-semibold mb-2">
					Informations du compte
				</h3>
				<span>Affiché les informations du compte ici</span>
			</div>
		),
	};
};

export default makeAccountInfoTab;
