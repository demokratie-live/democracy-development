import { Modal, Form as AntdForm, Input } from "antd";
import { Field, withFormik, Form } from "formik";
import * as yup from "yup";

import InputNumber from "../../components/Form/InputNumber";
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
          label: "Number",
          required: true
        }}
        name="number"
        component={InputNumber}
      />
      <Field
        itemProps={{ label: "Start", required: true }}
        name="start"
        component={DatePicker}
      />
      <Field
        itemProps={{ label: "Ende", required: true }}
        name="end"
        disabledDate={date =>
          values.start && date ? date.valueOf() < values.start.valueOf() : false
        }
        component={DatePicker}
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
    .integer("Number has to be an integer"),
  deputy: yup
    .number()
    .min(1, "Abgeordnete has to be min of 1")
    .required("Abgeordnete is required")
    .integer("Abgeordnete has to be an integer")
});

export default withFormik({
  mapPropsToValues: () => ({ number: 0 }),
  handleSubmit: (values, { props: { onSave } }) => {
    onSave(values);
  },
  validationSchema
})(FormModal);
