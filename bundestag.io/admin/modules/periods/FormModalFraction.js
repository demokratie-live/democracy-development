import { Modal, Form as AntdForm } from "antd";
import { Field, withFormik, Form } from "formik";
import * as yup from "yup";

import InputNumber from "../../components/Form/InputNumber";
import Input from "../../components/Form/Input";
import DatePicker from "../../components/Form/DatePicker";

const FormItem = AntdForm.Item;

const FormModal = ({
  visible,
  onClose,
  onSave,
  handleChange,
  setFieldValue,
  setFieldTouched,
  handleSubmit,
  values,
  touched,
  errors,
  ...props
}) => {
  return (
    <Modal visible={visible} onOk={handleSubmit} onCancel={onClose}>
      <Field
        itemProps={{
          label: "Name",
          required: true
        }}
        name="text"
        component={Input}
      />
      <Field
        itemProps={{
          label: "Abgeordnete",
          required: true
        }}
        name="deputy"
        component={InputNumber}
      />
    </Modal>
  );
};

const validationSchema = yup.object().shape({
  number: yup
    .number()
    .min(1, "Number has to be min of 1")
    .required("Number is required")
    .integer("Number has to be an integer")
});

export default withFormik({
  mapPropsToValues: () => ({ number: 0 }),
  handleSubmit: (values, { props: { onSave } }) => {
    onSave(values);
  },
  validationSchema
})(FormModal);
