import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { InputText } from "./components/inputs/InputText.component";
import { InputSubmit } from "./components/inputs/InputSubmit.component";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Composant principal de l'application.
 * - Affiche la liste des prédictions (publications).
 * - Si l'utilisateur est authentifié, affiche un bouton pour ouvrir un petit formulaire
 *   (utilise `InputText` et `InputSubmit`) afin de créer une nouvelle prédiction.
 */
function Index() {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const [predictions, setPredictions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dateFin, setDateFin] = useState("");
            const [optionKey, setOptionKey] = useState("");
            const [options, setOptions] = useState<Record<string, number>>({});
    const [error, setError] = useState<string | null>(null);

    const fetchPredictions = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/prediction`);
            setPredictions(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

        useEffect(() => {
            if (isAuthenticated) {
                fetchPredictions();
            }
        }, [isAuthenticated]);

    const handleLogout = () => {
        logout();
        navigate("/signin");
    };

    const submitPrediction = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError(null);

        if (!title) return setError("Le titre est requis");
        if (!dateFin) return setError("La date de fin est requise");

        const token = localStorage.getItem("token");
        if (!token) return setError("Utilisateur non authentifié");

        try {
            const payload = { title, description, dateFin: new Date(dateFin).toISOString(), options };
            await axios.post(`${API_URL}/prediction`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // refresh list and hide form
            await fetchPredictions();
            setShowForm(false);
            setTitle("");
            setDescription("");
            setDateFin("");
            setOptions({});
        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.message || "Erreur lors de la création");
        }
    };

        if (!isAuthenticated) {
            return (
                <div>
                    <h1>Bienvenue sur notre application</h1>
                    <p>Veuillez vous connecter ou vous inscrire pour continuer.</p>
                </div>
            );
        }

        return (
            <div className="max-w-3xl mx-auto p-4">
            <header className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Publications</h1>
                {isAuthenticated ? (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowForm((s) => !s)}
                            className="px-3 py-1 bg-blue-500 text-white rounded"
                        >
                            {showForm ? "Annuler" : "Créer une prédiction"}
                        </button>
                        <button onClick={handleLogout} className="px-3 py-1 bg-gray-200 rounded">
                            Déconnexion
                        </button>
                    </div>
                ) : (
                    <div>
                        <p>Veuillez vous connecter pour créer une prédiction.</p>
                    </div>
                )}
            </header>

            {showForm && isAuthenticated && (
            <form className="mb-6 space-y-3" onSubmit={submitPrediction}>
                    <InputText
                        label="Titre"
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Titre de la prédiction"
                    />

                    <InputText
                        label="Description"
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Courte description"
                    />

                    <InputText
                        label="Date de fin"
                        name="dateFin"
                        type="date"
                        value={dateFin}
                        onChange={(e) => setDateFin(e.target.value)}
                    />

                                {/* Options map inputs */}
                                <div className="grid grid-cols-3 gap-2 items-end">
                                                    <InputText
                                                        label="Option clef"
                                                        name="optionKey"
                                                        value={optionKey}
                                                        onChange={(e) => setOptionKey(e.target.value)}
                                                        placeholder="ex: yes"
                                                    />

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (!optionKey) return setError("La clé de l'option est requise");
                                                                // initial votes count is 0
                                                                setOptions((prev) => ({ ...prev, [optionKey]: 0 }));
                                                                setOptionKey("");
                                                                setError(null);
                                                            }}
                                                            className="px-3 py-2 bg-green-500 text-white rounded"
                                                        >
                                                            Ajouter option
                                                        </button>
                                                    </div>
                                </div>

                                {Object.keys(options).length > 0 && (
                                    <div className="mt-2">
                                        <div className="text-sm font-medium">Options ajoutées :</div>
                                        <ul className="text-sm space-y-1">
                                            {Object.entries(options).map(([k, _]) => (
                                                <li key={k} className="flex items-center justify-between">
                                                    <span>{k}</span>
                                                    <button type="button" onClick={() => {
                                                        setOptions((prev) => { const next = { ...prev }; delete next[k]; return next; });
                                                    }} className="text-red-500">Supprimer</button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                    {error && <div className="text-red-500">{error}</div>}

                    <InputSubmit value="Créer" onClick={submitPrediction} />
                </form>
            )}

            <section>
                {loading ? (
                    <div>Chargement...</div>
                ) : predictions.length === 0 ? (
                    <div>Aucune publication pour le moment.</div>
                ) : (
                    <ul className="space-y-4">
                        {predictions.map((p) => (
                            <li key={p._id} className="p-3 border rounded">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold">{p.title}</h3>
                                        {p.description && <p className="text-sm text-gray-600">{p.description}</p>}
                                        <p className="text-xs text-gray-500">Fin: {new Date(p.dateFin).toLocaleString()}</p>
                                    </div>
                                    <div className="text-sm text-neutral-700">{p.status}</div>
                                </div>
                                {p.options && (
                                    <div className="mt-2 text-xs text-gray-600">
                                        Options: {Object.entries(p.options).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}

export default Index;