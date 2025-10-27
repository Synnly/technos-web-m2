import React, { useEffect, useState } from "react";
import { Tabs } from "antd";
import AccountInfoTab from "./account-info-tab/AccountInfoTab";
import CosmeticsTab, { CosmeticsLabel } from "./CosmeticsTab";
import SettingsTab, { SettingsLabel } from "./SettingsTab";
import { useAuth } from "../../hooks/useAuth";
import { userController } from "../../modules/user/user.controller";
import type { User } from "../../modules/user/user.interface";
import { Package2 } from "lucide-react";

export const AccountLabel = (
	<span className="flex items-center gap-2 text-gray-300">
		<Package2 className="w-4 h-4" />
		Mon compte
	</span>
);

const AccountTabs: React.FC<any> = ({ setCurrentCosmetics }: any) => {
	const { username } = useAuth();
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const fetchUser = async () => {
			if (!username) return;
			try {
				const token = localStorage.getItem("token");
				const u = await userController.getUserByUsername(username, token);
				setUser(u);
			} catch (err) {
				console.error("Erreur de chargement utilisateur :", err);
			}
		};

		fetchUser();
	}, [username]);

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
