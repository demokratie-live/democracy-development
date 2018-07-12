import React, { Component } from "react";
import PropTypes from "prop-types";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import { Button } from "reactstrap";

import GET_PROCEDURE_LIST from "../../src/graphql/queries/procedureList";

import VoteEdit from "./VoteEdit";

class Procedure extends Component {
  state = {
    changed: false,
    data: [],
    decisionText: ""
  };
  render() {
    const {
      procedureId,
      title,
      type,
      period,
      currentStatus,
      saveChanges,
      customData,
      history,
      importantDocuments
    } = this.props;
    const { changed } = this.state;
    const namedVoted =
      history &&
      history.some(
        ({ decision }) =>
          decision &&
          decision.some(
            ({ type: decisionType }) =>
              decisionType === "Namentliche Abstimmung"
          )
      );

    const findSpotUrl = history.find(
      ({ assignment, initiator }) =>
        (assignment === "BT" && initiator === "3. Beratung") ||
        (assignment === "BT" && initiator === "Beratung")
    );

    const hastCustomData =
      customData &&
      customData.voteResults &&
      (customData.voteResults.yes ||
        customData.voteResults.abstination ||
        customData.voteResults.no);

    const rowHeaderClasses = `card-header ${
      hastCustomData || namedVoted
        ? "bg-success"
        : findSpotUrl
          ? "bg-secondary"
          : "bg-warning"
    } `;

    const documents = importantDocuments.map(({ url, editor, number }) => (
      <div key={number}>
        <a href={url} target="_blank">
          {editor} {number}
        </a>{" "}
        <br />
      </div>
    ));

    const histories = history.map(
      ({ assignment, initiator, findSpot, findSpotUrl }) => (
        <div key={initiator}>
          {assignment} {initiator}:{" "}
          <a href={findSpotUrl} target="_blank">
            {findSpot}
          </a>{" "}
          <br />
        </div>
      )
    );

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
              {namedVoted && [
                <dt key="1" className="col-sm-3">
                  Namentliche Abstimmung
                </dt>,
                <dd key="2" className="col-sm-9">
                  Ja
                </dd>
              ]}
              {importantDocuments && [
                <dt key="1" className="col-sm-3">
                  Dokumente
                </dt>,
                <dd key="2" className="col-sm-9">
                  {documents}
                </dd>
              ]}
              {histories && [
                <dt key="1" className="col-sm-3">
                  Historie
                </dt>,
                <dd key="2" className="col-sm-9">
                  {histories}
                </dd>
              ]}
              {findSpotUrl && [
                <dt key="1" className="col-sm-3">
                  Beschlusstext Dokument
                </dt>,
                <dd key="2" className="col-sm-9">
                  <a href={findSpotUrl.findSpotUrl} target="_blank">
                    {findSpotUrl.findSpotUrl}
                  </a>
                </dd>
              ]}
            </dl>
            {!namedVoted && (
              <form>
                <div className="form-group">
                  <VoteEdit
                    procedureId={procedureId}
                    partyVotes={
                      customData ? customData.voteResults.partyVotes : []
                    }
                    parties={[
                      "CDU",
                      "SPD",
                      "AFD",
                      "Grüne",
                      "Linke",
                      "FDP",
                      "Andere"
                    ]}
                    decisionText={
                      customData ? customData.voteResults.decisionText : ""
                    }
                    onChange={(data, decisionText) => {
                      this.setState({ changed: true, data, decisionText });
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
                        decisionText: this.state.decisionText
                      }
                    }).then(() => {
                      alert("saved");
                    })
                  }
                  disabled={!changed}
                >
                  Speichern
                </Button>
              </form>
            )}
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

Procedure.propTypes = {
  procedureId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  period: PropTypes.number.isRequired,
  currentStatus: PropTypes.string.isRequired,
  saveChanges: PropTypes.func.isRequired,
  customData: PropTypes.shape(),
  history: PropTypes.array.isRequired,
  importantDocuments: PropTypes.array.isRequired
};

Procedure.defaultProps = {
  customData: {}
};

const saveChanges = gql`
  mutation saveProcedureCustomData(
    $procedureId: String!
    $partyVotes: [PartyVoteInput!]!
    $decisionText: String!
  ) {
    saveProcedureCustomData(
      procedureId: $procedureId
      partyVotes: $partyVotes
      decisionText: $decisionText
    ) {
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
  name: "saveChanges",
  options: {
    refetchQueries: [
      {
        query: GET_PROCEDURE_LIST
      }
    ]
  }
})(Procedure);
