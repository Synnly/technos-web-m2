import { Check } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Cosmetic } from "../../../modules/cosmetic/cosmetic.interface";
import type { User } from "../../../modules/user/user.interface";

interface BuyButtonProps {
	cosmetic: Cosmetic;
	onBuyCosmetic?: (cosmetic: Cosmetic) => void;
	user: User;
}

const BuyButton: React.FC<BuyButtonProps> = ({ cosmetic, onBuyCosmetic, user }) => {
	const [isBought, setIsBought] = useState(user?.cosmeticsOwned?.includes(cosmetic._id) || false);

	const handleClick = () => {
		if (!isBought && user.points >= cosmetic.cost) {
			onBuyCosmetic?.(cosmetic);
			setIsBought(true);
		}
	}

	useEffect(() => {
		setIsBought(user?.cosmeticsOwned?.includes(cosmetic._id) || false);
	}, [user, cosmetic._id]);

	return (
		<button
			className={`bg-gray-800 border border-gray-700 rounded-lg shadow-md
			${user.points < cosmetic.cost ? "text-gray-500 cursor-not-allowed" : "text-white"}
        	${isBought || user.points < cosmetic.cost ? "" : "transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-xl cursor-pointer"}`}
		>
			<div className="my-2 mx-4 flex flex-col items-center justify-center">
				{isBought ? (
					<Check className="text-gray-500 discrete" size={32} />
				) : (
					<div onClick={handleClick}>
						<div className="font-bold text-xl">Acheter</div>
						<div>{cosmetic.cost} points</div>
					</div>
				)}
			</div>
		</button>
	);
};

export default BuyButton;
