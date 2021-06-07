import { Form, DatePicker } from "antd";

const FormItem = Form.Item;

export default ({
  field, // { name, value, onChange, onBlur }
  form: { touched, errors, setFieldValue, setFieldTouched }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  itemProps,
  onChange,
  onBlur,
  ...props
}) => {
  const handleChange = value => {
    setFieldValue(field.name, value);
  };

  const handleBlur = status => {
    setFieldTouched(field.name, !status);
  };

  const errorMsg =
    touched[field.name] && errors[field.name] ? errors[field.name] : false;

  return (
    <FormItem
      {...itemProps}
      validateStatus={
        errorMsg ? "error" : touched[field.name] ? "success" : null
      }
    >
      <DatePicker
        {...field}
        {...props}
        onBlur={() => {}}
        onChange={handleChange}
        onOpenChange={handleBlur}
        format="DD.MM.YYYY"
      />
    </FormItem>
  );
};
