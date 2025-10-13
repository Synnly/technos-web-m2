import { Package2 } from "lucide-react";
import type { AccountTabItem } from "./types/AccountTabItem.interface";

export function makeCosmeticsTab(): AccountTabItem {
	return {
		key: "2",
		label: (
			<span className="flex items-center gap-2 text-gray-300">
				<Package2 className="w-4 h-4" />
				Cosmétiques
			</span>
		),
		children: (
			<div className="p-4 text-gray-200">
				<h3 className="text-lg font-semibold mb-2">Vos cosmétiques</h3>
				<span> affiché les cosmétiques ici, pouvoir en changer</span>
			</div>
		),
	};
}

export default makeCosmeticsTab;
