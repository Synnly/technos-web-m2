import { Form, Space } from 'antd';
import type { GenericFormProps } from './GenericForm.interface';
import InputReset from '../input/Action/InputReset.component';
import InputSubmit from '../input/Action/InputSubmit.component';


export const GenericForm: React.FC<GenericFormProps> = ({ title, fields, initialValues, form, layout = 'vertical', onFinish }) => {
  const [localForm] = Form.useForm();
  const usedForm = form || localForm;
  return (
    <Form form={usedForm} initialValues={initialValues} layout={layout} onFinish={onFinish}>
      <div className='flex justify-center mb-6'>
        <p className='font-bold text-2xl'>{title}</p>
      </div>
      {fields.map((f) => {
        const Component = f.component;
        return (
          <Form.Item key={f.name} name={f.name} label={f.label} {...(f.formItemProps || {})}>
            <Component {...(f.componentProps || {})} />
          </Form.Item>
        );
      })}

      {/* Actions row: Reset and Submit */}
      <Form.Item>
        <Space>
          <InputReset form={usedForm} text="Réinitialiser" />
          <InputSubmit text="Envoyer" />
        </Space>
      </Form.Item>
    </Form>
  );
};

export default GenericForm;