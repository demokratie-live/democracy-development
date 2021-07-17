import React, { Component } from 'react';

// Helpers
import { subjectGroups } from 'Helpers/subjectGroupToIcon';

const Context = React.createContext();
const Consumer = Context.Consumer;

const documentTypes = ['Antrag', 'Gesetzgebung'];

class Provider extends Component {
  displayName = 'FilterProvider';

  state = {
    types: documentTypes,
    allTypes: true,
    subjectGroups: Object.keys(subjectGroups),
    allSubjectGroups: true,
    hasMore: true,

    sorters: {
      'in-abstimmung': {
        sortBy: 'voteDate',
        all: [
          { title: 'Nach Restzeit', value: 'voteDate' },
          { title: 'Nach Aktuallisierung', value: 'lastUpdateDate' },
          { title: 'Nach Aktivitäten', value: 'activities' },
        ],
      },
      vergangen: {
        sortBy: 'voteDate',
        all: [
          { title: 'Nach Abstimmungsdatum', value: 'voteDate' },
          { title: 'Nach Aktuallisierung', value: 'lastUpdateDate' },
          { title: 'Nach Aktivitäten', value: 'activities' },
        ],
      },
      'in-vorbereitung': {
        sortBy: 'lastUpdateDate',
        all: [
          { title: 'Nach Restzeit', value: 'lastUpdateDate' },
          { title: 'Nach Vorgangsdatum', value: 'created' },
          { title: 'Nach Aktivitäten', value: 'activities' },
        ],
      },
      'whats-hot': {
        sortBy: 'activities',
        all: [],
      },
    },
  };

  setHasMore = hasMore => {
    this.setState({ hasMore });
  };

  selectSubjectGroup = subjectGroup => {
    this.setState({
      subjectGroups: [subjectGroup],
      allSubjectGroups: false,
      types: documentTypes,
      allTypes: true,
      hasMore: true,
    });
  };

  toggleSubjectGroup = subjectGroup => {
    if (this.state.subjectGroups.indexOf(subjectGroup) !== -1) {
      if (this.state.allSubjectGroups) {
        this.setState({
          subjectGroups: [subjectGroup],
          allSubjectGroups: false,
          hasMore: true,
        });
      } else {
        this.setState({
          subjectGroups: this.state.subjectGroups.filter(f => f !== subjectGroup),
          allSubjectGroups: false,
          hasMore: true,
        });
      }
    } else {
      this.setState({
        subjectGroups: [...this.state.subjectGroups, subjectGroup],
        allSubjectGroups: this.state.subjectGroups.length + 1 === Object.keys(subjectGroups).length,
        hasMore: true,
      });
    }
  };

  toggleAllSubjectGroups = () => {
    if (this.state.subjectGroups.length === Object.keys(subjectGroups).length) {
      this.setState({
        subjectGroups: [],
        allSubjectGroups: false,
        hasMore: true,
      });
    } else {
      this.setState({
        subjectGroups: Object.keys(subjectGroups),
        allSubjectGroups: true,
        hasMore: true,
      });
    }
  };

  changeSort = ({ listType, sort }) => {
    this.setState({
      sorters: {
        ...this.state.sorters,
        [listType]: { ...this.state.sorters[listType], sortBy: sort },
        hasMore: true,
      },
    });
  };

  selectType = type => {
    this.setState({
      types: [type],
      allTypes: false,
      subjectGroups: Object.keys(subjectGroups),
      allSubjectGroups: true,
      hasMore: true,
    });
  };

  toggleType = type => {
    if (this.state.types.indexOf(type) !== -1) {
      if (this.state.allTypes) {
        this.setState({
          types: [type],
          allTypes: false,
          hasMore: true,
        });
      } else {
        this.setState({
          types: this.state.types.filter(f => f !== type),
          allTypes: false,
          hasMore: true,
        });
      }
    } else {
      this.setState({
        types: [...this.state.types, type],
        allTypes: this.state.types.length + 1 === documentTypes.length,
        hasMore: true,
      });
    }
  };

  toggleAllTypes = () => {
    if (this.state.types.length === documentTypes.length) {
      this.setState({
        types: [],
        allTypes: false,
        hasMore: true,
      });
    } else {
      this.setState({
        types: documentTypes,
        allTypes: true,
        hasMore: true,
      });
    }
  };

  render() {
    return (
      <Context.Provider
        value={{
          state: this.state,
          selectSubjectGroup: this.selectSubjectGroup,
          toggleSubjectGroup: this.toggleSubjectGroup,
          toggleAllSubjectGroups: this.toggleAllSubjectGroups,
          selectType: this.selectType,
          toggleType: this.toggleType,
          toggleAllTypes: this.toggleAllTypes,
          changeSort: this.changeSort,
          setHasMore: this.setHasMore,
        }}
      >
        {this.props.children}
      </Context.Provider>
    );
  }
}

export { Provider, Consumer };

export default Context;
