import React, { useEffect, useState } from "react";
import { Tabs } from "antd";
import type { AccountTabsProps } from "./interfaces/AccountTabs.interface";
import AccountInfoTab from "./AccountInfoTab";
import CosmeticsTab, { CosmeticsLabel } from "./CosmeticsTab";
import SettingsTab, { SettingsLabel } from "./SettingsTab";
import { useAuth } from "../../hooks/useAuth";
import { userController } from "../../modules/user/user.controller";
import type { User } from "../../modules/user/user.interface";

const AccountTabs: React.FC<AccountTabsProps> = () => {
	const { username } = useAuth();
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const fetchUser = async () => {
			if (!username) return;
			try {
				const token = localStorage.getItem("token");
				const u = await userController.getUserByUsername(
					username,
					token,
				);
				setUser(u);
			} catch (err) {
				console.error("Erreur de chargement utilisateur :", err);
			}
		};

		fetchUser();
	}, [username]);

	const items = [
		{ key: "1", label: "Mon compte", children: <AccountInfoTab /> },
		{
			key: "2",
			label: CosmeticsLabel,
			children: <CosmeticsTab user={user!} />,
		},
		{ key: "3", label: SettingsLabel, children: <SettingsTab /> },
	];

	return (
		<div className="px-4 !text-white">
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
