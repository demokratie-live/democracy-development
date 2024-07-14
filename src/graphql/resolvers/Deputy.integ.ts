import axios from 'axios';
import { connectDB, disconnectDB } from '../../services/mongoose';
import config from '../../config';
import { DeputyModel, IDeputy } from '@democracy-deutschland/democracy-common';

const GRAPHQL_API_URL = process.env.GRAPHQL_API_URL || 'http://localhost:3000';

describe('Deputy GraphQL API', () => {
  describe('Queries', () => {
    let deputy1: IDeputy;
    let deputy2: IDeputy;

    beforeAll(async () => {
      await connectDB(config.DB_URL, { debug: false });

      // create tmp deputies
      deputy1 = await DeputyModel.create({
        name: 'tmp deputy for deputy test',
        party: 'CDU',
        webId: '0000010',
        constituency: '',
        period: 19,
        imgURL: 'https://example.com',
      });

      deputy2 = await DeputyModel.create({
        name: 'tmp deputy for deputy test',
        party: 'CDU',
        webId: '0000011',
        constituency: '107',
        period: 20,
        imgURL: 'https://example.com',
      });
    });

    afterAll(async () => {
      await deputy1.remove();
      await deputy2.remove();

      await disconnectDB();
    });

    describe('deputies', () => {
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
        expect(data.deputies.data.length).toBeGreaterThan(0);
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
        expect(data.deputies.data.length).toBeGreaterThan(0);
      });
    });

    describe('deputyOfConstituency', () => {
      it('should return data', async () => {
        const response = await axios.post(GRAPHQL_API_URL, {
          query: `
        query DeputiesOfConstituency($constituency: String!, $period: Int) {
          deputiesOfConstituency(constituency: $constituency, period: $period) {
            _id
            name
            party
            webId
            imgURL
            constituency
          }
        }
      `,
          variables: {
            constituency: '107',
            period: 20,
          },
        });

        const { data } = response.data;

        expect(data).toBeDefined();
        expect(data.deputiesOfConstituency).toBeDefined();
        expect(data.deputiesOfConstituency.length).toBeGreaterThan(0);
      });
    });

    describe('deputy', () => {
      it('should return data', async () => {
        const response = await axios.post(GRAPHQL_API_URL, {
          query: `
        query Deputy($id: String!) {
          deputy(id: $id) {
            _id
            name
            party
            webId
            imgURL
            constituency
          }
        }
      `,
          variables: {
            id: deputy1.webId,
          },
        });

        const { data } = response.data;

        expect(data).toBeDefined();
        expect(data.deputy).toBeDefined();
        expect(data.deputy.name).toBe(deputy1.name);
        expect(data.deputy.party).toBe(deputy1.party);
        expect(data.deputy.webId).toBe(deputy1.webId);
        expect(data.deputy.imgURL).toBe(deputy1.imgURL);
        expect(data.deputy.constituency).toBe(deputy1.constituency);
      });
    });
  });
});
