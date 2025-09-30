import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import "./App.css";
import axios from "axios";
import { useAuth } from "./hooks/useAuth";
import PasswordWithConfirmationInput from "./PasswordWithConfirmationInput";
import { InputText } from "./components/inputs/InputText.component";
import { InputSubmit } from "./components/inputs/InputSubmit.component";

const API_URL = import.meta.env.VITE_API_URL;

interface FormData {
    username: string;
    password: string;
    passwordConfirmation: string;
}

/**
 * Composant pour le formulaire d'inscription.
 * Récupère les informations du formulaire et envoie une requête POST à l'API pour créer un nouvel utilisateur.
 * En cas de succès, redirige l'utilisateur vers la page de connexion.
 * En cas d'erreur, affiche un message d'erreur dans la console.
 * @returns Le composant Register permettant à l'utilisateur de s'inscrire.
 */
function Register() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const token = localStorage.getItem('token');
    if(isAuthenticated) navigate("", {replace: true})

    const {
        register,
        handleSubmit,
        watch,
        setError,
        formState: { errors },
    } = useForm<FormData>();

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        try {
            await axios.post(`${API_URL}/user`, { 
                username: data.username, 
                motDePasse: data.password 
            }, {
    headers: { Authorization: `Bearer ${token}` },
  });

            navigate("/signin", {replace: true});
        } catch (error : any) {
            setError("root", {
                type: "manual",
                message: error.response?.data?.message ?? "Erreur lors de l'inscription"
            })
            console.error("Error registering user:", error);
        }
    };

    return (
        <>
         <div className="flex flex-col gap-8 items-center justify-center bg-neutral-800 rounded-2xl p-8">
            <h2 className="text-5xl font-semibold">Inscription</h2>

            <form className="App flex flex-col w-full gap-y-8" onSubmit={handleSubmit(onSubmit)}>

                {errors.root && <span className="text-red-500">{errors.root.message}</span>}
                <InputText
                    type="text"
                    name="username"
                    placeholder="Nom d'utilisateur"
                    register={register}
                    rules={{ 
                        required: "Champ requis",
                        minLength: {
                            value: 3,
                            message: "Le nom d\'utilisateur doit contenir au moins 3 caractères"
                        }
                    }}
                />

                <PasswordWithConfirmationInput register={register} watch={watch} />

                <InputSubmit
                    value="S'inscrire"
                />
            </form>

            <p>Déjà inscrit ? <a href="/signin">Se connecter</a></p>

        </div>
        </>
    );
}

export default Register;