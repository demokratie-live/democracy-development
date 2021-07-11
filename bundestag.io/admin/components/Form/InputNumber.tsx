import { Form, InputNumber as AntInputNumber } from "antd";

const FormItem = Form.Item;

export const InputNumber = ({
  field, // { name, value, onChange, onBlur }
  form: { touched, errors, setFieldValue }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  itemProps,
  onChange,
  ...props
}) => {
  const handleChange = (value) => {
    setFieldValue(field.name, value);
  };

  const errorMsg =
    touched[field.name] && errors[field.name] ? errors[field.name] : "";

  return (
    <FormItem
      {...itemProps}
      help={errorMsg}
      validateStatus={
        errorMsg ? "error" : touched[field.name] ? "success" : null
      }
      hasFeedback
    >
      <AntInputNumber {...field} {...props} onChange={handleChange} />
    </FormItem>
  );
};
