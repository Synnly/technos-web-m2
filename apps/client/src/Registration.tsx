import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import "./App.css";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

interface FormData {
    pseudo: string;
    password: string;
    passwordConfirmation: string;
}


/**
 * Le composant `Register` affiche un formulaire d'inscription utilisateur.
 * Il utilise la bibliothèque `react-hook-form` pour gérer l'état du formulaire et sa validation.
 * 
 * @example
 * <Register />
 * 
 * @remarks
 * - Le formulaire comprend trois champs : `pseudo` (nom d'utilisateur), `password` (mot de passe) 
 *   et `passwordConfirmation` (confirmation du mot de passe).
 * - Tous les champs sont obligatoires, et la validation garantit que `password` et `passwordConfirmation` correspondent.
 * - Des messages d'erreur sont affichés en cas d'échec de validation.
 * - En cas de soumission réussie, le formulaire envoie une requête POST à l'endpoint API `${API_URL}/user/signup`
 *   avec le `pseudo` et le `password` de l'utilisateur.
 * - Si l'inscription réussit, un message de succès est enregistré dans la console.
 * - Si l'inscription échoue, un message d'erreur est enregistré dans la console.
 * 
 * @dependencies
 * - `react-hook-form` pour la gestion et la validation des formulaires.
 * - `axios` pour les requêtes HTTP.
 * 
 * @requires
 * - `API_URL` doit être défini comme l'URL de base de l'API.
 * - `FormData` doit être une interface définissant la structure des entrées du formulaire.
 */
function Register() {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<FormData>();

    const onSubmit: SubmitHandler<FormData> = (data) => {
        if (data.password !== data.passwordConfirmation) {
            // Afficher une erreur si les mots de passe ne correspondent pas
            setError("passwordConfirmation", {
                    type: "manual",
                    message: "Passwords do not match",
            });
        return;
        }
        else{
            axios.post(`${API_URL}/user/signup`, { pseudo: data.pseudo, motDePasse: data.password })
                .then((response) => {
                    console.log("User registered successfully:", response.data);
                })
            .catch((error) => {
                console.error("Error registering user:", error);
            });
        }

    };

    return (
        <>
            <h2>Registration Form</h2>

            <form className="App" onSubmit={handleSubmit(onSubmit)}>
                <input
                    type="text"
                    {...register("pseudo", { required: true })}
                    placeholder="Pseudo"
                />
                {errors.pseudo && <span style={{ color: "red" }}>*Name* is mandatory</span>}

                <input
                    type="password"
                    {...register("password", { required: true })}
                    placeholder="Password"
                />
                {errors.password && <span style={{ color: "red" }}>*Password* is mandatory</span>}

                 <input
                    type="password"
                    {...register("passwordConfirmation", { required: true })}
                    placeholder="Password confirmation"
                />
                {errors.passwordConfirmation && <span style={{ color: "red" }}>{errors.passwordConfirmation.message}</span>}

                <input type="submit" style={{ backgroundColor: "#a1eafb" }} />
            </form>
        </>
    );
}

export default Register;