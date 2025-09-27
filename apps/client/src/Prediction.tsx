import axios from "axios";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL;

function Prediction() {
    const [prediction, setPrediction] = useState<any>(null);
    const [montant, setMontant] = useState<number>(1);
    const [user, setUser] = useState<any>(null);
    const token = localStorage.getItem("token");

    const { id } = useParams<{ id: string }>();
    const { username } = useAuth();
    

    const fetchPrediction = async (id: string) => setPrediction((await axios.get(`${API_URL}/prediction/${id}`)).data);
    const fetchUser = async (username: string) => setUser((await axios.get(`${API_URL}/user/${username}`)).data);
    const vote = async (id: string, option: string, montant: number) => {
        try {
            await axios.post(`${API_URL}/vote`, {
                prediction_id: id,
                option: option,
                amount: montant
            }, { headers: { Authorization: `Bearer ${token}` } });
            window.location.reload();
        } catch (err) {
            console.error("Erreur lors du vote :", err);
        }
    };

    useEffect(() => {
        if (id && username) {
            fetchPrediction(id!);
            fetchUser(username!);
        }
    }, [id, username]);

    return (
        <div>
            <h1>{prediction?.title}</h1>
            <p>Description : {prediction?.description}</p>
            <p>Status : {prediction?.status}</p>
            <p>Fin dans {Math.floor((new Date(prediction?.dateFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} jours&nbsp; 
                {Math.floor(((new Date(prediction?.dateFin).getTime() - Date.now()) / (1000 * 60 * 60)) % 24)} heures et&nbsp; 
                {Math.floor(((new Date(prediction?.dateFin).getTime() - Date.now()) / (1000 * 60)) % 60)} minutes</p>
            <div>
                Options:
                {prediction?.options && Object.entries(prediction.options).map(([key, value]) => (
                    <div key={key}>
                        {key}: {String(value)} ({Math.round((Number(value) / Object.values(prediction.options).reduce((a: number, b: unknown) => a + Number(b), 0)) * 100)}%)
                    </div>
                ))}
            </div>
            <p>Vous avez {user?.points} points.</p>
            <p>Montant à parier (minimum 1 point) :</p>
            <input type="number" value={montant} onChange={(e) => setMontant(Number(e.target.value))} min={1}/>
            {prediction?.options && Object.keys(prediction.options).map((option) => (
                <button key={option} onClick={async () => {
                    if (montant <= 0) {
                        alert("Le montant doit être supérieur à 0");
                        return;
                    }
                    await vote(id!, option, montant);
                }}>
                    {option}
                </button>
            ))}
        </div>
    );
}

export default Prediction;