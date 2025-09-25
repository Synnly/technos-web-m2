import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import axios from "axios";
import { useAuth } from "./hooks/useAuth";
import { InputText } from "./components/inputs/InputText.component";
import { InputSubmit } from "./components/inputs/InputSubmit.component";

const API_URL = import.meta.env.VITE_API_URL;

type LoginFormInputs = {
    username: string;
    password: string;
};

/**
 * Composant Login permettant à l'utilisateur de se connecter.
 * Récupère les informations du formulaire et envoie une requête POST à l'API pour authentifier l'utilisateur.
 * En cas de succès, stocke le token JWT dans le localStorage et redirige l'utilisateur vers la page initialement demandée.
 * En cas d'erreur, affiche un message d'erreur.
 * @returns Le composant Login permettant à l'utilisateur de se connecter.
 */
function Login() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    if(isAuthenticated) navigate("/", {replace: true})
        
    const from = useLocation().state?.from ?? "/";

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<LoginFormInputs>();

    const onSubmit = (data: LoginFormInputs) => {
        // Envoi d'une requête POST à l'API pour authentifier l'utilisateur
        axios.post(`${API_URL}/user/login`, {
            username: data.username,
            password: data.password
        })
        .then((response) => {
            // Stockage du token dans le stockage local
            localStorage.setItem("token", response.data.token.token);
            
            // Redirection vers la page initialement demandée
            navigate(from, {replace: true});
        })
        .catch((_) => {
            setError("root", {
                type: "manual",
                message: "Identifiants invalides"
            })
        });
    };

    return (
        <>
        <div className="flex flex-col gap-8 items-center justify-center bg-neutral-800 rounded-2xl p-8">
            <h2 className="text-5xl font-semibold">Connexion</h2>

            <form className="App flex flex-col w-full gap-y-8" onSubmit={handleSubmit(onSubmit)}>

                {errors.root && <span className="text-red-500">{errors.root.message}</span>}
                <InputText
                
                      type="text"
                      placeholder="Nom d'utilisateur"
                      name="username"
                      register={register}
                      rules={{ required: "Champ requis*" }}
                      error={errors.username?.message}
                />

                <InputText

                    type="password"
                    name="password"
                    placeholder="Mot de passe"
                    register={register}
                    rules={{ required: "Champ requis*" }}
                    error={errors.password?.message}
                />

                <InputSubmit value="Se connecter" />

            </form>

            <p className="text-neutral-200">Pas encore de compte ? <a href="/signup" className="!text-neutral-400">Créer un compte</a></p>
        </div>
            
        </>
    );
}

export default Login;