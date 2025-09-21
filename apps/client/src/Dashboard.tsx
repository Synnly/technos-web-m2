import { useState } from "react";
import axios from "axios";
import { useAuth } from "./hooks/useAuth";
import { jwtDecode, type JwtPayload } from "jwt-decode";

const API_URL = import.meta.env.VITE_API_URL;

export interface TokenJwtPayload extends JwtPayload {
    pseudo: string;
}

function confirmAccountDeletionHandler() {
    const decodedToken: TokenJwtPayload = jwtDecode(localStorage.getItem("token")!);
    const pseudo = decodedToken.pseudo;

    if(confirm("Êtes vous sur de vouloir supprimer votre compte ? Cette action est irréversible !")) {
        axios.delete(`${API_URL}/user/${pseudo}`)
        .then((response) => useAuth().logout());
    }
}

function Dashboard() {
    
    return (
        <>
            <div>
                <h1>Dashboard</h1>
                
                <button onClick={confirmAccountDeletionHandler}>Supprimer le compte</button>
            </div>
        </>
    );
}


export default Dashboard;