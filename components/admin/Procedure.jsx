import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

import VoteEdit from './VoteEdit';

class Procedure extends Component {
  state = {
    changed: false,
    data: [],
  };
  render() {
    const {
      procedureId, title, type, period, currentStatus, saveChanges, customData,
    } = this.props;
    const { changed } = this.state;
    const rowHeaderClasses = `card-header ${customData ? 'bg-success' : 'bg-secondary'} `;
    console.log('customData', rowHeaderClasses);
    return (
      <div key={procedureId} className="card">
        <div className={rowHeaderClasses} id={`heading-${procedureId}`}>
          <h5 className="mb-0">
            <button
              className="btn btn-link cut-text  text-light"
              data-toggle="collapse"
              data-target={`#collapse-${procedureId}`}
              aria-expanded="true"
              aria-controls={`collapse-${procedureId}`}
            >
              {title}
            </button>
          </h5>
        </div>

        <div
          id={`collapse-${procedureId}`}
          className="collapse"
          aria-labelledby={`heading-${procedureId}`}
          data-parent="#accordion"
        >
          <div className="card-body">
            <dl className="row">
              <dt className="col-sm-3">ID:</dt>
              <dd className="col-sm-9">{procedureId}</dd>
              <dt className="col-sm-3">Title:</dt>
              <dd className="col-sm-9">{title}</dd>
              <dt className="col-sm-3">Type:</dt>
              <dd className="col-sm-9">{type}</dd>
              <dt className="col-sm-3">Legislaturperiode:</dt>
              <dd className="col-sm-9">{period}</dd>
              <dt className="col-sm-3">Status:</dt>
              <dd className="col-sm-9">{currentStatus}</dd>
            </dl>
            <form>
              <div className="form-group">
                <VoteEdit
                  procedureId={procedureId}
                  partyVotes={customData ? customData.voteResults.partyVotes : []}
                  parties={['CDU', 'SPD', 'AFD', 'Grüne', 'Linke', 'FDP']}
                  onChange={(data) => {
                    this.setState({ changed: true, data });
                  }}
                />
              </div>
              <Button
                color="primary"
                onClick={() =>
                  saveChanges({
                    variables: {
                      procedureId,
                      partyVotes: this.state.data,
                    },
                  })
                }
                disabled={!changed}
              >
                Speichern
              </Button>
            </form>
          </div>
        </div>
        <style jsx>
          {`
            .cut-text {
              text-overflow: ellipsis;
              overflow: hidden;
              width: 100%;
              white-space: nowrap;
              text-align: left;
            }
          `}
        </style>
      </div>
    );
  }
}

const saveChanges = gql`
  mutation saveProcedureCustomData($procedureId: String!, $partyVotes: [PartyVoteInput!]!) {
    saveProcedureCustomData(procedureId: $procedureId, partyVotes: $partyVotes) {
      customData {
        title
        voteResults {
          yes
          no
          abstination
          partyVotes {
            party
            main
            deviants {
              yes
              abstination
              no
            }
          }
        }
      }
    }
  }
`;

export default graphql(saveChanges, {
  name: 'saveChanges',
})(Procedure);
