import React from "react";
import { Form, Button, notification, Switch } from "antd";
import axios from "axios";

const FormItem = Form.Item;

export const VoteResultsFormNamedPoll = ({ data, type, procedureId }) => {
  const onFinish = (values) => {
    notification.info({
      key: "saveProcedure",
      message: "Vorgang wird gespeichert!",
      duration: 0,
    });

    console.log("values", values, data);
    axios
      .post("/api/procedures/save", {
        namedPoll: true,
        toggleDecision: !values.toggleDecision,
        procedureId,
      })
      .then(() => {
        notification.success({
          key: "saveProcedure",
          message: "Vorgang wurde gespeichert!",
        });
      })
      .catch((err) => {
        notification.error({
          key: "saveProcedure",
          message: "Ein Fehler ist vorgefallen",
          // description: err
        });
        console.log("Error:", err);
      });
  };

  const onFinishFailed = (...args) => {
    console.log(...args);
    notification.error({
      message: "Speichern Fehlgeschlagen!",
      description: "Überprüfe deine eingaben",
    });
  };

  return (
    <Form
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      className="login-form"
    >
      <FormItem label="Ergebnis umdrehen" name="toggleDecision">
        <Switch defaultChecked={data.votingRecommendation === false} />
      </FormItem>

      <FormItem>
        <Button type="primary" htmlType="submit" className="login-form-button">
          Speichern
        </Button>
      </FormItem>
    </Form>
  );
};
