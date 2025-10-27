import type { Cosmetic } from "../../../modules/cosmetic/cosmetic.interface";
import Username from "../Username";

interface ColorPreviewCardProps {
	colorHex: string;
	username?: string;
	userCosmetics?: Cosmetic[];
}

const ColorPreviewCard: React.FC<ColorPreviewCardProps> = ({ colorHex, username, userCosmetics }) => {
	const badge = userCosmetics?.find((c) => c?.type === "badge") || undefined;
	return <div><Username username={username} color={colorHex} badge={badge?.value} /></div>;
};

export default ColorPreviewCard;
