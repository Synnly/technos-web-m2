import React from "react";
import { Grid2X2, Home, Plus, ShoppingBag, UserRound } from "lucide-react";
import type { NavigationSectionProps } from "./navigation/navigation-section/NavigationSection.interface";

export const getActions = (
	onCreatePrediction: () => void,
): NavigationSectionProps[] => [
	{
		title: "Explorer",
		items: [
			{
				id: "home",
				icon: React.createElement(Home, { className: "w-5 h-5" }),
				title: "Page d'accueil",
				description: "",
				colorScheme: "blue",
				path: "/",
			},
		],
	},
	{
		title: "Predictions",
		items: [
			{
				id: "create-prediction",
				icon: React.createElement(Plus, { className: "w-5 h-5" }),
				title: "Créer une prédiction",
				description: "",
				colorScheme: "yellow",
				path: "",
				onClick: onCreatePrediction,
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
		title: "Compte",
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
		title: "Cosmetiques",
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
];
