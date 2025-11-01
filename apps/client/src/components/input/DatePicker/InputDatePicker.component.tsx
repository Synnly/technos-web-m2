import React from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import type { InputDatePickerProps } from "./InputDatePicker.interface";

export const InputDatePicker: React.FC<InputDatePickerProps> = ({
	value,
	onChange,
	placeholder,
	disabled,
	className,
}) => {
	return (
		<DatePicker
			value={value ?? null}
			onChange={(date) => onChange && onChange(date)}
			disabledDate={(current) => {
				if (!current) return false;
				return current.isBefore(dayjs(), "day");
			}}
			placeholder={placeholder}
			disabled={disabled}
			className={className}
		/>
	);
};

export default InputDatePicker;
