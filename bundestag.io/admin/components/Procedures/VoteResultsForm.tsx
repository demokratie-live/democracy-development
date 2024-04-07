import React, { FormEventHandler } from 'react';
import { Form, Input, Button, InputNumber, Radio, Row, Col, notification, Switch } from 'antd';
import { axiosClient } from '../../lib/axios';
import { VotesRecommendation } from './votesRecommendation';

// Ant Design Sub-Elements
const { TextArea } = Input;
const FormItem = Form.Item;

const FRACTIONS = [
  {
    name: 'Union',
  },
  {
    name: 'SPD',
  },
  {
    name: 'AfD',
  },
  {
    name: 'Grüne',
  },
  {
    name: 'FDP',
  },
  {
    name: 'Linke',
  },
];

const VoteResultsForm = ({ data, type, procedureId, period }) => {
  const [decision, setDecision] = React.useState(data.decision);
  const onFinish = (values) => {
    notification.info({
      key: 'saveProcedure',
      message: 'Vorgang wird gespeichert!',
      duration: 0,
    });

    const data = {
      ...values,
      partyVotes: values.partyVotes.map((party) => ({
        party: party.party,
        main: party.main,
        deviants: {
          yes: party.yes,
          abstination: party.abstination,
          no: party.no,
        },
      })),
    };

    console.log('values', values, data);
    axiosClient
      .post('/api/procedures/save', {
        ...data,
        toggleDecision: !values.toggleDecision,
        procedureId,
      })
      .then(() => {
        notification.success({
          key: 'saveProcedure',
          message: 'Vorgang wurde gespeichert!',
        });
      })
      .catch((err) => {
        notification.error({
          key: 'saveProcedure',
          message: 'Ein Fehler ist vorgefallen',
          // description: err
        });
        console.log('Error:', err);
      });
  };

  const onFinishFailed = (...args) => {
    console.log(...args);
    notification.error({
      message: 'Speichern Fehlgeschlagen!',
      description: 'Überprüfe deine eingaben',
    });
  };

  let parties = FRACTIONS;
  if (data.partyVotes && data.partyVotes.length > 0) {
    parties = data.partyVotes.map(({ party }) => ({
      name: party,
    }));
  }

  const onChange: FormEventHandler<HTMLFormElement> = (e) => {
    const field = e.target as unknown as { id: string; value: string };
    if (field.id === 'decisionText') {
      setDecision(field.value);
    }
  };

  return (
    <Form
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      onChange={onChange}
      className="login-form"
      initialValues={{
        votingDocument: data.votingDocument,
        decisionText: data.decisionText,
        partyVotes: parties.map((p, i) => ({
          party: p.name,
          main: data.partyVotes.length > 0 ? data.partyVotes[i].main : null,
          yes: data.partyVotes.length > 0 ? data.partyVotes[i].deviants.yes : 0,
          abstination: data.partyVotes.length > 0 ? data.partyVotes[i].deviants.abstination : 0,
          no: data.partyVotes.length > 0 ? data.partyVotes[i].deviants.no : 0,
        })),
      }}
    >
      <FormItem
        label="Abstimmung über"
        name="votingDocument"
        rules={[{ required: true, message: 'Abstimmung über fehlt!' }]}
      >
        <Radio.Group>
          <Radio.Button value="mainDocument">{type}</Radio.Button>
          <Radio.Button value="recommendedDecision">Beschlussempfehlung</Radio.Button>
        </Radio.Group>
      </FormItem>
      <FormItem label="Ergebnis umdrehen" name="toggleDecision">
        <Switch defaultChecked={data.votingRecommendation === false} />
      </FormItem>
      <FormItem label="Beschlusstext" name="decisionText" rules={[{ required: true, message: 'Beschlusstext fehlt!' }]}>
        <TextArea placeholder="Beschlusstext" rows={3} />
      </FormItem>
      {decision && <VotesRecommendation period={period} decision={decision} />}
      <Form.List name="partyVotes">
        {(parties) => {
          return (
            <Row gutter={8}>
              {parties.map((field, i) => {
                const mainDecision =
                  // form.getFieldValue(`partyVotes[${i}].main`) ||
                  data.partyVotes.length > 0 ? data.partyVotes[i].main : null;
                return (
                  <Col span={8} key={field.name}>
                    <FormItem name={[field.name, 'party']} rules={[{ required: true, message: 'Beschluss fehlt!' }]}>
                      <Input readOnly />
                    </FormItem>
                    <FormItem
                      className="collection-create-form_last-form-item"
                      name={[field.name, 'main']}
                      rules={[{ required: true, message: 'Beschluss fehlt!' }]}
                    >
                      <Radio.Group>
                        <Radio.Button value="YES" style={{ backgroundColor: '#f6ffed' }}>
                          Ja
                        </Radio.Button>
                        <Radio.Button value="ABSTINATION" style={{ backgroundColor: '#e6f7ff' }}>
                          Enthaltung
                        </Radio.Button>
                        <Radio.Button value="NO" style={{ backgroundColor: '#fff1f0' }}>
                          Nein
                        </Radio.Button>
                      </Radio.Group>
                    </FormItem>
                    <FormItem
                      label="Ja"
                      name={[field.name, 'yes']}
                      labelCol={{
                        xs: { span: 24 },
                        sm: { span: 8 },
                      }}
                    >
                      <InputNumber min={0} max={999} disabled={mainDecision === 'YES'} />
                    </FormItem>
                    <FormItem
                      label="Enth."
                      name={[field.name, 'abstination']}
                      labelCol={{
                        xs: { span: 24 },
                        sm: { span: 8 },
                      }}
                    >
                      <InputNumber min={0} max={999} disabled={mainDecision === 'ABSTINATION'} />
                    </FormItem>
                    <FormItem
                      label="Nein"
                      name={[field.name, 'no']}
                      labelCol={{
                        xs: { span: 24 },
                        sm: { span: 8 },
                      }}
                    >
                      <InputNumber min={0} max={999} disabled={mainDecision === 'NO'} />
                    </FormItem>
                  </Col>
                );
              })}
            </Row>
          );
        }}
      </Form.List>
      <FormItem>
        <Button type="primary" htmlType="submit" className="login-form-button">
          Speichern
        </Button>
      </FormItem>
    </Form>
  );
};

export default VoteResultsForm;
