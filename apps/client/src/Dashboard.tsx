import axios from "axios";
import { useForm } from "react-hook-form";
import { useAuth } from "./hooks/useAuth";
import { jwtDecode, type JwtPayload } from "jwt-decode";
import PasswordWithConfirmationInput from "./PasswordWithConfirmationInput";
const API_URL = import.meta.env.VITE_API_URL;

interface TokenJwtPayload extends JwtPayload {
    pseudo: string;
}

type FormData = {
    pseudo: string;
    password: string;
};

/**
 * Handler pour la confirmation de la suppression du compte utilisateur.
 * Affiche une boîte de dialogue de confirmation et, si l'utilisateur confirme,
 * envoie une requête DELETE à l'API pour supprimer le compte utilisateur.
 * Après la suppression, déconnecte l'utilisateur en appelant la fonction logout du hook useAuth.
 */
function confirmAccountDeletionHandler() {
    const decodedToken: TokenJwtPayload = jwtDecode(localStorage.getItem("token")!);
    const pseudo = decodedToken.pseudo;

    if(confirm("Êtes vous sur de vouloir supprimer votre compte ? Cette action est irréversible !")) {
        axios.delete(`${API_URL}/user/${pseudo}`)
        .then((_) => useAuth().logout());
    }
}

/**
 * Composant Dashboard permettant à l'utilisateur de modifier son pseudo et son mot de passe.
 * Récupère le pseudo actuel de l'utilisateur à partir du token JWT stocké dans le localStorage.
 * Utilise react-hook-form pour gérer le formulaire de modification.
 * En cas de soumission du formulaire, envoie une requête PUT à l'API pour mettre à jour les informations de l'utilisateur.
 * Après la mise à jour, reconnecte l'utilisateur avec les nouvelles informations en envoyant une requête POST pour 
 * obtenir un nouveau token JWT.
 * Stocke le nouveau token dans le localStorage et recharge la page.
 * @returns Le composant Dashboard.
 */
function Dashboard() {
    const pseudo = (jwtDecode(localStorage.getItem("token")!) as TokenJwtPayload).pseudo;

    const {
        register,
        handleSubmit,
        watch,
    } = useForm<FormData>();

    const onSubmit = (data: FormData) => {
        const updatedUser = {
            pseudo: data.pseudo,
            motDePasse: data.password
        };

        // Envoi d'une requête PUT à l'API pour modifier l'utilisateur
        axios.put(`${API_URL}/user/${pseudo}`, updatedUser)
        .then((_) => {
            // Reconnexion de l'utilisateur avec les nouvelles informations 
            axios.post(`${API_URL}/user/login`, {
                pseudo: data.pseudo,
                password: data.password
            })
            .then((response) => {
                // Stockage du token dans le stockage local
                localStorage.setItem("token", response.data.token.token);
                window.location.reload();
            });
        });
    };

    return (
        <>
            <div>
                <h1>Dashboard</h1>

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
                        defaultValue={pseudo}
                    />

                    <PasswordWithConfirmationInput register={register} watch={watch} />

                    <input type="submit" style={{ backgroundColor: "#a1eafb" }} />
                </form>
                
                <button onClick={confirmAccountDeletionHandler}>Supprimer le compte</button>
            </div>
        </>
    );
}


export default Dashboard;