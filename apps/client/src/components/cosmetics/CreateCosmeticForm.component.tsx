import React, { useState } from "react";
import { Form, Input } from "antd";
import InputText from "../input/Text/InputText.component";
import InputReset from "../input/Action/InputReset.component";
import InputSubmit from "../input/Action/InputSubmit.component";
import { useAuth } from "../../hooks/useAuth";
import CosmeticController from "../../modules/cosmetic/cosmetic.controller";
import type { CreateCosmetic } from "../../modules/cosmetic/cosmetic.interface";

type CreateCosmeticInputs = {
	name: string;
	cost: number | string;
	type: string;
	value?: string;
};

const NumberInput: React.FC<{ value?: any; onChange?: (v: any) => void; placeholder?: string }> = ({
	value,
	onChange,
	placeholder,
}) => (
	<Input
		value={value as any}
		onChange={(e) => onChange && onChange(e.target.value === "" ? "" : Number(e.target.value))}
		placeholder={placeholder}
		type="number"
	/>
);

const SelectInput: React.FC<{
	value?: string;
	onChange?: (v: string) => void;
	options: { value: string; label: string }[];
}> = ({ value, onChange, options }) => (
	<select
		value={value}
		onChange={(e) => onChange && onChange(e.target.value)}
		className="w-full p-2 border rounded bg-transparent text-white"
	>
		{options.map((o) => (
			<option key={o.value} value={o.value} className="text-black">
				{o.label}
			</option>
		))}
	</select>
);

export default function CreateCosmeticForm() {
	const [form] = Form.useForm<CreateCosmeticInputs>();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { username } = useAuth();
	const token = localStorage.getItem("token");

	const onFinish = async (values: CreateCosmeticInputs) => {
		setError(null);
		if (!values.name) return setError("Le nom est requis");
		if (!values.cost || Number(values.cost) <= 0) return setError("Le coût est requis et doit être > 0");

		setLoading(true);
		try {
			const cosmetic: CreateCosmetic = {
				name: values.name,
				cost: Number(values.cost),
				type: values.type == "badge" ? "badge" : "color",
				value: values.value || "",
			};
			CosmeticController.createCosmetic(cosmetic, token, username, undefined);
			form.resetFields();
		} catch (err: any) {
			setError(err?.response?.data?.message || "Erreur lors de la création");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-4 border rounded mb-4 bg-gray-800">
			<Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ type: "badge" }}>
				<h4 className="font-semibold mb-2 text-white">Créer un cosmétique</h4>

				<Form.Item
					name="name"
					label={<span style={{ color: "white" }}>Nom</span>}
					rules={[{ required: true, message: "Nom requis" }]}
				>
					<InputText placeholder="Nom" />
				</Form.Item>

				<Form.Item
					name="cost"
					label={<span style={{ color: "white" }}>Coût</span>}
					rules={[{ required: true, message: "Coût requis" }]}
				>
					<NumberInput placeholder="Coût" />
				</Form.Item>

				<Form.Item name="type" label={<span style={{ color: "white" }}>Type</span>}>
					<SelectInput
						options={[
							{ value: "badge", label: "Badge" },
							{ value: "color", label: "Color" },
						]}
					/>
				</Form.Item>

				<Form.Item
					name="value"
					label={<span style={{ color: "white" }}>Valeur</span>}
					rules={[{ required: true, message: "Valeur requis" }]}
				>
					<InputText placeholder="valeur" />
				</Form.Item>

				{error && <div className="text-red-400 text-sm mb-2">{error}</div>}

				<Form.Item className="flex justify-center items-center">
					<div className="flex gap-2">
						<InputReset form={form} text="Réinitialiser" className="text-white" />
						<InputSubmit text={loading ? "Création..." : "Créer"} className="text-white" />
					</div>
				</Form.Item>
			</Form>
		</div>
	);
}
