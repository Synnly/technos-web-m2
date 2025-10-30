import React from "react";
import { Tabs } from "antd";
import AccountInfoTab from "./account-info-tab/AccountInfoTab";
import CosmeticsTab, { CosmeticsLabel } from "./CosmeticsTab";
import SettingsTab, { SettingsLabel } from "./SettingsTab";
import type { User } from "../../modules/user/user.interface";
import { Package2 } from "lucide-react";

export const AccountLabel = (
	<span className="flex items-center gap-2 text-gray-300">
		<Package2 className="w-4 h-4" />
		Mon compte
	</span>
);

interface AccountTabsProps {
	setCurrentCosmetics: (cosmetics: (string | null)[]) => void;
	user: User | null;
	token?: string | null;
}

const AccountTabs: React.FC<AccountTabsProps> = ({ setCurrentCosmetics, user }) => {

	const items = [
		{ key: "1", label: AccountLabel, children: <AccountInfoTab /> },
		{
			key: "2",
			label: CosmeticsLabel,
			children: <CosmeticsTab user={user!} setCurrentCosmetics={setCurrentCosmetics} />,
		},
		{ key: "3", label: SettingsLabel, children: <SettingsTab /> },
	];

	return (
		<div className="px-4 !text-white">
			<Tabs defaultActiveKey="1" className="text-center" tabBarGutter={24} centered items={items} />
		</div>
	);
};

export default AccountTabs;
