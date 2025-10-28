import React, { useEffect } from "react";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import Pagination from "../../pagination/Pagination";
import type { Prediction } from "../../../modules/prediction/prediction.interface";
import PredictionController from "../../../modules/prediction/prediction.controller";

import type { Toast } from "../../../components/toast/Toast.interface";

interface Props {
	usersMap: Record<string, string>;
	pageSize?: number;
	setToast?: React.Dispatch<React.SetStateAction<Toast | null>>;
}

const ConfirmResultsTable: React.FC<Props> = ({ usersMap, pageSize = 10, setToast }) => {
	const navigate = useNavigate();
	const token = localStorage.getItem("token");
	const [expiredPredictions, setExpiredPredictions] = React.useState<Prediction[]>([]);
	const [totalCount, setTotalCount] = React.useState<number | null>(null);
	const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string>>({});
	const handleValidateClick = React.useCallback(
		async (predictionId: string) => {
			const winningOption = selectedOptions[predictionId] ?? "";
			await PredictionController.validateAPrediction(predictionId, token, winningOption, setToast);
			setExpiredPredictions((prev) => prev.filter((p) => p._id !== predictionId));
			setToast?.({ message: "Résultat confirmé avec succès", type: "success" });
			setTotalCount((prev) => (prev !== null ? prev - 1 : null));

		},
		[selectedOptions, token],
	);

	const columns = React.useMemo<ColumnDef<Prediction>[]>(
		() => [
			{
				header: "Titre",
				accessorKey: "title",
				cell: ({ row }: any) => (
					<button
						onClick={() => navigate(`/prediction/${row.original._id}`)}
						className="text-left text-sm font-medium text-white hover:underline cursor-pointer"
					>
						{row.original.title}
					</button>
				),
			},
			{
				header: "Auteur",
				accessorKey: "user_id",
				cell: ({ getValue }: any) => (
					<span className="text-sm text-gray-300">{usersMap[String(getValue())] || "–"}</span>
				),
			},
			{
				header: "Fin",
				accessorKey: "dateFin",
				cell: ({ getValue }: any) => (
					<span className="text-sm text-gray-300">
						{getValue() ? format(new Date(getValue() as string), "dd MMM yyyy HH:mm") : "–"}
					</span>
				),
			},
			{
				id: "select",
				header: "Choix gagnant",
				cell: ({ row }: any) => {
					const opts = row.original.options || {};
					const optionKeys = Object.keys(opts);
					const value = selectedOptions[row.original._id] ?? "";

					return (
						<div className="flex items-center gap-3">
							<select
								value={value}
								onChange={(e) =>
									setSelectedOptions((s) => ({ ...s, [row.original._id]: e.target.value }))
								}
								className="bg-gray-700 text-white text-sm px-2 py-1 rounded"
							>
								<option value="">Sélectionner</option>
								{optionKeys.map((k) => (
									<option key={k} value={k}>
										{k} {typeof opts[k] === "number" ? `(${opts[k]})` : ""}
									</option>
								))}
							</select>

							<button
								onClick={() => handleValidateClick(row.original._id)}
								className="px-3 py-1 rounded bg-green-600 text-white text-sm hover:bg-green-500"
							>
								Valider
							</button>
						</div>
					);
				},
			},
		],
		[navigate, usersMap, selectedOptions],
	);

	const [currentPage, setCurrentPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(pageSize);

	const table = useReactTable({
		data: expiredPredictions,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const rows = table.getRowModel().rows;
	const fetchTotalCount = async () => {
		if (!token) return;
		try {
			const all = await PredictionController.getExpiredPredictions(token, "1", String(1000000));
			setTotalCount((all || []).length);
		} catch (_) {
			setTotalCount(null);
		}
	};

	const fetchPage = async (pageIndex: number, limitNum: number) => {
		if (!token) return;
		try {
			const data = await PredictionController.getExpiredPredictions(token, String(pageIndex), String(limitNum));
			setExpiredPredictions(data || []);
		} catch (_) {
			setExpiredPredictions([]);
		}
	};

	useEffect(() => {
		if (!token) return;
		fetchTotalCount();
		fetchPage(1, rowsPerPage);
	}, [token]);

	useEffect(() => {
		fetchPage(currentPage + 1, rowsPerPage);
	}, [currentPage, rowsPerPage, token]);

	return (
		<div className="bg-gray-800 rounded-lg shadow p-4">
			<div className="overflow-x-auto">
				<table className="w-full table-auto">
					<thead>
						<tr>
							{table.getHeaderGroups().map((hg: any) =>
								hg.headers.map((h: any) => (
									<th key={h.id} className="text-left text-xs text-gray-400 px-3 py-2">
										{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
									</th>
								)),
							)}
						</tr>
					</thead>
					<tbody>
						{rows.map((row: any) => (
							<tr key={row.id} className="border-t border-gray-700 hover:bg-gray-900">
								{row.getVisibleCells().map((cell: any) => (
									<td key={cell.id} className="px-3 py-3 align-top">
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						))}
						{rows.length === 0 && (
							<tr>
								<td colSpan={columns.length} className="text-center text-sm text-gray-400 py-6">
									Aucune prédiction expirée
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			<div className="mt-3">
				<Pagination
					totalItems={totalCount ?? expiredPredictions.length}
					currentPage={currentPage}
					pageSize={rowsPerPage}
					onPageChange={(p) => setCurrentPage(p)}
					onPageSizeChange={(s) => {
						setRowsPerPage(s);
						setCurrentPage(0);
					}}
				/>
			</div>
		</div>
	);
};

export default ConfirmResultsTable;
