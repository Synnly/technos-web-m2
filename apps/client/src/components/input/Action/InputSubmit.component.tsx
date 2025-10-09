import React from "react";
import { Button } from "antd";
import type { InputSubmitProps } from "./InputSubmit.interface";

const InputSubmit: React.FC<InputSubmitProps> = ({
	text = "Envoyer",
	disabled = false,
	className,
}) => {
	return (
		<Button
			type="primary"
			htmlType="submit"
			disabled={disabled}
			className={className}
		>
			{text}
		</Button>
	);
};

export default InputSubmit;
