import type { Cosmetic } from "../../../modules/cosmetic/cosmetic.interface";
import Username from "../Username";

interface BadgePreviewCardProps {
	emoji: string;
	username?: string;
	userCosmetics?: Cosmetic[];
}

const BadgePreviewCard: React.FC<BadgePreviewCardProps> = ({ emoji, username, userCosmetics }) => {
	const colorHex = userCosmetics?.find((c) => c?.type === "color")?.value || undefined;
	return <div><Username username={username} color={colorHex} badge={emoji} /></div>;
};

export default BadgePreviewCard;