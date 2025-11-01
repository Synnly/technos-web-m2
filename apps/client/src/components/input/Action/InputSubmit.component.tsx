import React from "react";
import { Button, ConfigProvider } from "antd";
import type { InputSubmitProps } from "./InputSubmit.interface";

const InputSubmit: React.FC<InputSubmitProps> = ({
	text = "Envoyer",
	disabled = false,
	className,
}) => {
	return (
		<>
			<ConfigProvider
				theme={{
					token: {
						colorPrimary: "#645209",
						colorPrimaryHover: "#78620A",
						colorTextLightSolid: "#e5e7eb",
					},
				}}
			>
				<Button
					type="primary"
					htmlType="submit"
					disabled={disabled}
					className={className}
					color="primary"
					variant="solid"
				>
					{text}
				</Button>
			</ConfigProvider>
		</>
	);
};

export default InputSubmit;
