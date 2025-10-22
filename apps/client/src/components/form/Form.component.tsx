import { Form, Space } from "antd";
import type { GenericFormProps } from "./GenericForm.interface";
import InputReset from "../input/Action/InputReset.component";
import InputSubmit from "../input/Action/InputSubmit.component";

const GenericForm: React.FC<GenericFormProps> = ({
	title,
	fields,
	initialValues,
	form,
	layout = "vertical",
	onFinish,
}) => {
	const [localForm] = Form.useForm();
	const usedForm = form || localForm;
	return (
		<Form
			form={usedForm}
			initialValues={initialValues}
			layout={layout}
			onFinish={onFinish}
		>
			<div className="flex justify-center mb-6">
				<p className="font-medium text-xl text-white">{title}</p>
			</div>
			{fields.map((f) => {
				const Component = f.component;
				return (
					<Form.Item
						key={f.name}
						name={f.name}
						label={
							<span style={{ color: "white" }}>{f.label}</span>
						}
						{...(f.formItemProps || {})}
					>
						<Component {...(f.componentProps || {})} />
					</Form.Item>
				);
			})}

			<Form.Item className="flex justify-center items-center">
				<Space>
					<InputReset
						form={usedForm}
						text="Réinitialiser"
						className={"text-white"}
					/>
					<InputSubmit text="Envoyer" className={"text-white"} />
				</Space>
			</Form.Item>
		</Form>
	);
};

export default GenericForm;
