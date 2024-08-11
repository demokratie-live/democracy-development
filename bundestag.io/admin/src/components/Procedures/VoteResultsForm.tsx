import React from 'react';
import { Form, Input, Button, InputNumber, Radio, Row, Col, notification, Switch } from 'antd';
import { axiosClient } from '../../lib/axios';
import { AiVotes, AiVotesProps } from './AiVotes';
import { Beschlusstext } from './Beschlusstext';

// Ant Design Sub-Elements
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

const VoteResultsForm = ({ data, type, procedureId, period, lastPlenaryProtocoll, title }) => {
  const [form] = Form.useForm();

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
        console.error('Error:', err);
      });
  };

  const onFinishFailed = () => {
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

  const onAiVoteResult: AiVotesProps['onResult'] = (votes) => {
    const fieldValue = form.getFieldValue('partyVotes');
    form.setFieldValue(
      'partyVotes',
      votes.map((vote, i) => ({ ...fieldValue[i], main: vote.vote })),
    );
  };

  return (
    <Form
      form={form}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
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
      <Beschlusstext pdfUrl={lastPlenaryProtocoll.findSpotUrl} title={title} />
      <FormItem
        noStyle
        shouldUpdate={(prevValues, currentValues) => prevValues.decisionText !== currentValues.decisionText}
      >
        {({ getFieldValue }) => {
          if (getFieldValue('decisionText') && period) {
            return <AiVotes decision={getFieldValue('decisionText')} period={period} onResult={onAiVoteResult} />;
          }
          return null;
        }}
      </FormItem>
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
