import React, { Component } from 'react';
import { FormGroup, Label, Input } from 'reactstrap';

class VoteEdit extends Component {
  state = {
    selections: [],
  };

  componentWillMount() {
    this.setState({
      selections: this.props.partyVotes.map(({ party, main, deviants: { yes, no, abstination } }) => ({
        party,
        main,
        deviants: { yes, no, abstination },
      })),
    });
  }

  onChange = (party, main) => () => {
    const { selections } = this.state;
    const { parties, onChange } = this.props;
    let changedSelections = [...selections];
    const deviants = {
      yes: parseInt(this.inputs[party].YES.value, 10) || 0,
      no: parseInt(this.inputs[party].NO.value, 10) || 0,
      abstination: parseInt(this.inputs[party].ABSTINATION.value, 10) || 0,
    };
    const selectionIndex = changedSelections.findIndex(({ party: pty }) => pty === party);
    if (selectionIndex !== -1) {
      changedSelections[selectionIndex] = { party, main, deviants };
    } else {
      changedSelections = [...changedSelections, { party, main, deviants }];
    }

    this.setState(
      {
        selections: changedSelections,
      },
      () => {
        if (parties.length === this.state.selections.length) {
          onChange(this.state.selections);
        }
      },
    );
  };

  getValue = ({ party, voting }) => {
    const { selections } = this.state;
    const { partyVotes } = this.props;
    const selection =
      selections.find(({ party: pty }) => pty === party) ||
      partyVotes.find(({ party: pty }) => pty === party);
    if (selection) {
      return selection.deviants[voting.toLowerCase()] || null;
    }
    return null;
  };

  inputs = {};
  radios = {};

  isChecked = ({ party, selection }) => {
    const { partyVotes } = this.props;
    const { selections } = this.state;
    const curParty = selections.find(({ party: pty }) => pty === party);
    if (curParty) {
      return curParty.main === selection;
    }
    return false;
  };

  render() {
    const { parties, procedureId, partyVotes } = this.props;
    const labels = { YES: 'ja', ABSTINATION: 'enthaltung', NO: 'nein' };
    return (
      <div className="container row">
        {parties.map(party => (
          <fieldset key={party} className="col-md" style={{ minWidth: 100 }}>
            <legend>{party}</legend>
            {['YES', 'NO', 'ABSTINATION'].map(voting => (
              <FormGroup check key={voting}>
                <Label check>
                  <Input
                    checked={this.isChecked({ party, selection: voting })}
                    type="radio"
                    value={voting}
                    name={`vote-${party}-${procedureId}`}
                    onChange={this.onChange(party, voting)}
                  />
                  {labels[voting]}
                </Label>
                <Input
                  type="number"
                  name="text1"
                  bsSize="5"
                  value={this.getValue({ party, voting })}
                  placeholder="0"
                  innerRef={(node) => {
                    this.inputs = {
                      ...this.inputs,
                      [party]: { ...this.inputs[party], [voting]: node },
                    };
                  }}
                  onChange={this.onChange(party, voting)}
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
