import { Form } from 'antd';
import type { GenericFormProps } from './GenericForm.interface';


export const GenericForm: React.FC<GenericFormProps> = ({ fields, initialValues, form, layout = 'vertical', onFinish }) => {
  return (
    <Form form={form} initialValues={initialValues} layout={layout} onFinish={onFinish}>
      {fields.map((f) => {
        const Component = f.component;
        return (
          <Form.Item key={f.name} name={f.name} label={f.label} {...(f.formItemProps || {})}>
            <Component {...(f.componentProps || {})} />
          </Form.Item>
        );
      })}
    </Form>
  );
};

export default GenericForm;