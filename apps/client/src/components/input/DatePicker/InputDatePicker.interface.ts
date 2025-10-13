import type { Dayjs } from "dayjs";

export interface InputDatePickerProps {
	value?: Dayjs | null;
	onChange?: (value: Dayjs | null) => void;
	placeholder?: string;
	disabled?: boolean;
	name?: string;
	className?: string;
}
