import React, { Component } from 'react';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

class VoteEdit extends Component {
  state = {
    selections: [],
  };

  inputs = {};
  radios = {};

  onChange = party => (event) => {
    let { selections } = this.state;
    const { parties, onChange } = this.props;
    // console.log({ party, value: event.target.value });
    const deviants = {
      YES: parseInt(this.inputs[party].YES.value, 10) || 0,
      NO: parseInt(this.inputs[party].NO.value, 10) || 0,
      ABSTINATION: parseInt(this.inputs[party].ABSTINATION.value, 10) || 0,
    };
    const selectionIndex = selections.findIndex(({ party: pty }) => pty === party);
    if (selectionIndex !== -1) {
      console.log('11');
      selections[selectionIndex] = { party, main: event.target.value, deviants };
    } else {
      console.log('22');
      selections = [...selections, { party, main: event.target.value, deviants }];
    }

    console.log({ selections, selectionIndex });

    this.setState(
      {
        selections: [...selections],
      },
      () => {
        if (parties.length === this.state.selections.length) {
          onChange(this.state.selections);
        }
        console.log(this.state.selections);
      },
    );
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
