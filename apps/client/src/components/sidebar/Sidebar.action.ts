import React from "react";
import { Plus, ShoppingBag } from "lucide-react";
import type { NavigationSectionProps } from "./navigation/navigation-section/NavigationSection.interface";


const Actions: NavigationSectionProps[] = [
	{
		title: "Predictions",
		items: [
			{
				id: "create-prediction",
				icon: React.createElement(Plus, { className: "w-5 h-5" }),
				title: "Créer une prédiction",
				description: "Commencez une nouvelle prédiction",
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
