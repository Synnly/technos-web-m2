import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import axios from "axios";
import { useAuth } from "./hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL;

type LoginFormInputs = {
    pseudo: string;
    password: string;
};

function Login() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    if(isAuthenticated) navigate("", {replace: true})
        
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
            pseudo: data.pseudo,
            password: data.password
        })
        .then((response) => {
            // Stockage du token dans le stockage local
            localStorage.setItem("token", response.data.token.token);
            console.log(from);
            
            // Redirection vers la page initialement demandée
            navigate(from, {replace: true});
        })
        .catch((error) => {
            setError("root", {
                type: "manual",
                message: "Identifiants invalides"
            })
        });
    };

    return (
        <>
            <h2>Formulaire de Connexion</h2>

            <form className="App" onSubmit={handleSubmit(onSubmit)}>

                {errors.root && <span style={{ color: "red" }}>{errors.root.message}</span>}
                <input
                    type="text"
                    {...register("pseudo", { required: "Champ requis" })}
                    placeholder="Pseudo"
                />

                <input
                    type="password"
                    {...register("password", { required: "Champ requis" })}
                    placeholder="Mot de passe"
                />

                <input type="submit" style={{ backgroundColor: "#a1eafb" }} />
            </form>

            <p>Pas encore de compte ? <a href="/signup">Créer un compte</a></p>
        </>
    );
}

export default Login;