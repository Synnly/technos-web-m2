import type { User } from "../../modules/user/user.interface";
import BuyCosmeticCard from "./BuyCosmeticCard";
import type { Cosmetic } from "../../modules/cosmetic/cosmetic.interface";

interface BuyCosmeticListProps {
    cosmetics: Cosmetic[];
    user: User;
    onBuyCosmetic: (cosmetic: Cosmetic) => void;
	userCosmetics: Cosmetic[];
}

const BuyCosmeticList: React.FC<BuyCosmeticListProps> = ({ cosmetics, user, onBuyCosmetic, userCosmetics }) => {
	return (
		<div className="flex flex-row flex-wrap gap-4 justify-between">
			{cosmetics.map((cosmetic) => (
				<BuyCosmeticCard
					key={cosmetic._id}
					cosmetic={cosmetic}
                    user={user}
					userCosmetics={userCosmetics}
					onBuyCosmetic={onBuyCosmetic}
				/>
			))}
		</div>
	);
};

export default BuyCosmeticList;
