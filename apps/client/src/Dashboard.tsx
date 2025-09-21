import { useState } from "react";

function Index() {
    const token = localStorage.getItem("token");

    return (
        <>
            <div>
                <h1>Bienvenue sur la page principale</h1>
                <p>Vous êtes connecté avec le token : {JSON.stringify(token)}</p>
            </div>
        </>
    );
}


export default Index;