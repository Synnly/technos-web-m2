import DailyRewards from "./navigation/navigation-daily-reward/DailyRewards.component";
import NavigationItemComponent from "./navigation/navigation-item/NavigationItem.component";
import NavigationSectionComponent from "./navigation/navigation-section/NavigationSection.component";
import Actions from "./Sidebar.action";
import { LogOut } from "lucide-react";

const Sidebar: React.FC = () => {
	return (
		<aside className="fixed left-0 top-20 h-full w-72 bg-gray-800 border-r border-gray-700 overflow-y-auto">
			<div className="p-6">
				<nav className="space-y-2">
					{Actions.map((section) => (
						<NavigationSectionComponent
							key={section.title}
							title={section.title}
							items={section.items}
						/>
					))}
					<DailyRewards
						onClick={() => console.log("Daily Rewards clicked")}
					/>

					<div className="pt-4 border-t border-gray-700">
						<NavigationItemComponent
							id="disconnect"
							icon={<LogOut className="w-5 h-5" />}
							title="Disconnect"
							description="Sign out safely"
							colorScheme="red"
                            path="/logout"
						/>
					</div>
				</nav>
			</div>
		</aside>
	);
};

export default Sidebar;