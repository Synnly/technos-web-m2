import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode, type JwtPayload } from "jwt-decode";

const API_URL = import.meta.env.VITE_API_URL;

interface TokenJwtPayload extends JwtPayload {
	username: string;
	role: string;
}

export const useAuth = () => {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [username, setUsername] = useState<string | null>(null);
	const [role, setRole] = useState<string | null>(null);

	useEffect(() => {
		const token = localStorage.getItem("token");

		if (!token) {
			setIsLoading(false);
			localStorage.removeItem("token");
			return;
		}
		axios
			.post(`${API_URL}/token/check`, { token })
			.then(() => {
				setIsAuthenticated(true);
				setUsername(jwtDecode<TokenJwtPayload>(token).username);
				setRole(jwtDecode<TokenJwtPayload>(token).role);
				setIsLoading(false);
			})
			.catch(() => {
				localStorage.removeItem("token");
				setIsLoading(false);
			});
	}, []);

	const logout = () => {
		localStorage.removeItem("token");
		setIsAuthenticated(false);
		setRole(null);
		setUsername(null);
	};
	const isAdmin = role === "admin";

	return { isAuthenticated, isLoading, logout, username, isAdmin };
};
