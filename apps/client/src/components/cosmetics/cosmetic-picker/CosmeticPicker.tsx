import { useEffect, useState } from "react";
import CosmeticController from "../../../modules/cosmetic/cosmetic.controller";
import CosmeticList from "../CosmeticList";
import type { Cosmetic } from "../../../modules/cosmetic/cosmetic.interface";
import type { CosmeticPickerProps } from "./cosmetic-picker.interface";
import type { Toast } from "../../toast/Toast.interface";
import ToastComponent from "../../toast/Toast.component";

export default function CosmeticPicker({ user }: CosmeticPickerProps) {
	const [cosmeticsOwned, setCosmeticsOwned] = useState<Cosmetic[]>([]);
	const [toast, setToast] = useState<Toast | null>(null);
	const clearToast = () => setToast(null);
	const normalize = (arr?: Array<string | any | null>) =>
		(arr || [])
			.map((v) =>
				v && typeof v === "object"
					? String((v as any)._id ?? v)
					: String(v),
			)
			.filter(Boolean as any) as string[];

	const [applied, setApplied] = useState<string[]>(
		normalize(user?.currentCosmetic),
	);
	const token = localStorage.getItem("token");

	useEffect(() => {
		if (!token || !user?.cosmeticsOwned) return;

		const fetchCosmetics = async () => {
			const ownedCosmetics = await CosmeticController.getUserCosmetics(
				user.cosmeticsOwned,
				token,
			);
			setCosmeticsOwned(ownedCosmetics);
		};

		fetchCosmetics();
	}, [token, user?.cosmeticsOwned]);

	useEffect(() => {
		setApplied(normalize(user?.currentCosmetic));
	}, [user?.currentCosmetic]);

	const handleApply = async (id: string) => {
		const setError = (m: string | null) => {
			if (m) console.error(m);
		};

		return CosmeticController.applyCosmetic(
			user.username,
			id,
			token,
			cosmeticsOwned,
			applied,
			(arr: string[]) => setApplied(arr),
			(msg: string | null) => setError(msg),
			setToast,
		);
	};

	return (
		<div className="my-6">
			<h3 className="font-semibold text-lg text-white mb-3">
				Vos cosmétiques
			</h3>

			<CosmeticList
				owned={cosmeticsOwned}
				applied={applied}
				apply={handleApply}
			/>

			{toast && (
				<ToastComponent
					message={toast.message!}
					type={toast.type!}
					onClose={clearToast}
				/>
			)}
		</div>
	);
}
