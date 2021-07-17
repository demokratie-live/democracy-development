import React, { Component } from 'react';

const Context = React.createContext();
const Consumer = Context.Consumer;

class Provider extends Component {
  displayName = 'SearchProvider';

  state = {
    term: '',
  };

  changeSearchTerm = term => {
    if (term !== this.state.term) {
      this.setState({ term });
    }
  };

  render() {
    return (
      <Context.Provider
        value={{
          ...this.state,
          changeSearchTerm: this.changeSearchTerm,
        }}
      >
        {this.props.children}
      </Context.Provider>
    );
  }
}

export { Provider, Consumer };

export default Context;
