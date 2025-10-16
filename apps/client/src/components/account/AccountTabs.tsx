import React from "react";
import { Tabs } from "antd";
import type { AccountTabsProps } from "./interfaces/AccountTabs.interface";
import AccountInfoTab from "./AccountInfoTab";
import CosmeticsTab, { CosmeticsLabel } from "./CosmeticsTab";
import SettingsTab, { SettingsLabel } from "./SettingsTab";
import { useAuth } from "../../hooks/useAuth";

const AccountTabs: React.FC<AccountTabsProps> = () => {
	const { username } = useAuth();

	const items = [
		{ key: "1", label: "Mon compte", children: <AccountInfoTab /> },
		{ key: "2", label: CosmeticsLabel, children: <CosmeticsTab username={username} /> },
		{ key: "3", label: SettingsLabel, children: <SettingsTab /> },
	];

	return (
		<div className="bg-gray-900/90 p-4 shadow-md">
			<Tabs
				defaultActiveKey="1"
				className="text-center"
				tabBarGutter={24}
				centered
				items={items}
			/>
		</div>
	);
};

export default AccountTabs;
