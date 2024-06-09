import axios from 'axios';

const GRAPHQL_API_URL = process.env.GRAPHQL_API_URL || 'http://localhost:3000';

describe('Deputy GraphQL API', () => {
  it('should return data', async () => {
    const response = await axios.post(GRAPHQL_API_URL, {
      query: `
        query Deputies($limit: Int, $offset: Int, $filterTerm: String, $filterConstituency: String, $excludeIds: [String!], $period: Int) {
          deputies(
            limit: $limit
            offset: $offset
            filterTerm: $filterTerm
            filterConstituency: $filterConstituency
            excludeIds: $excludeIds
            period: $period
          ) {
            hasMore
            data {
              _id
              name
              party
              webId
              imgURL
              constituency
            }
          }
        }
      `,
      variables: {
        limit: 10,
        offset: 0,
        filterTerm: '',
        filterConstituency: '',
        excludeIds: [],
        period: 19,
      },
    });

    const { data } = response.data;

    expect(data).toBeDefined();
    expect(data.deputies).toBeDefined();
    expect(data.deputies.hasMore).toBeDefined();
    expect(data.deputies.data).toBeDefined();
  });

  it('deputies filtered by constituency', async () => {
    const response = await axios.post(GRAPHQL_API_URL, {
      query: `
        query GetDeputiesForNewConstituency($filterConstituency: String, $excludeIds: [String!], $period: Int) {
          deputies(
            filterConstituency: $filterConstituency
            excludeIds: $excludeIds
            period: $period
          ) {
            data {
              webId
            }
          }
        }
      `,
      variables: {
        period: 20,
        filterConstituency: '107',
      },
    });

    const { data } = response.data;

    expect(data).toBeDefined();
    expect(data.deputies).toBeDefined();
    expect(data.deputies.data).toBeDefined();
  });
});
