import axios from "axios";
import { useForm } from "react-hook-form";
import { useAuth } from "./hooks/useAuth";
import { jwtDecode, type JwtPayload } from "jwt-decode";
import PasswordWithConfirmationInput from "./PasswordWithConfirmationInput";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

interface TokenJwtPayload extends JwtPayload {
  username: string;
  role: string;
}

type FormData = {
  username: string;
  password: string;
};

interface Prediction {
  _id: string;
  title: string;
  description?: string;
  dateFin: string;
  status: string;
  options: Record<string, number>;
  results: string;
}

function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // récupération du username/role depuis le token
  const token = localStorage.getItem("token");
  let username = "";
  let role = "";
  if (token) {
    try {
      const decoded = jwtDecode<TokenJwtPayload>(token);
      username = decoded.username;
      role = decoded.role;
    } catch (err) {
      console.error("Token invalide :", err);
      logout();
    }
  }

  const { register, handleSubmit, watch } = useForm<FormData>();
  const [expiredPrediction, setExpiredPrediction] = useState<Prediction[]>([]);
  const [waitingPrediction, setWaitingPrediction] = useState<Prediction[]>([]);

  // fonction mise à jour d'une prédiction
  const handleUpdateStatus = async (
    prediction: Prediction,
    status: "Valid" | "Invalid"
  ) => {
    try {
      await axios.put(
  `${API_URL}/prediction/${prediction._id}`,
  { ...prediction, status },
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);
      // rafraîchir les listes après modification
      const expiredRes = await axios.get<Prediction[]>(`${API_URL}/prediction/expired`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpiredPrediction(expiredRes.data);
      
      const waitingRes = await axios.get<Prediction[]>(`${API_URL}/prediction/waiting`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWaitingPrediction(waitingRes.data);

    } catch (err) {
      console.error("Erreur lors de la mise à jour de la prédiction :", err);
    }
  };


  function handleValidate(predictionId: string, winningOption: string) {
  axios.put(`${API_URL}/prediction/${predictionId}/validate`, {
    winningOption,
  })
  .then(() => {
    alert("Prédiction validée ✅");
  })
  .catch(err => {
    console.error("Erreur de validation :", err);
  });
}

  

  // Si admin, récupérer les prédictions expirées et en attente
  useEffect(() => {
    if (role === "admin") {
      // Récupérer les prédictions expirées
      axios
        .get<Prediction[]>(`${API_URL}/prediction/expired`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setExpiredPrediction(res.data))
        .catch((err) => console.error("Erreur lors de la récupération des prédictions expirées :", err));

      // Récupérer les prédictions en attente
      axios
        .get<Prediction[]>(`${API_URL}/prediction/waiting`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setWaitingPrediction(res.data))
        .catch((err) => console.error("Erreur lors de la récupération des prédictions en attente :", err));
    }
  }, [role]);

  const onSubmit = (data: FormData) => {
    const updatedUser = {
      username: data.username,
      motDePasse: data.password,
    };

    axios.put(`${API_URL}/user/${username}`, updatedUser).then(() => {
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
        "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible !"
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

      {/* Partie admin */}
      {role === "admin" && (
        <div className="my-8">
          <div>
            <h2>Prédictions en attente de validation :</h2>
            {waitingPrediction.length === 0 ? (
              <p>Aucune prédiction à valider</p>
            ) : (
              <ul>
                {waitingPrediction.map((p) => (
                  <div
                    key={p._id}
                    className="p-8 border border-gray-300 rounded mb-6 bg-neutral-700"
                  >
                    <li>
                      <strong>{p.title}</strong> — Finie le{" "}
                      {new Date(p.dateFin).toLocaleString()}
                    </li>
                    <li>Description : {p.description}</li>
                    <span className="flex gap-4 mt-4">
                      <button
                        onClick={() => handleUpdateStatus(p, "Valid")}
                      >
                        Valider
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(p, "Invalid")}
                      >
                        Refuser
                      </button>
                    </span>
                  </div>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2>Prédictions expirées pas encore validé:</h2>
            {expiredPrediction.length === 0 ? (
              <p>Aucune prédiction expirée</p>
            ) : (
              <ul>
                {expiredPrediction.map((p) => (
                  <div
                    key={p._id}
                    className="p-8 border border-gray-300 rounded mb-6 bg-gray-700"
                  >
                    <li>
                      <strong>{p.title}</strong> — Finie le{" "}
                      {new Date(p.dateFin).toLocaleString()} — Statut:{" "}
                      {p.status}
                    </li>
                    <div className="mt-6">
  <p className="mb-2 text-sm text-white">
    Cliquez sur l’option gagnante à valider, les points seront crédités automatiquement aux joueurs qui ont parié dessus :
  </p>

  <span className="flex gap-4 mt-4">
    {Object.keys(p.options).map((optionKey) => (
      <button
        key={optionKey}
        onClick={() => handleValidate(p._id, optionKey)}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Valider "{optionKey}"
      </button>
    ))}
  </span>
</div>

                  </div>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Partie utilisateur normal */}
      {role !== "admin" && (
        <div>
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
      )}
    </div>
  );
}

export default Dashboard;
