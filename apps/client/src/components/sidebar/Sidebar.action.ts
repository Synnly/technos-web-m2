import React from "react";
import { Plus, ShoppingBag, UserRound } from "lucide-react";
import type { NavigationSectionProps } from "./navigation/navigation-section/NavigationSection.interface";

const Actions: NavigationSectionProps[] = [
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
		title: "Predictions",
		items: [
			{
				id: "create-prediction",
				icon: React.createElement(Plus, { className: "w-5 h-5" }),
				title: "Créer une prédiction",
				description: "",
				colorScheme: "blue",
				path: "",
			},
		],
	},

	{
		title: "Cosmetics",
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

export default Actions;
