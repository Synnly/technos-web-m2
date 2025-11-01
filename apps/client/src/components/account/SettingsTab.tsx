import { Settings } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Modal } from "antd";
import { userController } from "../../modules/user/user.controller";
import GenericForm from "../form/Form.component";
import InputPassword from "../input/Password/InputPassword.component";
import type { FormField } from "../modal/modal.interface";
import { useState } from "react";
import type { Toast } from "../toast/Toast.interface";
import ToastComponent from "../toast/Toast.component";

export const SettingsLabel = (
	<span className="flex items-center gap-2 text-gray-300">
		<Settings className="w-4 h-4" />
		Paramètres
	</span>
);

const SettingsTab = () => {
	const { username, logout } = useAuth();
	const navigate = useNavigate();
	const [toast, setToast] = useState<Toast | null>(null);
	const [modal, contextHolder] = Modal.useModal();
	const token = localStorage.getItem("token");
	const clearToast = () => setToast(null);

	const fields: FormField[] = [
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
			// backend expects the password under 'motDePasse' (or similar) but User interface doesn't include it.
			// use a loose type here to avoid TS errors and pass the correct payload to the controller.
			const partialUser: any = { username: username, motDePasse: values.password };
			await userController.updateUser(username, partialUser, token);

			const loginResponse = await userController.login(username, values.password);
			localStorage.setItem("token", loginResponse);

			setToast({ message: "Paramètres mis à jour", type: "success" });
			navigate("/dashboard", { replace: true });
		} catch (err) {
			setToast({ message: "Erreur lors de la mise à jour des paramètres", type: "error" });
		}
	};

	const confirmAccountDeletionHandler = () => {
		const token = localStorage.getItem("token");
		if (!token || !username) return;

		modal.confirm({
			title: "Supprimer le compte",
			content: "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible !",
			okText: "Supprimer",
			okType: "danger",
			cancelText: "Annuler",
			onOk: async () => {
				await userController.deleteUser(username, token);
				logout();
				navigate("/signup", { replace: true });
			},
		});
	};

	return (
		<>
			{contextHolder}

			{toast && (
				<ToastComponent message={toast.message!} type={toast.type!} onClose={clearToast} duration={5000} />
			)}
			<div className="px-6 bg-gray-900 text-gray-200">
				<div className="max-w-3xl mx-auto space-y-8">
					<div className="space-y-2">
						<h2 className="text-2xl mt-6 font-medium text-white">Sécurité du compte</h2>
						<p className="text-gray-400 text-sm">
							Gérez les actions sensibles liées à votre compte de manière sécurisée.
						</p>
					</div>

					<div className="bg-gray-800 rounded-xl shadow-md p-6 space-y-6 border border-gray-700">
						<div className="w-fit mx-auto">
							<GenericForm
								title="Changer le mot de passe"
								initialValues={{ username }}
								fields={fields}
								onFinish={onFinish}
							/>
						</div>
					</div>
					<div className="border-t border-gray-700 my-6" />

					<div className="space-y-2 mt-12">
						<h2 className="text-2xl font-medium text-red-400">Suppression du compte</h2>
						<p className="text-gray-400 text-sm">
							La suppression de votre compte est irréversible. Toutes vos données seront perdues.
						</p>
					</div>

					<button
						onClick={confirmAccountDeletionHandler}
						className="w-fit text-red-400 font-medium border border-red-600 rounded-lg px-4 py-3 hover:bg-red-600/10 transition-colors cursor-pointer"
					>
						Supprimer le compte
					</button>
				</div>
			</div>
		</>
	);
};

export default SettingsTab;
