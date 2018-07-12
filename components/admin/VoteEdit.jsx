import React, { Component } from "react";
import PropTypes from "prop-types";
import { FormGroup, Label, Input } from "reactstrap";

class VoteEdit extends Component {
  state = {
    selections: [],
    decisionText: ""
  };

  componentWillMount() {
    this.setState({
      selections: this.props.partyVotes.map(
        ({ party, main, deviants: { yes, no, abstination } }) => ({
          party,
          main,
          deviants: { yes, no, abstination }
        })
      ),
      decisionText: this.props.decisionText
    });
  }

  onChange = (party, main, radio) => () => {
    const { selections } = this.state;
    const { parties, onChange } = this.props;
    let changedSelections = [...selections];
    const deviants = {
      yes: parseInt(this.inputs[party].YES.value, 10) || 0,
      no: parseInt(this.inputs[party].NO.value, 10) || 0,
      abstination: parseInt(this.inputs[party].ABSTINATION.value, 10) || 0
    };
    const selectionIndex = changedSelections.findIndex(
      ({ party: pty }) => pty === party
    );
    const editValues = { party, deviants };
    if (radio) {
      editValues.main = main;
    }
    if (selectionIndex !== -1) {
      changedSelections[selectionIndex] = {
        ...changedSelections[selectionIndex],
        ...editValues
      };
    } else {
      changedSelections = [...changedSelections, editValues];
    }

    this.setState(
      {
        selections: changedSelections
      },
      () => {
        if (parties.length === this.state.selections.length) {
          onChange(this.state.selections, this.state.decisionText);
        }
      }
    );
  };

  onChangeDecision = ({ target: { value } }) => {
    const { parties, onChange } = this.props;
    this.setState(
      {
        decisionText: value
      },
      () => {
        if (parties.length === this.state.selections.length) {
          onChange(this.state.selections, this.state.decisionText);
        }
      }
    );
  };

  getValue = ({ party, voting }) => {
    const { selections } = this.state;
    const { partyVotes } = this.props;
    const selection =
      selections.find(({ party: pty }) => pty === party) ||
      partyVotes.find(({ party: pty }) => pty === party);
    if (selection) {
      return selection.deviants[voting.toLowerCase()] || "";
    }
    return "";
  };

  inputs = {};
  radios = {};

  isChecked = ({ party, selection }) => {
    const { selections } = this.state;
    const curParty = selections.find(({ party: pty }) => pty === party);
    if (curParty) {
      return curParty.main === selection;
    }
    return false;
  };

  render() {
    const { parties, procedureId } = this.props;
    const labels = { YES: "ja", ABSTINATION: "enthaltung", NO: "nein" };
    return (
      <div>
        <FormGroup>
          <Label for="decision-text">Beschlusstext</Label>
          <Input
            value={this.state.decisionText}
            onChange={this.onChangeDecision}
            type="textarea"
            name="decisionText"
            id="decision-text"
          />
        </FormGroup>
        <div className="container row">
          {parties.map(party => (
            <fieldset key={party} className="col-md" style={{ minWidth: 100 }}>
              <legend>{party}</legend>
              {["YES", "NO", "ABSTINATION"].map(voting => (
                <FormGroup check key={voting}>
                  <Label check>
                    <Input
                      checked={this.isChecked({ party, selection: voting })}
                      type="radio"
                      value={voting}
                      name={`vote-${party}-${procedureId}`}
                      onChange={this.onChange(party, voting, true)}
                    />
                    {labels[voting]}
                  </Label>
                  <Input
                    type="number"
                    name="text1"
                    bsSize="5"
                    value={this.getValue({ party, voting })}
                    placeholder="0"
                    innerRef={node => {
                      this.inputs = {
                        ...this.inputs,
                        [party]: { ...this.inputs[party], [voting]: node }
                      };
                    }}
                    onChange={this.onChange(party, voting)}
                  />
                </FormGroup>
              ))}
            </fieldset>
          ))}
        </div>
      </div>
    );
  }
}

VoteEdit.propTypes = {
  partyVotes: PropTypes.array.isRequired,
  decisionText: PropTypes.string,
  procedureId: PropTypes.string.isRequired,
  parties: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
};

VoteEdit.defaultProps = {
  decisionText: ""
};

export default VoteEdit;
