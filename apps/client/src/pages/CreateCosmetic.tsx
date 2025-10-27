import { useState } from "react";
import Sidebar from "../components/sidebar/Sidebar.component";
import type { Toast } from "../components/toast/Toast.interface";
import CreateCosmeticForm from "../components/cosmetics/CreateCosmeticForm.component";

function CreateCosmetic() {
	const token = localStorage.getItem("token");
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [user, setUser] = useState<any>(null);
	const [_, setPoints] = useState<number>(0);
	const [__, setToast] = useState<Toast | null>(null);

	return (
		<div className="bg-gray-900 min-h-screen">
			<Sidebar
				user={user}
				token={token!}
				setUser={setUser}
				setPoints={setPoints}
				setToast={setToast}
				onPredictionCreated={() => {}}
				onCollapsedChange={(value: boolean) => setSidebarCollapsed(value)}
			/>
			<main
				className={
					sidebarCollapsed
						? "flex-1 p-2 sm:p-4 md:p-6 ml-20 transition-all"
						: "flex-1 p-2 sm:p-4 md:p-6 ml-0 lg:ml-80"
				}
			>
				<div className="max-w-3xl mx-auto p-6">
					<h1 className="text-2xl font-semibold text-white mb-4">Créer un cosmétique</h1>
					<CreateCosmeticForm />
				</div>
			</main>
		</div>
	);
}

export default CreateCosmetic;
