import Header from "./Header.component";
import StatsGrid from "./StatsGrid.component";
import XPSection from "./XPSection.component";
import PredictionsSection from "./PredictionsSection.component";
import Sidebar from "../../components/sidebar/Sidebar.component";
import ToastComponent from "../../components/toast/Toast.component";
import Modal from "../../components/modal/modal.component";
import GenericForm from "../../components/form/Form.component";
import type { FormField } from "../../components/modal/modal.interface";
import { InputText } from "../../components/inputs/InputText.component";
import InputOptions from "../../components/input/Options/InputOptions.component";
import { PredictionController } from "../../modules/prediction/prediction.controller";
import type { AuthenticatedHomeProps } from "./types";
import InputDatePicker from "../input/DatePicker/InputDatePicker.component";

export default function IsAuthenticatedHome({
	user,
	username,
	token,
	sidebarCollapsed,
	setSidebarCollapsed,
	form,
	open,
	setOpen,
	toast,
	setToast,
	predictions,
	usersMap,
	handlePredictionClick,
	fetchAllPredictions,
	setError,
}: AuthenticatedHomeProps) {
	const clearToast = () => setToast(null);

	const fields: FormField[] = [
		{
			name: "title",
			label: "Titre",
			component: InputText,
			componentProps: { placeholder: "Titre" },
			formItemProps: { rules: [{ required: true }] },
		},
		{
			name: "description",
			label: "Description",
			component: InputText,
			componentProps: { placeholder: "Description" },
		},
		{
			name: "dateFin",
			label: "Date de fin",
			component: InputDatePicker,
		},
		{
			name: "options",
			label: "Options",
			component: InputOptions,
		},
	];

	return (
		<div className="bg-gray-900 mx-auto px-6 py-8 w-full min-h-screen  flex flex-col">
			<Sidebar
				user={user}
				token={token!}
				setUser={() => {}}
				setPoints={() => {}}
				setToast={setToast}
				setModalOpen={setOpen}
				onCollapsedChange={(value: boolean) =>
					setSidebarCollapsed(value)
				}
			/>
			{toast && (
				<ToastComponent
					message={toast.message!}
					type={toast.type!}
					onClose={clearToast}
				/>
			)}
			<Modal isOpen={open} onClose={() => setOpen(false)}>
				<GenericForm
					form={form}
					title="Création d'une prédiction"
					fields={fields}
					onFinish={async (values: any) => {
						const rawDate = values["date de fin"] ?? values.dateFin;
						const dateFin =
							rawDate && typeof rawDate.toISOString === "function"
								? rawDate.toISOString()
								: rawDate;

						const payload = {
							title: values.title,
							description: values.description,
							dateFin,
							options: values.options,
						};

						const result =
							await PredictionController.createPrediction(
								payload,
								{
									username,
									fetchPredictions: fetchAllPredictions,
									onClose: () => setOpen(false),
									setToast: (msg: string) =>
										setToast({
											message: msg,
											type: "success",
										}),
									setLocalError: (m: string | null) =>
										setError(m),
								},
							);

						if (result.success) {
							form.resetFields();
						}
					}}
				/>
			</Modal>

			<main
				className={
					sidebarCollapsed
						? "flex-1 p-2 sm:p-4 md:p-6 ml-20 transition-all"
						: "flex-1 p-2 sm:p-4 md:p-6 ml-0 lg:ml-72"
				}
			>
				<Header username={username} user={user} />
				<StatsGrid user={user} />
				<XPSection user={user} />
				<PredictionsSection
					predictions={predictions}
					usersMap={usersMap}
					onPredictionClick={handlePredictionClick}
				/>
			</main>
		</div>
	);
}
