import type { FormInstance } from "antd";

export interface InputResetProps {
	form?: FormInstance;
	onReset?: () => void;
	text?: string;
	className?: string;
}
