import React from "react";
import type { InputSubmitProps } from "../../models/inputsModel/InputSubmit.model";

export const InputSubmit: React.FC<InputSubmitProps> = ({ value, onClick }) => {
	return (
		<input
			type="submit"
			value={value}
			onClick={onClick}
			className="bg-neutral-500 hover:bg-neutral-600 text-neutral-200 text-md font-semibold py-2 px-6 rounded-sm cursor-pointer"
		/>
	);
};
