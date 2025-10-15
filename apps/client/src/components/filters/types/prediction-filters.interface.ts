import type { FiltersState } from "./filters.interface";

export interface PredictionFiltersProps {
	value?: FiltersState;
	onChange?: (s: FiltersState) => void;
	className?: string;
}
