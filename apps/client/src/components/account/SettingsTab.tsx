import { Settings } from "lucide-react";
import type { AccountTabItem } from "./types/AccountTabItem.interface";

export function makeSettingsTab(): AccountTabItem {
	return {
		key: "3",
		label: (
			<span className="flex items-center gap-2 text-gray-300">
				<Settings className="w-4 h-4" />
				Paramètres
			</span>
		),
		children: <div className="p-4 text-gray-200"></div>,
	};
}

export default makeSettingsTab;
