import { Component } from 'react';

// Components
import ListTypesList from './ListTypesList';
import SearchList from './SearchList';

// Context
import { Consumer as SearchConsumer } from 'Context/search';

class List extends Component {
  render() {
    return (
      <SearchConsumer>
        {consumerProps => {
          const { term } = consumerProps;

          if (term.trim()) {
            return <SearchList term={term} />;
          } else {
            return <ListTypesList />;
          }
        }}
      </SearchConsumer>
    );
  }
}

export default List;
