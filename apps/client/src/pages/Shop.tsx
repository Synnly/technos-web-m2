import Sidebar from "../components/sidebar/Sidebar.component";
import { useEffect, useState } from "react";
import type { Toast } from "../components/toast/Toast.interface";
import ToastComponent from "../components/toast/Toast.component";
import BuyCosmeticList from "../components/cosmetics/BuyCosmeticList";
import type { User } from "../modules/user/user.interface";
import { userController } from "../modules/user/user.controller";
import { useAuth } from "../hooks/useAuth";
import type { Cosmetic } from "../modules/cosmetic/cosmetic.interface";
import CosmeticController from "../modules/cosmetic/cosmetic.controller";

function Shop() {
	const { username } = useAuth();
	const [user, setUser] = useState<User>({} as User);
	const token = localStorage.getItem("token");
	const [points, setPoints] = useState<number>(0);
	const [toast, setToast] = useState<Toast | null>(null);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [cosmetics, setCosmetics] = useState<Cosmetic[]>([]);

	const fetchUserByUsername = async (username: string) => {
		const u = await userController.getUserByUsername(username, token, setToast);
		setUser(u);
		setPoints(u?.points || 0);
	};

	const fetchAllCosmetics = async () => {
		const allCosmetics = await CosmeticController.getAllCosmetics(token, setToast);
		allCosmetics.sort((a, b) => (a.cost === b.cost ? a.name.localeCompare(b.name) : a.cost - b.cost));
		setCosmetics(allCosmetics);
	};

	useEffect(() => {
		(async () => {
			await fetchAllCosmetics();
			if (username) await fetchUserByUsername(username);
		})();
	}, [username]);

	const clearToast = () => setToast(null);

	const onBuyCosmetic = (cosmetic: Cosmetic) => {
		if (!user) return;

		userController.buyCosmetic(username!, cosmetic._id, token!, setToast);
		const newCurrentCosmeticsIds = [
			cosmetic.type === "color" ? cosmetic._id : user.currentCosmetic[0],
			cosmetic.type === "badge" ? cosmetic._id : user.currentCosmetic[1],
		];

		const updatedUser = {
			...user,
			_id: undefined,
			cosmeticsOwned: [...user.cosmeticsOwned, cosmetic._id],
			currentCosmetic: newCurrentCosmeticsIds,
			points: user.points - cosmetic.cost,
		};

		userController.updateUser(username!, updatedUser, token!, setToast);
		setUser({ ...updatedUser, _id: user._id });
		setPoints(points - cosmetic.cost);
	};

	return (
		<div className="bg-gray-900 w-screen min-h-screen flex flex-col select-none">
			<Sidebar
				user={user}
				token={token!}
				setUser={setUser}
				setPoints={setPoints}
				setToast={setToast}
				onPredictionCreated={() => {}}
				onCollapsedChange={(value: boolean) => setSidebarCollapsed(value)}
			/>
			{toast && <ToastComponent message={toast.message!} type={toast.type!} onClose={clearToast} />}
			<main
				className={`mx-5 lg:mx-20 py-8 pt-19 ${
					sidebarCollapsed
						? "flex-1 p-2 sm:p-4 md:p-6 md:pt-19 lg:pt-6 lg:ml-40 transition-all"
						: "flex-1 p-2 sm:p-4 md:p-6 lg:ml-100"
				}`}
			>
				<h1 className="text-white text-3xl text-center font-bold mb-4">Boutique des cosmétiques</h1>
				<p className="text-white text-lg mb-2 italic">Vous avez {points} points.</p>

				<h2 className="text-white text-2xl font-bold mb-4 mt-8">Couleurs</h2>
				<BuyCosmeticList
					cosmetics={cosmetics.filter((c) => c.type === "color")}
					user={user}
					onBuyCosmetic={onBuyCosmetic}
					userCosmetics={cosmetics.filter((c) => user.currentCosmetic?.includes(c._id))}
				/>

				<h2 className="text-white text-2xl font-bold mb-4 mt-8">Badges</h2>
				<BuyCosmeticList
					cosmetics={cosmetics.filter((c) => c.type === "badge")}
					user={user}
					onBuyCosmetic={onBuyCosmetic}
					userCosmetics={cosmetics.filter((c) => user.currentCosmetic?.includes(c._id))}
				/>
			</main>
		</div>
	);
}

export default Shop;
