import React from "react";
import { Button } from "antd";
import type { InputResetProps } from "./InputReset.interface";

const InputReset: React.FC<InputResetProps> = ({
	form,
	onReset,
	text = "Réinitialiser",
	className,
}) => {
	const handleReset = () => {
		if (onReset) return onReset();
		if (form && typeof form.resetFields === "function") {
			form.resetFields();
		}
	};

	return (
		<Button
			onClick={handleReset}
			className={className}
			color="red"
			variant="solid"
		>
			{text}
		</Button>
	);
};

export default InputReset;
