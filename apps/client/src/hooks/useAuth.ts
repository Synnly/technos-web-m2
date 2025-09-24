import { useState, useEffect } from 'react';
import { jwtDecode, type JwtPayload } from 'jwt-decode';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (token) {
            try {
                const decodedToken: JwtPayload = jwtDecode(token);
                
                // Vérifier si le token est expiré
                if (Date.now() < decodedToken.exp! * 1000) {
                    setIsAuthenticated(true);
                    // token was signed with payload { username }
                    setUsername((decodedToken as any).username ?? null);
                } else {
                    localStorage.removeItem('token');
                    setIsAuthenticated(false);
                }
            } catch (error) {
                localStorage.removeItem('token');
                setIsAuthenticated(false);
            }
        } else {
            setIsAuthenticated(false);
        }
        
        setIsLoading(false);
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUsername(null);
    };

    return { isAuthenticated, isLoading, logout, username };
};