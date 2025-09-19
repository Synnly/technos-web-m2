import React from "react";
import { useForm } from "react-hook-form";
import { jwtDecode } from "jwt-decode";
import "./App.css";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

type LoginFormInputs = {
    pseudo: string;
    password: string;
};

/**
 * Le composant `Login` affiche un formulaire de connexion permettant aux utilisateurs
 * de saisir leurs identifiants (pseudo et mot de passe) et de les soumettre pour authentification.
 *
 * Ce composant utilise la bibliothèque `react-hook-form` pour la gestion et la validation des formulaires.
 * Il utilise également `axios` pour envoyer une requête POST à l'API d'authentification et `jwt-decode`
 * pour décoder le jeton JWT reçu dans la réponse.
 *
 * @example
 * <Login />
 *
 * @remarks
 * - Le formulaire comprend deux champs : `pseudo` (nom d'utilisateur) et `password`.
 * - Les deux champs sont obligatoires, et des messages d'erreur de validation sont affichés s'ils sont laissés vides.
 * - En cas de soumission réussie, le jeton JWT est extrait de la réponse de l'API et décodé
 *   pour récupérer les informations de l'utilisateur.
 * - Si l'authentification échoue, un message d'erreur est enregistré dans la console.
 *
 * @dependencies
 * - `react-hook-form` pour la gestion des formulaires.
 * - `axios` pour les requêtes HTTP.
 * - `jwt-decode` pour décoder les jetons JWT.
 *
 * @requires
 * - `API_URL` doit être défini comme l'URL de base de l'API.
 * - `LoginFormInputs` doit être une interface TypeScript définissant la structure des entrées du formulaire.
 */
function Login() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormInputs>();

    const onSubmit = (data: LoginFormInputs) => {
        // Envoi d'une requête POST à l'API pour authentifier l'utilisateur
        axios.get(`${API_URL}/user/${data.pseudo}/token`)
            .then((response) => {
                // Extraction du jeton JWT de la réponse et décodage pour obtenir les informations utilisateur
                const token = response.data.token;
                const userInfo = jwtDecode(token);
                console.log("Informations utilisateur à partir du jeton :", userInfo);
            })
            .catch((error) => {
                console.log("Identifiants invalides", error, `${API_URL}/user/signin`);
            })
    };

    return (
        <>
            <h2>Formulaire de Connexion</h2>

            <form className="App" onSubmit={handleSubmit(onSubmit)}>
                <input
                    type="text"
                    {...register("pseudo", { required: true })}
                    placeholder="Pseudo"
                />
                {errors.pseudo && <span style={{ color: "red" }}>*Pseudo* est obligatoire</span>}

                <input
                    type="password"
                    {...register("password", { required: true })}
                    placeholder="Mot de passe"
                />
                {errors.password && <span style={{ color: "red" }}>*Mot de passe* est obligatoire</span>}

                <input type="submit" style={{ backgroundColor: "#a1eafb" }} />
            </form>
        </>
    );
}

export default Login;