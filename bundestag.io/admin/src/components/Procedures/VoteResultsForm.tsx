import React from 'react';
import { Form, Input, Button, InputNumber, Radio, Row, Col, notification, Switch } from 'antd';
import { axiosClient } from '../../lib/axios';
import { AiVotes, AiVotesProps } from './AiVotes';
import { Beschlusstext } from './Beschlusstext';

// Ant Design Sub-Elements
const FormItem = Form.Item;

// Props-Interface
interface VoteResultsFormProps {
  data: {
    votingDocument?: string;
    decisionText?: string;
    partyVotes: {
      party: string;
      main?: 'YES' | 'NO' | 'ABSTINATION' | null;
      deviants: { yes: number; abstination: number; no: number };
    }[];
    votingRecommendation?: boolean;
  };
  type: string;
  procedureId: number;
  period: number;
  lastPlenaryProtocoll?: { findSpotUrl: string };
  title: string;
}

export const getFractions = (period: number) =>
  period === 21
    ? [
        {
          name: 'Union',
        },
        {
          name: 'AfD',
        },
        {
          name: 'SPD',
        },
        {
          name: 'Grüne',
        },
        {
          name: 'Linke',
        },
      ]
    : [
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

// Component-Typisierung und Form-Layout
const VoteResultsForm: React.FC<VoteResultsFormProps> = ({
  data,
  type,
  procedureId,
  period,
  lastPlenaryProtocoll,
  title,
}) => {
  // 1. useNotification-Hook
  const [notificationApi, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    notificationApi.info({
      key: 'saveProcedure',
      message: 'Vorgang wird gespeichert!',
      duration: 0,
    });

    const payload = {
      ...values,
      partyVotes: values.partyVotes.map((party: any) => ({
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
        ...payload,
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
          // description: err
        });
        console.error('Error:', err);
      });
  };

  const onFinishFailed = () => {
    notificationApi.warning({
      message: 'Speichern Fehlgeschlagen!',
      description: 'Überprüfe deine eingaben',
    });
  };

  let parties = getFractions(period);
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
    <>
      {contextHolder}
      <Form
        form={form}
        layout="vertical"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        className="login-form"
        initialValues={{
          votingDocument: data.votingDocument ?? '',
          decisionText: data.decisionText ?? '',
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
        <Form.Item label="Ergebnis umdrehen" name="toggleDecision" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Beschlusstext pdfUrl={lastPlenaryProtocoll?.findSpotUrl ?? ''} title={title} />
        <Form.Item noStyle dependencies={['decisionText']}>
          {({ getFieldValue }) =>
            getFieldValue('decisionText') && period ? (
              <AiVotes decision={getFieldValue('decisionText')} period={period} onResult={onAiVoteResult} />
            ) : null
          }
        </Form.Item>
        <Form.List name="partyVotes">
          {(fields) => (
            <Row gutter={8}>
              {fields.map((field) => (
                <Col span={8} key={`${field.key ?? field.name}`}>
                  <Form.Item {...field} name={[field.name, 'party']} rules={[{ required: true }]}>
                    <Input readOnly />
                  </Form.Item>
                  <Form.Item {...field} name={[field.name, 'main']} rules={[{ required: true }]}>
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
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="Ja"
                    name={[field.name, 'yes']}
                    labelCol={{
                      xs: { span: 24 },
                      sm: { span: 8 },
                    }}
                  >
                    <InputNumber
                      min={0}
                      max={999}
                      disabled={form.getFieldValue(['partyVotes', field.name, 'main']) === 'YES'}
                    />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="Enth."
                    name={[field.name, 'abstination']}
                    labelCol={{
                      xs: { span: 24 },
                      sm: { span: 8 },
                    }}
                  >
                    <InputNumber
                      min={0}
                      max={999}
                      disabled={form.getFieldValue(['partyVotes', field.name, 'main']) === 'ABSTINATION'}
                    />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="Nein"
                    name={[field.name, 'no']}
                    labelCol={{
                      xs: { span: 24 },
                      sm: { span: 8 },
                    }}
                  >
                    <InputNumber
                      min={0}
                      max={999}
                      disabled={form.getFieldValue(['partyVotes', field.name, 'main']) === 'NO'}
                    />
                  </Form.Item>
                </Col>
              ))}
            </Row>
          )}
        </Form.List>
        <FormItem>
          <Button type="primary" htmlType="submit" className="login-form-button">
            Speichern
          </Button>
        </FormItem>
      </Form>
    </>
  );
};

export default VoteResultsForm;
