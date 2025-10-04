import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function CreateCosmeticForm() {
	const [name, setName] = useState("");
	const [cost, setCost] = useState<number | "">("");
	const [type, setType] = useState("badge");
	const [hexColor, setHexColor] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const submit = async (e: any) => {
		e.preventDefault();
		setError(null);
		if (!name) return setError("Le nom est requis");
		if (!cost || Number(cost) <= 0)
			return setError("Le coût est requis et doit être > 0");
		if (!type) return setError("Le type est requis");

		setLoading(true);
		try {
			const token = localStorage.getItem("token");

			// try to extract username from the JWT payload so we can call the
			// API with the username route param expected by the controller
			const getUsernameFromToken = (t: string | null) => {
				if (!t) return null;
				try {
					const parts = t.split(".");
					if (parts.length < 2) return null;
					const base64 = parts[1]
						.replace(/-/g, "+")
						.replace(/_/g, "/");
					const json = decodeURIComponent(
						atob(base64)
							.split("")
							.map(
								(c) =>
									"%" +
									("00" + c.charCodeAt(0).toString(16)).slice(
										-2,
									),
							)
							.join(""),
					);
					const payload = JSON.parse(json);
					return payload?.username || payload?.sub || null;
				} catch (err) {
					return null;
				}
			};

			const username = getUsernameFromToken(token);
		

			const payload: any = { name, cost: Number(cost), type };
			if (type === "color") payload.hexColor = hexColor;

			// include username in the URL when available to satisfy controller checks
			const url = `${API_URL}/cosmetic/${username}`;
			await axios.post(url, payload, {
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			});
			setName("");
			setCost("");
			setType("badge");
			setHexColor("");
			alert("Cosmétique créé");
		} catch (err: any) {
			setError(err?.response?.data?.message || "Erreur");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={submit} className="p-4 border rounded mb-4">
			<h4 className="font-semibold mb-2">Créer un cosmétique</h4>
			<div className="mb-2">
				<input
					placeholder="Nom"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="w-full p-2 border rounded"
				/>
			</div>
			<div className="mb-2">
				<input
					type="number"
					placeholder="Coût"
					value={cost as any}
					onChange={(e) =>
						setCost(
							e.target.value === "" ? "" : Number(e.target.value),
						)
					}
					className="w-full p-2 border rounded"
				/>
			</div>
			<div className="mb-2">
				<select
					value={type}
					onChange={(e) => setType(e.target.value)}
					className="w-full p-2 border rounded"
				>
					<option value="badge">Badge</option>
					<option value="color">Color</option>
				</select>
			</div>
			{type === "color" && (
				<div className="mb-2">
					<input
						placeholder="#RRGGBB"
						value={hexColor}
						onChange={(e) => setHexColor(e.target.value)}
						className="w-full p-2 border rounded"
					/>
				</div>
			)}
			{error && <div className="text-red-500 text-sm mb-2">{error}</div>}
			<div>
				<button
					type="submit"
					className="px-4 py-2 bg-blue-600 text-white rounded"
					disabled={loading}
				>
					{loading ? "Création..." : "Créer"}
				</button>
			</div>
		</form>
	);
}
