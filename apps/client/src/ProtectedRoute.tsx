import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * Composant pour une route protégée.
 * @param param0 Props contenant les enfants à rendre si l'utilisateur est authentifié.
 * @returns Les enfants si l'utilisateur est authentifié, sinon redirige vers la page de connexion.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div>Chargement...</div>;
    }

    if (!isAuthenticated) {
        // Sauvegarder l'URL de destination dans l'état de navigation
        return <Navigate 
            to="/signin" 
            state={{ from: location.pathname + location.search }} 
            replace 
        />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;