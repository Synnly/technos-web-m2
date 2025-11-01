import React from "react";
import DateRangeFilter from "./DateRangeFilter";
import type { FiltersState } from "./types/filters.interface";
import type { PredictionFiltersProps } from "./types/prediction-filters.interface";

export const PredictionFilters: React.FC<PredictionFiltersProps> = ({
	value = {},
	onChange,
	className,
}) => {
	const update = (patch: Partial<FiltersState>) =>
		onChange && onChange({ ...(value || {}), ...patch });

	return (
		<div className={className}>
			<div className="flex items-center gap-2">
				<DateRangeFilter
					value={value.dateRange as any}
					onChange={(r) => update({ dateRange: r })}
				/>
			</div>
		</div>
	);
};

export default PredictionFilters;
