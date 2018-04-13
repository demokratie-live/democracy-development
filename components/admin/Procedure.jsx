import React, { Component } from 'react';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

import VoteEdit from './VoteEdit';

class Procedure extends Component {
  state = {};
  render() {
    const { procedureId, title, type } = this.props;
    return (
      <div key={procedureId} className="card">
        <div className="card-header  bg-secondary" id={`heading-${procedureId}`}>
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
            </dl>
            <form>
              <div className="form-group">
                <VoteEdit
                  procedureId={procedureId}
                  parties={['CDU', 'SPD', 'AFD', 'Grüne', 'Linke', 'FDP']}
                />
              </div>
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

export default Procedure;
