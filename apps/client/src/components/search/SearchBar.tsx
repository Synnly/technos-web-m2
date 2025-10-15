import React from "react";
import { Input } from "antd";
import type { InputProps } from "antd";

const { Search } = Input;

type SearchBarProps = {
	value?: string;
	onSearch?: (value: string) => void;
	placeholder?: string;
	className?: string;
	inputProps?: Omit<InputProps, "onSearch">;
};

export const SearchBar: React.FC<SearchBarProps> = ({
	value,
	onSearch,
	placeholder = "Rechercher...",
	className,
	inputProps,
}) => {
	return (
		<div className={className}>
			<Search
				className={`search-bar ${className ?? ""}`}
				defaultValue={value}
				onSearch={(v) => onSearch && onSearch(v)}
				placeholder={placeholder}
				enterButton
				{...inputProps}
			/>
		</div>
	);
};

export default SearchBar;
