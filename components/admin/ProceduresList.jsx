import React, { Component } from "react";
import PropTypes from "prop-types";
import { graphql } from "react-apollo";
import { Pagination, PaginationItem, PaginationLink } from "reactstrap";

import GET_PROCEDURE_LIST from "../../src/graphql/queries/procedureList";

import Procedure from "./Procedure";

class ProceduresList extends Component {
  state = {
    search: false,
    page: 1,
    rowsPerPage: 10
  };
  render() {
    const { procedures } = this.props;
    const { search, rowsPerPage, page } = this.state;
    if (!procedures) {
      return null;
    }
    const data = procedures.filter(
      ({ title, procedureId }) =>
        !search ||
        title.toLowerCase().indexOf(search.toLowerCase()) !== -1 ||
        search === procedureId
    );
    return (
      <div id="accordion">
        <Pagination size="sm">
          <PaginationItem>
            <PaginationLink
              previous
              onClick={() => this.setState({ page: Math.max(page - 1, 1) })}
            />
          </PaginationItem>
          {[...Array(Math.ceil(data.length / rowsPerPage))].map((v, i) => (
            <PaginationItem key={i} active={page === i + 1}>
              <PaginationLink onClick={() => this.setState({ page: i + 1 })}>
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationLink
              next
              onClick={() =>
                this.setState({
                  page: Math.min(page + 1, Math.ceil(data.length / rowsPerPage))
                })
              }
            />
          </PaginationItem>
        </Pagination>
        <div className="input-group mb-3">
          <div className="input-group-prepend">
            <span
              className="input-group-text"
              role="img"
              id="basic-addon1"
              aria-label="search"
            >
              🕵🏻‍
            </span>
          </div>
          <input
            type="text"
            className="form-control"
            placeholder="Title, Id"
            aria-label="Title"
            aria-describedby="basic-addon1"
            onChange={arg => this.setState({ search: arg.target.value.trim() })}
          />
        </div>

        {data
          .slice((page - 1) * rowsPerPage, page * rowsPerPage)
          .map(item => <Procedure key={item.procedureId} {...item} />)}
      </div>
    );
  }
}

ProceduresList.propTypes = {
  procedures: PropTypes.array.isRequired
};

export default graphql(GET_PROCEDURE_LIST, {
  options: {
    variables: {
      voteDate: true
    }
  },
  props: ({ data: { procedures } }) => ({ procedures: procedures || [] })
})(ProceduresList);
