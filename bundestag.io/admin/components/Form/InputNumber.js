import { Form, InputNumber } from "antd";

const FormItem = Form.Item;

export default ({
  field, // { name, value, onChange, onBlur }
  form: { touched, errors, setFieldValue }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  itemProps,
  onChange,
  ...props
}) => {
  const handleChange = value => {
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
      <InputNumber {...field} {...props} onChange={handleChange} />
    </FormItem>
  );
};
