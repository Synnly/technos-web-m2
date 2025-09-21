import { useState } from "react";
import { jwtDecode, type JwtPayload } from "jwt-decode";

function Index() {
    const token = localStorage.getItem("token");

    if (token) {
        const decodedToken: JwtPayload = jwtDecode(token);
        
        // Vérifier si le token est expiré
        if(Date.now() >= decodedToken.exp! * 1000) {
            localStorage.removeItem("token");
            window.location.reload();
            return (<></>);
        }

        return (
            <>
                <div>
                    <h1>Bienvenue sur la page principale</h1>
                    <p>Vous êtes connecté avec le token : {JSON.stringify(token)}</p>
                    <button onClick={() => {localStorage.removeItem("token"); window.location.href = "/signin" }}>Deconnexion</button>
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