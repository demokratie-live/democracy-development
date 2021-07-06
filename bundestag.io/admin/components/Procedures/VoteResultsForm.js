import React, { Component } from "react";
import {
  Form,
  Input,
  Button,
  InputNumber,
  Radio,
  Row,
  Col,
  notification
} from "antd";
import { graphql } from "react-apollo";

import SAVE_VOTE_RESULTS from "../../graphql/mutations/saveVoteResults";
import F_VOTE_RESULTS from "../../graphql/fragments/voteResults";

// Ant Design Sub-Elements
const { TextArea } = Input;
const FormItem = Form.Item;

const FRACTIONS = [
  {
    name: "Union"
  },
  {
    name: "SPD"
  },
  {
    name: "AfD"
  },
  {
    name: "Grüne"
  },
  {
    name: "FDP"
  },
  {
    name: "Linke"
  }
];

class VoteResultsForm extends Component {
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log("Received values of form: ", values, this.props);
        notification.info({
          key: "saveProcedure",
          message: "Vorgang wird gespeichert!",
          duration: 0
        });
        this.props
          .saveVoteResults(values)
          .then(() => {
            notification.success({
              key: "saveProcedure",
              message: "Vorgang wurde gespeichert!"
            });
          })
          .catch(err => {
            notification.error({
              key: "saveProcedure",
              message: "Ein Fehler ist vorgefallen",
              // description: err
            });
            console.log("Error:", err)
          });
      } else {
        console.log(err, values);
        notification.error({
          message: "Speichern Fehlgeschlagen!",
          description: "Überprüfe deine eingaben"
        });
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
      data,
      type,
    } = this.props;

    let parties = FRACTIONS;
    if (data.partyVotes && data.partyVotes.length > 0) {
      parties = data.partyVotes.map(({ party }) => ({
        name: party
      }));
    }

    return (
      <Form onSubmit={this.handleSubmit} className="login-form">
        <FormItem
          label="Abstimmung über"
          className="collection-create-form_last-form-item"
        >
          {getFieldDecorator(`votingDocument`, {
            initialValue: data.votingDocument,
            rules: [{ required: true, message: "Abstimmung über fehlt!" }]
          })(
            <Radio.Group>
              <Radio.Button value="mainDocument">{type}</Radio.Button>
              <Radio.Button value="recommendedDecision">
                Beschlussempfehlung
              </Radio.Button>
            </Radio.Group>
          )}
        </FormItem>
        <FormItem label="Beschlusstext">
          {getFieldDecorator("decisionText", {
            initialValue: data.decisionText,
            rules: [{ required: true, message: "Beschlusstext fehlt!" }]
          })(<TextArea placeholder="Beschlusstext" rows="3" />)}
        </FormItem>

        <Row gutter={8}>
          {parties.map(({ name }, i) => {
            const mainDecision =
              getFieldValue(`partyVotes[${i}].main`) ||
              (data.partyVotes.length > 0 ? data.partyVotes[i].main : null);

            return (
              <Col span={8} key={name}>
                <h3>{name}</h3>
                {getFieldDecorator(`partyVotes[${i}].party`, {
                  initialValue: name,
                  rules: [{ required: true, message: "Beschluss fehlt!" }]
                })(<Input />)}
                <FormItem className="collection-create-form_last-form-item">
                  {getFieldDecorator(`partyVotes[${i}].main`, {
                    initialValue:
                      data.partyVotes.length > 0
                        ? data.partyVotes[i].main
                        : null,
                    rules: [{ required: true, message: "Beschluss fehlt!" }]
                  })(
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
                  )}
                </FormItem>

                <FormItem
                  label="Ja"
                  labelCol={{
                    xs: { span: 24 },
                    sm: { span: 8 }
                  }}
                >
                  {getFieldDecorator(`partyVotes[${i}].deviants.yes`, {
                    initialValue:
                      data.partyVotes.length > 0
                        ? data.partyVotes[i].deviants.yes
                        : 0
                  })(
                    <InputNumber
                      min={0}
                      max={999}
                      disabled={mainDecision === "YES"}
                    />
                  )}
                </FormItem>

                <FormItem
                  label="Enth."
                  labelCol={{
                    xs: { span: 24 },
                    sm: { span: 8 }
                  }}
                >
                  {getFieldDecorator(`partyVotes[${i}].deviants.abstination`, {
                    initialValue:
                      data.partyVotes.length > 0
                        ? data.partyVotes[i].deviants.abstination
                        : 0
                  })(
                    <InputNumber
                      min={0}
                      max={999}
                      disabled={mainDecision === "ABSTINATION"}
                    />
                  )}
                </FormItem>

                <FormItem
                  label="Nein"
                  labelCol={{
                    xs: { span: 24 },
                    sm: { span: 8 }
                  }}
                >
                  {getFieldDecorator(`partyVotes[${i}].deviants.no`, {
                    initialValue:
                      data.partyVotes.length > 0
                        ? data.partyVotes[i].deviants.no
                        : 0
                  })(
                    <InputNumber
                      min={0}
                      max={999}
                      disabled={mainDecision === "NO"}
                    />
                  )}
                </FormItem>
              </Col>
            );
          })}
        </Row>

        <FormItem>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            Speichern
          </Button>
        </FormItem>
      </Form>
    );
  }
}

export default graphql(SAVE_VOTE_RESULTS, {
  props: ({ mutate, ownProps }) => {
    return {
      saveVoteResults: async data => {
        const { procedureId } = ownProps;
        return mutate({
          variables: {
            ...data,
            procedureId
          }
        });
      }
    };
  }
})(Form.create({})(VoteResultsForm));
