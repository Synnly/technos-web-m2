import { Settings } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const SettingsLabel = (
	<span className="flex items-center gap-2 text-gray-300">
		<Settings className="w-4 h-4" />
		Paramètres
	</span>
);

export default function SettingsTab() {
	const { username, logout } = useAuth();
	const navigate = useNavigate();

	const confirmAccountDeletionHandler = async () => {
		const token = localStorage.getItem("token");
		if (!token || !username) return;

		if (!confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible !")) {
			return;
		}

		try {
			await axios.delete(`${API_URL}/user/${username}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			logout();
			navigate("/signup", { replace: true });
		} catch (err) {
			console.error("Erreur suppression compte:", err);
		}
	};

	return (
		<div className="p-4 text-gray-200">
			<div className="max-w-md mx-auto">
				<h3 className="text-lg font-semibold text-white mb-4">Sécurité du compte</h3>
				<p className="text-sm text-gray-300 mb-6">Ici vous pouvez gérer des actions sensibles liées à votre compte.</p>

				<button onClick={confirmAccountDeletionHandler} className="w-full text-left text-red-400 border border-red-600 px-4 py-2 rounded-md hover:bg-red-600/10 cursor-pointer">
					Supprimer le compte
				</button>
			</div>
		</div>
	);
}
