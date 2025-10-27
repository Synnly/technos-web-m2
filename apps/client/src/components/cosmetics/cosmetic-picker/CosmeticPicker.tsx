import { useEffect, useState } from "react";
import CosmeticController from "../../../modules/cosmetic/cosmetic.controller";
import CosmeticList from "../CosmeticList";
import type { CosmeticPickerProps } from "./cosmetic-picker.interface";
import type { Toast } from "../../toast/Toast.interface";
import ToastComponent from "../../toast/Toast.component";
import type { Cosmetic } from "../../../modules/cosmetic/cosmetic.interface";

const CosmeticPicker = ({ user, setCurrentCosmetics }: CosmeticPickerProps) => {
	const [toast, setToast] = useState<Toast | null>(null);
	const [cosmeticsOwned, setCosmeticsOwned] = useState<Cosmetic[]>([]);
	const clearToast = () => setToast(null);
	const token = localStorage.getItem("token");

	const fetchAllCosmetics = async () => {
		const allCosmetics = await CosmeticController.getAllCosmetics(token, setToast);
		setCosmeticsOwned(allCosmetics.filter((cosmetic) => user.cosmeticsOwned?.includes(cosmetic._id)));
	};

	useEffect(() => {
		fetchAllCosmetics();
	}, [user?.cosmeticsOwned]);

	const handleApply = async (id: string) => {
		const setError = (m: string | null) => {
			if (m) console.error(m);
		};

		return CosmeticController.applyCosmetic(
			user.username,
			id,
			token,
			user.cosmeticsOwned || [],
			user.currentCosmetic || [],
			(cosmetics: (string | null)[]) => setCurrentCosmetics(cosmetics),
			(msg: string | null) => setError(msg),
			setToast,
		);
	};

	return (
		<div className="my-6">
			<h3 className="font-semibold text-lg text-white mb-3">Vos cosmétiques</h3>

			<CosmeticList owned={cosmeticsOwned} applied={user?.currentCosmetic || []} apply={handleApply} />

			{toast && <ToastComponent message={toast.message!} type={toast.type!} onClose={clearToast} />}
		</div>
	);
};

export default CosmeticPicker;
