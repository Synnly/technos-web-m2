import React from "react";
import { Tabs } from "antd";
import type { AccountTabsProps } from "./AccountTabs.interface";
import makeAccountInfoTab from "./AccountInfoTab";
import makeCosmeticsTab from "./CosmeticsTab";
import makeSettingsTab from "./SettingsTab";

const AccountTabs: React.FC<AccountTabsProps> = () => {
	const items = [makeAccountInfoTab(), makeCosmeticsTab(), makeSettingsTab()];

	return (
		<div className="bg-gray-900/90 border border-gray-800 rounded-xl p-4 shadow-md h-full">
			<Tabs
				defaultActiveKey="1"
				className="custom-tabs"
				tabBarGutter={24}
				centered
				items={items}
			/>
		</div>
	);
};

export default AccountTabs;
