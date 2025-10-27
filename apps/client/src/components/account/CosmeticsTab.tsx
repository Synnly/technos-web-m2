import { Package2 } from "lucide-react";
import CosmeticPicker from "../cosmetics/cosmetic-picker/CosmeticPicker";

export const CosmeticsLabel = (
	<span className="flex items-center gap-2 text-gray-300">
		<Package2 className="w-4 h-4" />
		Cosmétiques
	</span>
);

const CosmeticsTab = ({ user, setCurrentCosmetics }: any) => {
	return <div className="p-4 text-gray-200">{user && <CosmeticPicker user={user} setCurrentCosmetics={setCurrentCosmetics} />}</div>;
}

export default CosmeticsTab;
