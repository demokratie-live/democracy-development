import { Component } from 'react';
import { withRouter } from 'next/router';
import { Query } from 'react-apollo';
import styled from 'styled-components';
import { Spin as AntSpin } from 'antd';

// Components
import SelectComponent from 'Components/shared/Select';
import TeaserList from './TeaserList';

// Helper
import { listTypeUrlToQueryParam as getListType } from '../../lib/helpers/listTypeConvert';

// Context
import { Consumer as FilterConsumer } from 'Context/filter';

// GraphQL
import PROCEDURES from 'GraphQl/queries/procedures';
import ListDesctiption from './ListDescription';
const PAGE_SIZE = 15;

const Section = styled.section`
  background-color: ${({ theme }) => theme.backgrounds.secondary};
  padding-left: ${({ theme }) => theme.space(1)}px;
  padding-right: ${({ theme }) => theme.space(1)}px;
  padding-top: ${({ theme }) => theme.space(0.5)}px;
  padding-bottom: ${({ theme }) => theme.space(1)}px;

  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    padding-left: ${({ theme }) => theme.space(4)}px;
    padding-right: ${({ theme }) => theme.space(4)}px;
    padding-top: ${({ theme }) => theme.space(2)}px;
    padding-bottom: ${({ theme }) => theme.space(4)}px;
  }
`;

const Select = styled(SelectComponent)`
  float: right;
  & .ant-select-selection {
    background-color: ${({ theme }) => theme.backgrounds.tertiary};
  }
`;

const Option = styled(SelectComponent.Option)``;

const SpinWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
`;
const Spin = styled(AntSpin)``;

class ListTypesList extends Component {
  state = {
    hasMore: true,
  };

  componentDidUpdate({
    router: {
      query: { listType },
    },
  }) {
    if (listType !== this.props.router.query.listType) {
      this.setState({ hasMore: true });
    }
    return null;
  }

  loadMore = ({ fetchMore, setHasMore }) => page => {
    fetchMore({
      variables: {
        offset: PAGE_SIZE * page,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }
        if (fetchMoreResult.procedures.length === 0) {
          setHasMore(false);
        }

        return Object.assign({}, prev, {
          procedures: [...prev.procedures, ...fetchMoreResult.procedures],
        });
      },
    });
  };

  render() {
    const {
      router: {
        query: { listType = 'in-abstimmung' },
      },
    } = this.props;
    return (
      <Section>
        <FilterConsumer>
          {filterConsumer => {
            const { state, changeSort, setHasMore } = filterConsumer;
            return (
              <>
                <ListDesctiption />
                {state.sorters[listType].all.length > 0 && (
                  <Select
                    value={state.sorters[listType].sortBy}
                    onChange={sort => changeSort({ listType, sort })}
                    prefix="\f12a"
                  >
                    {state.sorters[listType].all.map(({ title, value }) => (
                      <Option key={`${listType}-${value}`} value={value}>
                        {title}
                      </Option>
                    ))}
                  </Select>
                )}
                <Query
                  query={PROCEDURES}
                  variables={{
                    listTypes: [getListType(listType)],
                    filter: { subjectGroups: state.subjectGroups, type: state.types },
                    pageSize: PAGE_SIZE,
                    sort: state.sorters[listType].sortBy,
                  }}
                >
                  {({ loading, error, data: { procedures }, fetchMore }) => {
                    if (loading)
                      return (
                        <SpinWrapper>
                          <Spin size="large" tip="Lädt…" />
                        </SpinWrapper>
                      );
                    if (error) return <p>Error :(</p>;
                    if (procedures[0]) {
                      if (procedures[0].procedureId !== this.lastFirstProcedure) {
                        setHasMore(true);
                      }
                      this.lastFirstProcedure = procedures[0].procedureId;
                    }
                    return (
                      <TeaserList
                        pageStart={Math.ceil(procedures.length / PAGE_SIZE) - 1}
                        hasMore={state.hasMore}
                        loadMore={this.loadMore({ fetchMore, setHasMore })}
                        procedures={procedures}
                        listType={listType}
                      />
                    );
                  }}
                </Query>
              </>
            );
          }}
        </FilterConsumer>
      </Section>
    );
  }
}

export default withRouter(ListTypesList);
