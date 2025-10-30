import React, { useEffect } from "react";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import Pagination from "../pagination/Pagination";
import ValidateRefuseButtons from "./button-table/ValidateRefuseButtons";
import type { ValidatedPrediction } from "../../modules/prediction/prediction.interface";
import PredictionController from "../../modules/prediction/prediction.controller";
import type { Toast } from "../toast/Toast.interface";
import type { PublicUser } from "../../modules/user/user.interface";

interface Props {
	usersMap?: Array<PublicUser> | null;
	setToast?: React.Dispatch<React.SetStateAction<Toast | null>>;
}

export const ValidatePredictionsTable: React.FC<Props> = ({ usersMap = null, setToast }) => {
	const navigate = useNavigate();
	const pageSize = 10;
	const token = localStorage.getItem("token");
	const [waitingPredictions, setWaitingPredictions] = React.useState<ValidatedPrediction[]>([]);
	const [totalCount, setTotalCount] = React.useState<number | null>(null);

	const handleValidate = async (id: string) => {
		if (!token) {
			setToast?.({ message: "Utilisateur non authentifié", type: "error" });
			return;
		}
		try {
			await PredictionController.updatePredictionStatus(id, "validate", token!, setToast);
			setWaitingPredictions((prev) => prev.filter((p) => p._id !== id));
			setTotalCount((prev) => (prev !== null ? prev - 1 : null));
			setToast?.({ message: "Prédiction validée", type: "success" });
		} catch (err: any) {
			console.error(err);
			setToast?.({ message: err?.message || "Erreur lors de la validation", type: "error" });
		}
	};

	const handleRefuse = async (id: string) => {
		if (!token) {
			setToast?.({ message: "Utilisateur non authentifié", type: "error" });
			return;
		}
		try {
			await PredictionController.updatePredictionStatus(id, "refuse", token!, setToast);
			setWaitingPredictions((prev) => prev.filter((p) => p._id !== id));
			setToast?.({ message: "Prédiction refusée", type: "success" });
			setTotalCount((prev) => (prev !== null ? prev - 1 : null));
		} catch (err: any) {
			console.error(err);
			setToast?.({ message: err?.message || "Erreur lors du refus", type: "error" });
		}
	};

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
					<span className="text-sm text-gray-300">
						{usersMap?.find((u) => u._id === getValue())?.username || "–"}
					</span>
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
				header: "Description",
				accessorKey: "description",
				cell: ({ getValue }: any) => (
					<span className={`text-sm text-gray-300 ${getValue() !== undefined ? "" : "italic text-gray-500"}`}>
						{getValue() !== undefined
							? (getValue() as string)?.length > 50
								? `${(getValue() as string).substring(0, 50)}...`
								: getValue()
							: "Pas de description fournie"}
					</span>
				),
			},
			{
				id: "actions",
				header: "Actions",
				cell: ({ row }: any) => (
					<div className="flex items-center justify-between w-fit">
						<ValidateRefuseButtons
							id={row.original._id}
							validateOnOk={handleValidate}
							refuseOnOk={handleRefuse}
							validateTitle="Valider la prédiction"
							validateContent="Êtes-vous sûr de vouloir valider cette prédiction ?"
							refuseTitle="Refuser la prédiction"
							refuseContent="Êtes-vous sûr de vouloir refuser cette prédiction ? Cette action mettra à jour son statut."
						/>
					</div>
				),
			},
		],
		[navigate, usersMap, handleValidate, handleRefuse],
	);

	const [currentPage, setCurrentPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(pageSize);

	const table = useReactTable({
		data: waitingPredictions,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const rows = table.getRowModel().rows;

	const fetchTotalCount = async () => {
		if (!token) return;
		try {
			const all = await PredictionController.getWaitingPredictions("1", String(1000000), token);
			setTotalCount((all || []).length);
		} catch (_) {
			setTotalCount(null);
		}
	};

	const fetchPage = async (pageIndex: number, limitNum: number) => {
		if (!token) return;
		try {
			const data = await PredictionController.getWaitingPredictions(String(pageIndex), String(limitNum), token);
			setWaitingPredictions(data || []);
		} catch (_) {
			setWaitingPredictions([]);
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
									Aucune prédiction en attente
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			<div className="mt-3">
				<Pagination
					totalItems={totalCount ?? waitingPredictions.length}
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
