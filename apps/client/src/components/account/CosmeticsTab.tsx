import { Package2 } from "lucide-react";
import CosmeticPicker from "../cosmetics/cosmetic-picker/CosmeticPicker";
import type { User } from "../../modules/user/user.interface";

export const CosmeticsLabel = (
	<span className="flex items-center gap-2 text-gray-300">
		<Package2 className="w-4 h-4" />
		Cosmétiques
	</span>
);

type Props = {
	user: User;
};

export default function CosmeticsTab({ user }: Props) {
	return (
		<div className="p-4 text-gray-200">
			{user && <CosmeticPicker user={user} />}
		</div>
	);
}
