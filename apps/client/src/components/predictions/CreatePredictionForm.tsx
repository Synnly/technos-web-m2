import React, { useState } from "react";
import axios from "axios";
import { InputText } from "../../components/inputs/InputText.component";
import { InputSubmit } from "../../components/inputs/InputSubmit.component";

const API_URL = import.meta.env.VITE_API_URL;

interface Props {
	username?: string | null;
	fetchPredictions: () => Promise<void>;
	onClose: () => void;
	setToast: (s: string | null) => void;
}

export default function CreatePredictionForm({
	username,
	fetchPredictions,
	onClose,
	setToast,
}: Props) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [dateFin, setDateFin] = useState("");
	const [optionKey, setOptionKey] = useState("");
	const [options, setOptions] = useState<Record<string, number>>({});
	const [localError, setLocalError] = useState<string | null>(null);

	const todayStr = new Date().toISOString().slice(0, 10);

	const submitPrediction = async (e?: React.FormEvent) => {
		e?.preventDefault();
		setLocalError(null);

		if (!title) {
			const m = "Le titre est requis";
			setLocalError(m);
			return;
		}
		if (!dateFin) {
			const m = "La date de fin est requise";
			setLocalError(m);
			return;
		}

		// Vérifier que la date est supérieure ou égale à aujourd'hui (comparaison YYYY-MM-DD)
		const todayStr = new Date().toISOString().slice(0, 10);
		if (dateFin < todayStr) {
			const m =
				"La date de fin ne peut pas être antérieure à aujourd'hui";
			setLocalError(m);
			return;
		}

		if (Object.keys(options).length < 2) {
			const m = "Au moins deux options sont requises";
			setLocalError(m);
			return;
		}

		const token = localStorage.getItem("token");
		if (!token) {
			const m = "Utilisateur non authentifié";
			setLocalError(m);
			return;
		}

		try {
			// Récupérer user_id
			let user_id: string | undefined;
			if (username) {
				try {
					const userRes = await axios.get(
						`${API_URL}/user/${username}`,
						{
							headers: { Authorization: `Bearer ${token}` },
						},
					);
					user_id = userRes.data?._id;
				} catch {}
			}

			const payload: any = {
				title,
				description,
				dateFin: new Date(dateFin).toISOString(),
				status: "waiting",
				results: "",
				options,
			};
			if (user_id) payload.user_id = user_id;

			await axios.post(`${API_URL}/prediction`, payload, {
				headers: { Authorization: `Bearer ${token}` },
			});

			setToast("Prédiction créée");
			await fetchPredictions();
			onClose();
			setTitle("");
			setDescription("");
			setDateFin("");
			setOptions({});
			setOptionKey("");
			setLocalError(null);
		} catch (err: any) {
			console.error(err);
			const msg =
				err?.response?.data?.message || "Erreur lors de la création";
			setLocalError(msg);
		}
	};

	return (
		<form className="mb-6 space-y-3" onSubmit={submitPrediction}>
			<InputText
				label="Titre"
				name="title"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				placeholder="Titre de la prédiction"
			/>

			<InputText
				label="Description"
				name="description"
				value={description}
				onChange={(e) => setDescription(e.target.value)}
				placeholder="Courte description"
			/>

			<InputText
				label="Date de fin"
				name="dateFin"
				type="date"
				value={dateFin}
				onChange={(e) => setDateFin(e.target.value)}
				min={todayStr}
			/>

			<div className="grid grid-cols-3 gap-2 items-end">
				<InputText
					label="Option clef"
					name="optionKey"
					value={optionKey}
					onChange={(e) => setOptionKey(e.target.value)}
					placeholder="ex: yes"
				/>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => {
							if (!optionKey) {
								const m = "La clé de l'option est requise";
								setLocalError(m);
								return;
							}
							setOptions((prev) => ({ ...prev, [optionKey]: 0 }));
							setOptionKey("");
							setLocalError(null);
						}}
					>
						Ajouter option
					</button>
				</div>
			</div>

			{Object.keys(options).length > 0 && (
				<div className="mt-2">
					<div className="text-sm font-medium">
						Options ajoutées :
					</div>
					<ul className="text-sm space-y-1">
						{Object.entries(options).map(([k]) => (
							<li
								key={k}
								className="flex items-center justify-between"
							>
								<span>{k}</span>
								<button
									type="button"
									onClick={() =>
										setOptions((prev) => {
											const next = { ...prev };
											delete next[k];
											return next;
										})
									}
									className="text-red-500"
								>
									Supprimer
								</button>
							</li>
						))}
					</ul>
				</div>
			)}

			<div className="flex items-center gap-2">
				<InputSubmit value="Créer" onClick={submitPrediction} />
				<button
					type="button"
					onClick={onClose}
					className="px-3 py-1 bg-gray-200 rounded"
				>
					Annuler
				</button>
			</div>
			{localError && <div className="text-red-500">{localError}</div>}
		</form>
	);
}
