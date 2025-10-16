import { Package2 } from "lucide-react";
import CosmeticPicker from "../cosmetics/CosmeticPicker";

export const CosmeticsLabel = (
	<span className="flex items-center gap-2 text-gray-300">
		<Package2 className="w-4 h-4" />
		Cosmétiques
	</span>
);

type Props = {
	username?: string | null;
};

export default function CosmeticsTab({ username }: Props) {
	return (
		<div className="p-4 text-gray-200">
			{username && <CosmeticPicker username={username} />}
		</div>
	);
}
