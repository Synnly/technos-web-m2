import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { InputText } from "../components/input/Text/InputText.component";
import InputPassword from "../components/input/Password/InputPassword.component";
import GenericForm from "../components/form/Form.component";
import type { FormField } from "../components/modal/modal.interface";
import { userController } from "../modules/user/user.controller";

type LoginFormInputs = {
	username: string;
	password: string;
};

function Login() {
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();
	const from = useLocation().state?.from ?? "/";
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/", { replace: true });
		}
	}, [isAuthenticated, navigate]);

	const fields: FormField[] = [
		{
			name: "username",
			label: "Nom d'utilisateur",
			component: InputText,
			componentProps: { placeholder: "Nom d'utilisateur" },
			formItemProps: {
				rules: [{ required: true, message: "Champ requis*" }],
			},
		},
		{
			name: "password",
			label: "Mot de passe",
			component: InputPassword,
			componentProps: { placeholder: "Mot de passe" },
			formItemProps: {
				rules: [{ required: true, message: "Champ requis*" }],
			},
		},
	];

	const onFinish = async (values: LoginFormInputs) => {
		const response = await userController.login(
			values.username,
			values.password,
			setError,
		);
		localStorage.setItem("token", response);
		navigate(from, { replace: true });
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 px-6 py-12">
			<div className="relative w-full max-w-md bg-gray-800/70 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.04)] p-8 text-gray-200">
				<h1 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
					Connexion
				</h1>

				<GenericForm title="" fields={fields} onFinish={onFinish} />

				{error && (
					<div className="mt-4 text-center text-red-400 font-semibold">
						{error}
					</div>
				)}

				<p className="text-neutral-400 mt-6 text-center text-sm">
					Pas encore de compte ?{" "}
					<a
						href="/signup"
						className="text-gray-300 hover:text-gray-100 transition-colors font-semibold"
					>
						Créer un compte
					</a>
				</p>
			</div>
		</div>
	);
}

export default Login;
