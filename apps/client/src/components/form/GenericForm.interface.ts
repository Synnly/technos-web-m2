import type { FormInstance } from "antd";
import type { FormField } from "../modal/modal.interface";

export interface GenericFormProps {
	title: string;
	fields: FormField[];
	initialValues?: Record<string, any>;
	form?: FormInstance;
	layout?: "vertical" | "horizontal" | "inline";
	onFinish?: (values: any) => void;
}
