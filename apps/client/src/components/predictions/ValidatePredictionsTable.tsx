import React, { useEffect } from "react";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import Pagination from "../pagination/Pagination";
import ValidateRefuseButtons from "./button-table/ValidateRefuseButtons";
import type { ValidatedPrediction } from "../../modules/prediction/prediction.interface";
import PredictionController from "../../modules/prediction/prediction.controller";

interface Props {
	data: ValidatedPrediction[];
	usersMap?: Record<string, string>;
	pageSize?: number;
	onValidate: (id: string) => Promise<void> | void;
	onRefuse: (id: string) => Promise<void> | void;
}

export const ValidatePredictionsTable: React.FC<Props> = ({
	data,
	usersMap = {},
	pageSize = 10,
	onValidate,
	onRefuse,
}) => {
	const navigate = useNavigate();
	const token = localStorage.getItem("token");
	const [waitingPredictions, setWaitingPredictions] = React.useState<ValidatedPrediction[]>([]);

	const columns = React.useMemo<ColumnDef<ValidatedPrediction>[]>(
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
				id: "actions",
				header: "Actions",
				cell: ({ row }: any) => (
					<div className="flex items-center justify-between">
						<button
							onClick={() => navigate(`/prediction/${row.original._id}`)}
							className="px-3 py-1 rounded bg-gray-700 text-white text-sm hover:bg-gray-600 cursor-pointer"
						>
							Voir
						</button>
						<ValidateRefuseButtons
							id={row.original._id}
							validateOnOk={onValidate}
							refuseOnOk={onRefuse}
							validateTitle="Valider la prédiction"
							validateContent="Êtes-vous sûr de vouloir valider cette prédiction ?"
							refuseTitle="Refuser la prédiction"
							refuseContent="Êtes-vous sûr de vouloir refuser cette prédiction ? Cette action mettra à jour son statut."
						/>
					</div>
				),
			},
		],
		[navigate, usersMap, onValidate, onRefuse],
	);

	const [currentPage, setCurrentPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(pageSize);

	const table = useReactTable({
		data: waitingPredictions,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const rows = table.getRowModel().rows;
	const visibleRows = rows.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

	const getWaitingPredictions = async () => {
		const data = await PredictionController.getWaitingPredictions(
			currentPage.toString(),
			rowsPerPage.toString(),
			token,
		);
		setWaitingPredictions(data);
	};

	useEffect(() => {
		getWaitingPredictions();
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
						{visibleRows.map((row: any) => (
							<tr key={row.id} className="border-t border-gray-700 hover:bg-gray-900">
								{row.getVisibleCells().map((cell: any) => (
									<td key={cell.id} className="px-3 py-3 align-top">
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						))}
						{visibleRows.length === 0 && (
							<tr>
								<td colSpan={columns.length} className="text-center text-sm text-gray-400 py-6">
									Aucune prédiction en attente
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			<div className="mt-3">
				<Pagination
					totalItems={data.length}
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
