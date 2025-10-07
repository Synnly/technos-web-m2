import NavigationItemComponent from "../navigation-item/NavigationItem.component";
import type { NavigationSectionProps } from "./NavigationSection.interface";

const NavigationSectionComponent: React.FC<NavigationSectionProps> = ({
	title,
	items,
	collapsed,
}) => {
	return (
		<div className="mb-6">
			{!collapsed && (
				<h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
					{title}
				</h3>
			)}
			<div className="space-y-1">
				{items.map((item) => (
					<NavigationItemComponent
						key={item.id}
						{...item}
						collapsed={collapsed}
					/>
				))}
			</div>
		</div>
	);
};

export default NavigationSectionComponent;
