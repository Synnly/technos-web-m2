import axios from "axios";
import { useForm } from "react-hook-form";
import { useAuth } from "./hooks/useAuth";
import { jwtDecode, type JwtPayload } from "jwt-decode";
import PasswordWithConfirmationInput from "./PasswordWithConfirmationInput";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

interface TokenJwtPayload extends JwtPayload {
  username: string;
}

type FormData = {
  username: string;
  password: string;
};

/**
 * Composant Dashboard pour la gestion du profil utilisateur.
 *
 * Ce composant permet à l'utilisateur authentifié de :
 * - Consulter et modifier son nom d'utilisateur et son mot de passe.
 * - Supprimer son compte avec confirmation.
 *
 * Fonctionnalités :
 * - Récupère le nom d'utilisateur depuis le token JWT stocké dans le localStorage.
 * - Gère la soumission du formulaire pour mettre à jour les informations via l'API.
 * - Rafraîchit le token d'authentification après une mise à jour réussie.
 * - Propose un bouton pour supprimer le compte utilisateur, avec une confirmation.
 * - Gère les tokens invalides ou expirés en déconnectant l'utilisateur.
 *
 * @component
 * @returns {JSX.Element} L'interface du dashboard.
 */
function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // récupération du username depuis le token et vérification de sa validité
  const token = localStorage.getItem("token");
  let username = "";
  if (token) {
    try {
      username = jwtDecode<TokenJwtPayload>(token).username;
    } catch (err) {
      console.error("Token invalide :", err);
      logout();
    }
  }

  const { register, handleSubmit, watch } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    const updatedUser = {
      username: data.username,
      motDePasse: data.password,
    };

    // update de l'utilisateur
    axios.put(`${API_URL}/user/${username}`, updatedUser).then(() => {
      // reconnexion pour rafraîchir le token
      axios
        .post(`${API_URL}/user/login`, {
          username: data.username,
          password: data.password,
        })
        .then((response) => {
          localStorage.setItem("token", response.data.token.token);
          window.location.reload();
        });
    });
  };

  const confirmAccountDeletionHandler = () => {
    if (!token) return;

    let decodedToken: TokenJwtPayload;
    try {
      decodedToken = jwtDecode<TokenJwtPayload>(token);
    } catch (err) {
      console.error("Token invalide :", err);
      logout();
      return;
    }

    if (
      confirm(
        "Êtes vous sur de vouloir supprimer votre compte ? Cette action est irréversible !"
      )
    ) {
      axios.delete(`${API_URL}/user/${decodedToken.username}`).then(() => {
        logout();
        navigate("/signup", { replace: true });
      });
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>

      <form className="App" onSubmit={handleSubmit(onSubmit)}>
        <input
          type="text"
          {...register("username", {
            required: "Champ requis",
            minLength: {
              value: 3,
              message:
                "Le nom d'utilisateur doit contenir au moins 3 caractères",
            },
          })}
          placeholder="Nom d'utilisateur"
          defaultValue={username}
        />

        <PasswordWithConfirmationInput register={register} watch={watch} />

        <input type="submit" style={{ backgroundColor: "#a1eafb" }} />
      </form>

      <button onClick={confirmAccountDeletionHandler}>
        Supprimer le compte
      </button>
    </div>
  );
}

export default Dashboard;