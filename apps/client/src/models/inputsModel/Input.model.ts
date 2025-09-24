// Définition du type pour un input
export interface InputProps {
  	label?: string;
  	type?: string;
  	placeholder?: string;
  	error?: string;
  	register?: any;
  	name: string;
  	rules?: any;
  	value?: string;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	min?: string;
}