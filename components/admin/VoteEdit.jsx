import React, { Component } from 'react';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

class VoteEdit extends Component {
  state = {
    selections: {},
  };

  inputs = {};
  radios = {};

  onChange = party => (event) => {
    const { selections } = this.state;
    // console.log({ party, value: event.target.value });
    const deviants = {
      YES: parseInt(this.inputs[party].YES.value, 10) || 0,
      NO: parseInt(this.inputs[party].NO.value, 10) || 0,
      ABSTINATION: parseInt(this.inputs[party].ABSTINATION.value, 10) || 0,
    };
    this.setState({
      selections: { ...selections, [party]: { main: event.target.value, deviants } },
    });
    console.log({
      selections: { ...selections, [party]: { main: event.target.value, deviants } },
    });
  };

  render() {
    const { parties, data, procedureId } = this.props;
    const labels = { YES: 'ja', ABSTINATION: 'enthaltung', NO: 'nein' };
    return (
      <div className="container row">
        {parties.map(party => (
          <fieldset className="col-md" style={{ minWidth: 100 }}>
            <legend>{party}</legend>
            {['YES', 'NO', 'ABSTINATION'].map(voting => (
              <FormGroup check key={voting}>
                <Label check>
                  <Input
                    type="radio"
                    value={voting}
                    name={`vote-${party}-${procedureId}`}
                    onChange={this.onChange(party)}
                  />
                  {labels[voting]}
                </Label>
                <Input
                  type="number"
                  name="text1"
                  bsSize="5"
                  placeholder="0"
                  innerRef={(node) => {
                    this.inputs = {
                      ...this.inputs,
                      [party]: { ...this.inputs[party], [voting]: node },
                    };
                  }}
                />
              </FormGroup>
            ))}
          </fieldset>
        ))}
      </div>
    );
  }
}
export default VoteEdit;
