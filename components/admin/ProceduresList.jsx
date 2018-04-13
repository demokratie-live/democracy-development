import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import Procedure from './Procedure';

class Procedures extends Component {
  state = {
    search: false,
  };
  render() {
    const { procedures } = this.props;
    const { search } = this.state;
    if (!procedures) {
      return null;
    }
    return (
      <div id="accordion">
        <div className="input-group mb-3">
          <div className="input-group-prepend">
            <span className="input-group-text" role="img" id="basic-addon1" aria-label="search">
              🕵🏻‍
            </span>
          </div>
          <input
            type="text"
            className="form-control"
            placeholder="Title"
            aria-label="Title"
            aria-describedby="basic-addon1"
            onChange={arg => this.setState({ search: arg.target.value.trim() })}
          />
        </div>

        {procedures
          .filter(({ title }) => !search || title.toLowerCase().indexOf(search.toLowerCase()) !== -1)
          .map(item => <Procedure key={item.procedureId} {...item} />)}
      </div>
    );
  }
}

const testQuery = gql`
  {
    allProcedures {
      procedureId
      title
      type
    }
  }
`;

export default graphql(testQuery, {
  props: ({ data: { allProcedures: procedures } }) => ({ procedures }),
})(Procedures);
