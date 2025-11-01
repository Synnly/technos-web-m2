export interface ButtonTableProps {
	id: string;

	validateTitle: string;
	validateContent: string;
	validateOnOk: (id: string) => Promise<void> | void;
	refuseTitle: string;
	refuseContent: string;
	refuseOnOk: (id: string) => Promise<void> | void;
}
