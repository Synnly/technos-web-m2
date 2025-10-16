import GenericForm from "../form/Form.component";
import InputPassword from "../input/Password/InputPassword.component";
import InputText from "../input/Text/InputText.component";
import type { FormField } from "../modal/modal.interface";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function AccountInfoTab() {
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

	const fields: FormField[] = [
		{
			name: "username",
			label: "Nom d'utilisateur",
			component: InputText,
			componentProps: { placeholder: "Nom d'utilisateur" },
			formItemProps: { rules: [{ required: true, min: 3 }] },
		},
		{
			name: "password",
			label: "Mot de passe",
			component: InputPassword,
			componentProps: { placeholder: "Mot de passe" },
		},
		{
			name: "passwordConfirm",
			label: "Confirmer le mot de passe",
			component: InputPassword,
			componentProps: { placeholder: "Confirmer le mot de passe" },
		},
	];

	const onFinish = async (values: any) => {
		if (values.password && values.password !== values.passwordConfirm) {
			alert("Les mots de passe ne correspondent pas");
			return;
		}

		if (!username) return;

		try {
			await axios.put(`${API_URL}/user/${username}`, {
				username: values.username,
				motDePasse: values.password,
			});
			const response = await axios.post(`${API_URL}/user/login`, {
				username: values.username,
				password: values.password,
			});
			localStorage.setItem("token", response.data.token.token);
			window.location.reload();
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<div className="space-y-6 max-w-lg">
			<GenericForm title={`Compte - ${username ?? ""}`} initialValues={{ username }} fields={fields} onFinish={onFinish} />

			<button onClick={confirmAccountDeletionHandler} className="text-red-400">
				Supprimer le compte
			</button>
		</div>
	);
}
