import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useNavigate } from "react-router-dom";

function Index() {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate()

    const handleLogout = () => {
        logout();
        navigate('/signin');
    };

    if (isAuthenticated) {
        return (
            <>
                <div>
                    <h1>Bienvenue sur la page principale</h1>

                    <button onClick={handleLogout}>Deconnexion</button>
                </div>
            </>
        );
    }
    else {
        return (
            <>
                <div>
                    <h1>Bienvenue sur notre application</h1>
                    <p>Veuillez vous connecter ou vous inscrire pour continuer.</p>
                </div>
            </> 
        );
    }
}


export default Index;