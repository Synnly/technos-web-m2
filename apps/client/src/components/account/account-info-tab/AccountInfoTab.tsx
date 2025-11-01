import { useAuth } from "../../../hooks/useAuth";
import axios from "axios";
import { useEffect, useState } from "react";
import type { User } from "../../../modules/user/user.interface";
import AccountStats from "../account-info-stats/AccountInfoStats";

const API_URL = import.meta.env.VITE_API_URL;

const AccountInfoTab = () => {
	const { username } = useAuth();
	const [userData, setUserData] = useState<User>();

	const getUser = async () => {
		if (!username) return;
		try {
			const response = await axios.get(`${API_URL}/user/${username}`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});
			return response.data;
		} catch (err) {
			console.error(err);
		}
	};

	useEffect(() => {
		const fetchUserData = async () => {
			const data = await getUser();
			setUserData(data);
		};
		fetchUserData();
	}, [username]);

	return (
		<div className="w-full space-y-12">
			<h1 className="text-white text-2xl pt-5">Informations du compte</h1>
			<AccountStats userData={userData} username={username!} />
		</div>
	);
}

export default AccountInfoTab;
