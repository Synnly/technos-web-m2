import type { NavigationItemProps } from "../navigation-item/NavigationItem.interface";

export interface NavigationSectionProps {
	title: string;
	collapsed?: boolean;
	items: NavigationItemProps[];
}
