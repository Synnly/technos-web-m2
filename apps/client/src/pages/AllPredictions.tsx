import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Sidebar from "../components/sidebar/Sidebar.component";
import { useState } from "react";
import type { Toast } from "../components/toast/Toast.interface";
import PredictionCard from "../components/predictions/PredictionCard";

function AllPredictions() {
	const { username } = useAuth();
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [user, setUser] = useState<any>(null);
	const [toast, setToast] = useState<Toast | null>(null);
	const [open, setOpen] = useState(false);
    const token = localStorage.getItem("token");
    const [predictions, setPredictions] = useState<any[]>([]);
    const [usersMap, setUsersMap] = useState<Record<string, string>>({});


	return (
		<>
			<Sidebar
				user={user}
				token={token!}
				setUser={() => {}}
				setPoints={() => {}}
				setToast={setToast}
				setModalOpen={setOpen}
				onCollapsedChange={(value: boolean) =>
					setSidebarCollapsed(value)
				}
			/>
            {/* Create div for predictions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-white cursor-pointer">
                {predictions.map((prediction) => (
                    <PredictionCard
                        key={prediction._id}
                        id={prediction._id}
                        title={prediction.title}
                        author={usersMap[prediction.user_id]}
                        votes={prediction.nbVotes}
                        comments={prediction.nbPublications}
                        percentLabel={"0"}
                        percent={10}
                        endsIn={prediction.dateFin.toString()}
                        onClick={() => {}}
                    />
                ))}
            </div>
		</>
	);
}

export default AllPredictions;
