import React, { Component } from "react";
import {
  Form,
  Input,
  Button,
  InputNumber,
  Radio,
  Row,
  Col,
  notification,
  Switch,
} from "antd";
import { useMutation } from "@apollo/client";
import axios from "axios";

// Ant Design Sub-Elements
const { TextArea } = Input;
const FormItem = Form.Item;

const FRACTIONS = [
  {
    name: "Union",
  },
  {
    name: "SPD",
  },
  {
    name: "AfD",
  },
  {
    name: "Grüne",
  },
  {
    name: "FDP",
  },
  {
    name: "Linke",
  },
];

const VoteResultsForm = ({ data, type, procedureId }) => {
  const onFinish = (values) => {
    notification.info({
      key: "saveProcedure",
      message: "Vorgang wird gespeichert!",
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

    console.log("values", values, data);
    axios
      .post("/api/procedures/save", {
        ...data,
        toggleDecision: !data.toggleDecision,
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

  let parties = FRACTIONS;
  if (data.partyVotes && data.partyVotes.length > 0) {
    parties = data.partyVotes.map(({ party }) => ({
      name: party,
    }));
  }
  const staticValue = [
    { formItem1: "value1", formItem2: "value2" },
    { formItem1: "value3", formItem2: "value4" },
  ];
  return (
    <Form
      // form={form}
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
          abstination:
            data.partyVotes.length > 0
              ? data.partyVotes[i].deviants.abstination
              : 0,
          no: data.partyVotes.length > 0 ? data.partyVotes[i].deviants.no : 0,
        })),
      }}
    >
      <FormItem
        label="Abstimmung über"
        name="votingDocument"
        rules={[{ required: true, message: "Abstimmung über fehlt!" }]}
      >
        <Radio.Group>
          <Radio.Button value="mainDocument">{type}</Radio.Button>
          <Radio.Button value="recommendedDecision">
            Beschlussempfehlung
          </Radio.Button>
        </Radio.Group>
      </FormItem>
      <FormItem label="Ergebnis umdrehen" name="toggleDecision">
        <Switch defaultChecked={!data.votingRecommendation} />
      </FormItem>
      <FormItem
        label="Beschlusstext"
        name="decisionText"
        rules={[{ required: true, message: "Beschlusstext fehlt!" }]}
      >
        <TextArea placeholder="Beschlusstext" rows={3} />
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
                    <FormItem
                      name={[field.name, "party"]}
                      rules={[{ required: true, message: "Beschluss fehlt!" }]}
                    >
                      <Input readOnly />
                    </FormItem>
                    <FormItem
                      className="collection-create-form_last-form-item"
                      name={[field.name, "main"]}
                      rules={[{ required: true, message: "Beschluss fehlt!" }]}
                    >
                      <Radio.Group>
                        <Radio.Button
                          value="YES"
                          style={{ backgroundColor: "#f6ffed" }}
                        >
                          Ja
                        </Radio.Button>
                        <Radio.Button
                          value="ABSTINATION"
                          style={{ backgroundColor: "#e6f7ff" }}
                        >
                          Enthaltung
                        </Radio.Button>
                        <Radio.Button
                          value="NO"
                          style={{ backgroundColor: "#fff1f0" }}
                        >
                          Nein
                        </Radio.Button>
                      </Radio.Group>
                    </FormItem>
                    <FormItem
                      label="Ja"
                      name={[field.name, "yes"]}
                      labelCol={{
                        xs: { span: 24 },
                        sm: { span: 8 },
                      }}
                    >
                      <InputNumber
                        min={0}
                        max={999}
                        disabled={mainDecision === "YES"}
                      />
                    </FormItem>
                    <FormItem
                      label="Enth."
                      name={[field.name, "abstination"]}
                      labelCol={{
                        xs: { span: 24 },
                        sm: { span: 8 },
                      }}
                    >
                      <InputNumber
                        min={0}
                        max={999}
                        disabled={mainDecision === "ABSTINATION"}
                      />
                    </FormItem>
                    <FormItem
                      label="Nein"
                      name={[field.name, "no"]}
                      labelCol={{
                        xs: { span: 24 },
                        sm: { span: 8 },
                      }}
                    >
                      <InputNumber
                        min={0}
                        max={999}
                        disabled={mainDecision === "NO"}
                      />
                    </FormItem>
                  </Col>
                );
              })}
            </Row>
          );
        }}
      </Form.List>
      {/* <Row gutter={8}>
        {parties.map(({ name }, i) => {
          const mainDecision =
            // form.getFieldValue(`partyVotes[${i}].main`) ||
            data.partyVotes.length > 0 ? data.partyVotes[i].main : null;

          return (
            <Col span={8} key={name}>
              <h3>{name}</h3>
              <FormItem
                name={`partyVotes[${i}].party`}
                rules={[{ required: true, message: "Beschluss fehlt!" }]}
              >
                <Input />
              </FormItem>
              <FormItem
                className="collection-create-form_last-form-item"
                rules={[{ required: true, message: "Beschluss fehlt!" }]}
              >
                <Radio.Group>
                  <Radio.Button
                    value="YES"
                    style={{ backgroundColor: "#f6ffed" }}
                  >
                    Ja
                  </Radio.Button>
                  <Radio.Button
                    value="ABSTINATION"
                    style={{ backgroundColor: "#e6f7ff" }}
                  >
                    Enthaltung
                  </Radio.Button>
                  <Radio.Button
                    value="NO"
                    style={{ backgroundColor: "#fff1f0" }}
                  >
                    Nein
                  </Radio.Button>
                </Radio.Group>
              </FormItem>
              <FormItem
                label="Ja"
                labelCol={{
                  xs: { span: 24 },
                  sm: { span: 8 },
                }}
              >
                <InputNumber
                  min={0}
                  max={999}
                  disabled={mainDecision === "YES"}
                />
              </FormItem>
              <FormItem
                label="Enth."
                labelCol={{
                  xs: { span: 24 },
                  sm: { span: 8 },
                }}
              >
                <InputNumber
                  min={0}
                  max={999}
                  disabled={mainDecision === "ABSTINATION"}
                />
              </FormItem>
              <FormItem
                label="Nein"
                labelCol={{
                  xs: { span: 24 },
                  sm: { span: 8 },
                }}
              >
                <InputNumber
                  min={0}
                  max={999}
                  disabled={mainDecision === "NO"}
                />
              </FormItem>
            </Col>
          );
        })}
      </Row> */}

      <FormItem>
        <Button type="primary" htmlType="submit" className="login-form-button">
          Speichern
        </Button>
      </FormItem>
    </Form>
  );
};

export default VoteResultsForm;

// export default graphql(SAVE_VOTE_RESULTS, {
//   props: ({ mutate, ownProps }) => {
//     return {
//       saveVoteResults: async (data) => {
//         const { procedureId } = ownProps;
//         return mutate({
//           variables: {
//             ...data,
//             procedureId,
//           },
//         });
//       },
//     };
//   },
// })(Form.create({})(VoteResultsForm));
