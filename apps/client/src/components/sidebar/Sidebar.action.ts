import React from "react";
import { Crown, Grid2X2, Home, Plus, Shirt, ShoppingBag, TicketPlus, UserRound } from "lucide-react";
import type { NavigationSectionProps } from "./navigation/navigation-section/NavigationSection.interface";

export const getActions = (onCreatePrediction: () => void): NavigationSectionProps[] => [
	{
		title: "Compte",
		roles: ["user", "admin"],
		items: [
			{
				id: "edit-profile",
				icon: React.createElement(UserRound, { className: "w-5 h-5" }),
				title: "Gestion du compte",
				description: "",
				colorScheme: "green",
				path: "/dashboard",
			},
		],
	},
	{
		title: "Predictions",
		roles: ["user", "admin"],
		items: [
			{
				id: "create-prediction",
				icon: React.createElement(Plus, { className: "w-5 h-5" }),
				title: "Créer une prédiction",
				description: "",
				colorScheme: "blue",
				path: "",
				onClick: onCreatePrediction,
			},
		],
	},
	{
		title: "Explorer",
		roles: ["user", "admin"],
		items: [
			{
				id: "home",
				icon: React.createElement(Home, { className: "w-5 h-5" }),
				title: "Page d'accueil",
				description: "",
				colorScheme: "yellow",
				path: "/",
			},
			{
				id: "all-predictions",
				icon: React.createElement(Grid2X2, {
					className: "w-5 h-5",
				}),
				title: "Voir toutes les prédictions",
				description: "",
				colorScheme: "yellow",
				path: "/predictions",
			},
		],
	},
	{
		title: "Cosmetics",
		roles: ["user", "admin"],
		items: [
			{
				id: "buy-cosmetic",
				icon: React.createElement(ShoppingBag, {
					className: "w-5 h-5",
				}),
				title: "Boutique",
				description: "Customise ton profil",
				colorScheme: "pink",
				path: "/shop",
			},
		],
	},
	{
		title: "Administrateur",
		roles: ["admin"],
		items: [
			{
				id: "validate-prediction",
				icon: React.createElement(TicketPlus, { className: "w-5 h-5" }),
				title: "Valider une prédiction",
				description: "",
				colorScheme: "red",
				path: "/validate-prediction",
			},
			{
				id: "confirm-results",
				icon: React.createElement(Crown, { className: "w-5 h-5" }),
				title: "Confirmer les résultats",
				description: "",
				colorScheme: "red",
				path: "/confirm-results",
			},
			{
				id: "create-cosmetic",
				icon: React.createElement(Shirt, { className: "w-5 h-5" }),
				title: "Créer un cosmetic",
				description: "",
				colorScheme: "red",
				path: "/create-cosmetic",
			},
		],
	},
];
