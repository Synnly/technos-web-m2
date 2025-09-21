import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

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