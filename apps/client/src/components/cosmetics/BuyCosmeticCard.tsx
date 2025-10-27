import ColorPreviewCard from "./preview/ColorPreviewCard";
import BuyButton from "../input/Cosmetic/BuyButton";
import BadgePreviewCard from "./preview/BadgePreviewCard";
import type { User } from "../../modules/user/user.interface";
import type { Cosmetic } from "../../modules/cosmetic/cosmetic.interface";

interface BuyCosmeticCardProps {
	cosmetic: Cosmetic;
	user: User;
	onBuyCosmetic?: (cosmetic: Cosmetic) => void;
	userCosmetics: Cosmetic[];
}

const BuyCosmeticCard: React.FC<BuyCosmeticCardProps> = ({ cosmetic, user, onBuyCosmetic, userCosmetics }) => {
	return (
		<div className="min-w-fit border border-gray-700 rounded-lg">
			<div className="m-4 flex flex-col items-center space-y-4">
				<h1 className="text-white text-center font-bold text-lg">{cosmetic.name}</h1>
				{cosmetic.type === "color" && <ColorPreviewCard colorHex={cosmetic.value ?? "#FFFFFF"} username={user.username} userCosmetics={userCosmetics} />}
				{cosmetic.type === "badge" && <BadgePreviewCard emoji={cosmetic.value ?? ""} username={user.username} userCosmetics={userCosmetics} />}
				<BuyButton cosmetic={cosmetic} onBuyCosmetic={onBuyCosmetic} user={user}/>
			</div>
		</div>
	);
};

export default BuyCosmeticCard;
