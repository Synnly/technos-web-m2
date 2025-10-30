import React from "react";
import { Modal } from "antd";
import type { ButtonTableProps } from "./button-table.interface";

const ValidateRefuseButtons: React.FC<ButtonTableProps> = ({
	id,
	validateTitle,
	validateContent,
	validateOnOk,
	refuseTitle,
	refuseContent,
	refuseOnOk,
}) => {
	const handleValidate = () => {
		const okHandler = validateOnOk;
		Modal.confirm({
			title: validateTitle,
			content: validateContent,
			okText: "Valider",
			okType: "primary",
			cancelText: "Annuler",
			onOk: async () => {
				if (!okHandler) return;
				try {
					await okHandler(id);
				} catch (e) {
					console.error(e);
				}
			},
		});
	};

	const handleRefuse = () => {
		const okHandler = refuseOnOk;
		Modal.confirm({
			title: refuseTitle,
			content: refuseContent,
			okText: "Refuser",
			cancelText: "Annuler",
			okType: "danger",
			onOk: async () => {
				if (!okHandler) return;
				try {
					await okHandler(id);
				} catch (e) {
					console.error(e);
				}
			},
		});
	};

	return (
		<div className={"flex gap-2"}>
			<button
				onClick={handleValidate}
				className="px-3 py-1 rounded bg-green-600 text-white text-sm hover:bg-green-500 cursor-pointer"
				aria-label="Valider"
			>
				Valider
			</button>

			<button
				onClick={handleRefuse}
				className="px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-500 cursor-pointer"
				aria-label="Refuser"
			>
				Refuser
			</button>
		</div>
	);
};

export default ValidateRefuseButtons;
