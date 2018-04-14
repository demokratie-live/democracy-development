import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';

import Procedure from './Procedure';

class Procedures extends Component {
  state = {
    search: false,
    page: 1,
    rowsPerPage: 10,
  };
  render() {
    const { procedures } = this.props;
    const { search, rowsPerPage, page } = this.state;
    if (!procedures) {
      return null;
    }
    const data = procedures.filter(({ title, procedureId }) =>
      !search ||
        title.toLowerCase().indexOf(search.toLowerCase()) !== -1 ||
        search === procedureId);
    console.log('MATH ', Math.ceil(data.length / rowsPerPage));
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
                this.setState({ page: Math.min(page + 1, Math.ceil(data.length / rowsPerPage)) })
              }
            />
          </PaginationItem>
        </Pagination>
        <div className="input-group mb-3">
          <div className="input-group-prepend">
            <span className="input-group-text" role="img" id="basic-addon1" aria-label="search">
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

const testQuery = gql`
  query procedures($status: [String!]) {
    procedures(status: $status) {
      procedureId
      title
      type
      period
      currentStatus
    }
  }
`;

export default graphql(testQuery, {
  options: {
    variables: {
      status: [
        // Unterhalb keys für Vergangen
        'Erledigt durch Ablauf der Wahlperiode',
        'Zurückgezogen',
        'Abgeschlossen - Ergebnis siehe Vorgangsablauf',
        'Für nichtig erklärt',
        'Verkündet',
        'Zusammengeführt mit... (siehe Vorgangsablauf)',
        'Für erledigt erklärt',
        'Verabschiedet',
        'Bundesrat hat zugestimmt',
        'Bundesrat hat Einspruch eingelegt',
        'Bundesrat hat Zustimmung versagt',
        'Bundesrat hat Vermittlungsausschuss nicht angerufen',
        'Im Vermittlungsverfahren',
        'Vermittlungsvorschlag liegt vor',
        'Für mit dem Grundgesetz unvereinbar erklärt',
        'Nicht ausgefertigt wegen Zustimmungsverweigerung des Bundespräsidenten',
        'Zustimmung versagt',
        'Teile des Gesetzes für nichtig erklärt',
        'Für gegenstandslos erklärt',
      ],
    },
  },
  props: ({ data, data: { procedures } }) => {
    console.log(data);
    return { procedures };
  },
})(Procedures);
