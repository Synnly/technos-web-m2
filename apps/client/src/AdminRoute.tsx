import { Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
	const { isAuthenticated, isLoading, isAdmin } = useAuth();

	if (isLoading) return <p>Chargement...</p>;

	if (!isAuthenticated || !isAdmin) {
		return <Navigate to="/" replace />;
	}

	return children;
};

export default AdminRoute;
