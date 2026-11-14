import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';

import { handlers, MOCK_ENV } from '../handlers';
import { resetDb } from '../db';

const server = setupServer(...handlers);
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
beforeEach(() => resetDb());
afterAll(() => server.close());

const gql = async (query: string, variables?: Record<string, unknown>) => {
  const response = await fetch(MOCK_ENV.BUNDESTAGIO_SERVER_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
};

const TODO = `{ proceduresData(manageVoteDate: true, period: [21]) { totalCount nodes { procedureId } } }`;
const todoIds = async () => (await gql(TODO)).data.proceduresData.nodes.map((p) => p.procedureId);

const SAVE = `mutation ($procedureId: String!, $toggleDecision: Boolean!) {
  saveProcedureCustomData(
    procedureId: $procedureId
    partyVotes: [
      { party: "Union", main: NO, deviants: { yes: 0, no: 0, abstination: 0 } }
      { party: "AfD", main: YES, deviants: { yes: 0, no: 2, abstination: 0 } }
    ]
    decisionText: " Der Antrag ist abgelehnt. "
    votingDocument: recommendedDecision
    toggleDecision: $toggleDecision
  ) { customData { voteResults { yes no decisionText votingRecommendation } } }
}`;

describe('mock bundestag.io API', () => {
  it('lists only open procedures of the period as to-do, the yes = 0 case included', async () => {
    const ids = await todoIds();
    expect(ids).toContain('341113');
    expect(ids).toContain('341459'); // has a result, but no yes vote
    expect(ids).not.toContain('325644'); // has a result
    expect(ids).not.toContain('336653'); // vote date in the future
  });

  it('saves like the API: counts from seats, toggleDecision becomes votingRecommendation, leaves the to-do list', async () => {
    const { data } = await gql(SAVE, { procedureId: '341113', toggleDecision: false });
    expect(data.saveProcedureCustomData.customData.voteResults).toEqual({
      yes: 149,
      no: 210,
      decisionText: 'Der Antrag ist abgelehnt.',
      votingRecommendation: false,
    });
    expect(await todoIds()).not.toContain('341113');
  });

  it('rejects queries that do not match the real schema', async () => {
    const { errors } = await gql('{ procedure(procedureId: "341113") { notAField } }');
    expect(errors[0].message).toMatch(/notAField/);
  });

  it('answers the AI helpers without calling Claude', async () => {
    const url = new URL(`${MOCK_ENV.NON_NAMED_VOTES_AI_SERVER_URL}/beschlusstext`);
    url.searchParams.set('title', 'Testantrag');
    const { text } = await (await fetch(url)).json();
    expect(text).toContain('Testantrag');
  });
});
