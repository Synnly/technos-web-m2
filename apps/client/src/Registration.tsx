import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import axios from "axios";
import { useAuth } from "./hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL;

interface FormData {
    pseudo: string;
    password: string;
    passwordConfirmation: string;
}


function Register() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    if(isAuthenticated) navigate("", {replace: true})


    const {
        register,
        handleSubmit,
        watch,
    } = useForm<FormData>();

    // Fonction de validation pour le mot de passe
    const validatePassword = (password: string) => {
        if (password.length < 8) {
            return "Le mot de passe doit contenir au moins 8 caractères";
        }
        if (!/[A-Z]/.test(password)) {
            return "Le mot de passe doit contenir au moins une lettre majuscule";
        }
        if (!/[a-z]/.test(password)) {
            return "Le mot de passe doit contenir au moins une lettre minuscule";
        }
        if (!/[0-9]/.test(password)) {
            return "Le mot de passe doit contenir au moins un chiffre";
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return "Le mot de passe doit contenir au moins un caractère spécial";
        }
        return true;
    };

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        try {
            await axios.post(`${API_URL}/user`, { 
                pseudo: data.pseudo, 
                motDePasse: data.password 
            });
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
                    {...register("pseudo", { 
                        required: "Champ requis",
                        minLength: {
                            value: 3,
                            message: "Le pseudo doit contenir au moins 3 caractères"
                        }
                    })}
                    placeholder="Pseudo"
                />

                <input
                    type="password"
                    {...register("password", { 
                        required: "Champ requis",
                        validate: validatePassword
                    })}
                    placeholder="Mot de passe"
                />

                 <input
                    type="password"
                    {...register("passwordConfirmation", { 
                        required: "Champ requis",
                        validate: (value) => {
                            const password = watch("password");
                            return value === password || "Les mots de passe ne correspondent pas";
                        }
                    })}
                    placeholder="Confirmation du mot de passe"
                />

                <input type="submit" style={{ backgroundColor: "#a1eafb" }} />
            </form>

            <p>Déjà inscrit ? <a href="/login">Se connecter</a></p>
        </>
    );
}

export default Register;