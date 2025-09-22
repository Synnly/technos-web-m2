import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import "./App.css";
import axios from "axios";
import { useAuth } from "./hooks/useAuth";
import PasswordWithConfirmationInput from "./PasswordWithConfirmationInput";

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
    if(isAuthenticated) navigate("", {replace: true})

    const {
        register,
        handleSubmit,
        watch,
    } = useForm<FormData>();

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        try {
            await axios.post(`${API_URL}/user`, { 
                username: data.username, 
                motDePasse: data.password 
            });

            navigate("/signin", {replace: true});
        } catch (error) {
            console.error("Error registering user:", error);
        }
    };

    return (
        <>
            <h2>Registration Form</h2>

            <form className="App" onSubmit={handleSubmit(onSubmit)}>
                <input
                    type="text"
                    {...register("username", { 
                        required: "Champ requis",
                        minLength: {
                            value: 3,
                            message: "Le nom d\'utilisateur doit contenir au moins 3 caractères"
                        }
                    })}
                    placeholder="Nom d'utilisateur"
                />

                <PasswordWithConfirmationInput register={register} watch={watch} />

                <input type="submit" style={{ backgroundColor: "#a1eafb" }} />
            </form>

            <p>Déjà inscrit ? <a href="/signin">Se connecter</a></p>
        </>
    );
}

export default Register;