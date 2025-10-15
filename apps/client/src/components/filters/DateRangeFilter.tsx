import React from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import type { DateRangeFilterProps } from "./types/date-range-filter.interface";

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
	value = null,
	onChange,
	className,
}) => {
	return (
		<DatePicker.RangePicker
			className={`date-range-filter ${className ?? ""}`}
			value={value as any}
			onChange={(vals) =>
				onChange && onChange(vals ? (vals as any) : null)
			}
			disabledDate={(current) =>
				current && current.isBefore(dayjs().subtract(1, "day"), "day")
			}
		/>
	);
};

export default DateRangeFilter;
