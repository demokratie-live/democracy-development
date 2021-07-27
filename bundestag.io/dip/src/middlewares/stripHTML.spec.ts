/** @jest-environment setup-polly-jest/jest-environment-node */
/* eslint-disable @typescript-eslint/no-explicit-any */
import createServer from '../server';

let mockDipAPI: any;

beforeEach(() => {
  mockDipAPI = {
    getVorgang: jest.fn(),
    getVorgangsVorgangspositionen: jest.fn(),
  };
});

const DIP_API_KEY = 'WHATEVER';
const { server } = createServer({
  DIP_API_KEY,
  DIP_API_ENDPOINT: 'https://search.dip.bundestag.de',
  RATE_LIMIT: 20,
  config: {
    dataSources: () => ({ dipAPI: mockDipAPI }),
  },
});

const gql = String.raw;

describe('middlewares', () => {
  describe('stripHTML', () => {
    const query = gql`
      query ($procedureId: ID!) {
        procedure(id: $procedureId) {
          abstract
          procedureId
          period
          date
          history {
            abstract
          }
        }
      }
    `;

    describe('when DipAPI returns some data containing HTML', () => {
      beforeEach(() => {
        mockDipAPI.getVorgang.mockResolvedValue({
          abstract: '<strong>Beschlussempfehlung des Ausschusses: Änderungen</strong>',
          id: '275942',
          wahlperiode: 19,
          datum: '2021-06-25',
        });
        mockDipAPI.getVorgangsVorgangspositionen.mockResolvedValue([
          {
            abstract: '<p>Some abstract with HTML</p>',
          },
        ]);
      });

      it('removes HTML from Procedure.abstract', async () => {
        const variables = { procedureId: '275942' };
        await expect(server.executeOperation({ query, variables })).resolves.toMatchObject({
          data: {
            procedure: {
              abstract: 'Beschlussempfehlung des Ausschusses: Änderungen',
              procedureId: '275942',
              period: 19,
              date: '2021-06-25',
            },
          },
          errors: undefined,
        });
      });

      it('removes HTML from ProcessFlow.abstract', async () => {
        const variables = { procedureId: '275942' };
        await expect(server.executeOperation({ query, variables })).resolves.toMatchObject({
          data: {
            procedure: {
              history: [
                {
                  abstract: 'Some abstract with HTML',
                },
              ],
            },
          },
          errors: undefined,
        });
      });
    });
  });
});
