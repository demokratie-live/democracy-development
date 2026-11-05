import React from 'react';
import { Form, Button, notification, Switch } from 'antd';
import { axiosClient } from '../../lib/axios';
import { errorMessage } from '../../lib/errorMessage';

const FormItem = Form.Item;

export const VoteResultsFormNamedPoll = ({ data, procedureId }) => {
  const [notificationApi, contextHolder] = notification.useNotification();

  const onFinish = (values) => {
    notificationApi.info({
      key: 'saveProcedure',
      message: 'Vorgang wird gespeichert!',
      duration: 0,
    });

    axiosClient
      .post('/api/procedures/save', {
        namedPoll: true,
        toggleDecision: !values.toggleDecision,
        procedureId,
      })
      .then(() => {
        notificationApi.success({
          key: 'saveProcedure',
          message: 'Vorgang wurde gespeichert!',
        });
      })
      .catch((err) => {
        notificationApi.error({
          key: 'saveProcedure',
          message: 'Ein Fehler ist vorgefallen',
          description: errorMessage(err),
          duration: 0,
        });
        console.log('Error:', err);
      });
  };

  const onFinishFailed = (...args) => {
    console.log(...args);
    notificationApi.error({
      message: 'Speichern Fehlgeschlagen!',
      description: 'Überprüfe deine eingaben',
    });
  };

  return (
    <>
      {contextHolder}
      <Form
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        className="login-form"
        // the API stores the inverse: votingRecommendation === false means "flip"
        initialValues={{ toggleDecision: data?.votingRecommendation === false }}
      >
        <FormItem label="Ergebnis umdrehen" name="toggleDecision" valuePropName="checked">
          <Switch />
        </FormItem>

        <FormItem>
          <Button type="primary" htmlType="submit" className="login-form-button">
            Speichern
          </Button>
        </FormItem>
      </Form>
    </>
  );
};
