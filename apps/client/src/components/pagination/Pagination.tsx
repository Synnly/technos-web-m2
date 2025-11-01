import React from "react";

interface Props {
	totalItems: number;
	currentPage: number; // zero-based
	pageSize: number;
	onPageChange: (page: number) => void; // receives zero-based page
	onPageSizeChange?: (size: number) => void;
	pageSizeOptions?: number[];
	className?: string;
}

const Pagination: React.FC<Props> = ({
	totalItems,
	currentPage,
	pageSize,
	onPageChange,
	onPageSizeChange,
	pageSizeOptions = [5, 10, 20, 50],
	className = "",
}) => {
	const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));

	const goTo = (page: number) => {
		const p = Math.max(0, Math.min(pageCount - 1, page));
		onPageChange(p);
	};

	return (
		<div className={`flex items-center justify-between text-sm ${className}`}>
			<div className="text-gray-300">{totalItems} résultat(s)</div>

			<div className="flex items-center gap-2">
				<button
					onClick={() => goTo(0)}
					disabled={currentPage === 0}
					className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
					aria-label="Première page"
				>
					«
				</button>
				<button
					onClick={() => goTo(currentPage - 1)}
					disabled={currentPage === 0}
					className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
					aria-label="Page précédente"
				>
					Prev
				</button>

				<div className="text-gray-300 px-2">
					{currentPage + 1} / {pageCount}
				</div>

				<button
					onClick={() => goTo(currentPage + 1)}
					disabled={currentPage >= pageCount - 1}
					className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
					aria-label="Page suivante"
				>
					Next
				</button>
				<button
					onClick={() => goTo(pageCount - 1)}
					disabled={currentPage >= pageCount - 1}
					className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
					aria-label="Dernière page"
				>
					»
				</button>

				{onPageSizeChange && (
					<select
						value={pageSize}
						onChange={(e) => onPageSizeChange(Number(e.target.value))}
						className="ml-2 bg-gray-700 text-white rounded px-2 py-1 text-sm"
						aria-label="Taille de la page"
					>
						{pageSizeOptions.map((n) => (
							<option key={n} value={n}>
								{n}/page
							</option>
						))}
					</select>
				)}
			</div>
		</div>
	);
};

export default Pagination;
