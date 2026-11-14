/**
 * MSW handlers for every service the admin talks to (server side).
 * Used by mocks/server.ts for local work and by msw/node in tests.
 */
import { http, HttpResponse, delay } from 'msw';
import { graphql } from 'msw/graphql';

import { getProcedure, listByVoteDate } from './db';
import { execute } from './schema';

export const MOCK_ORIGIN = 'http://localhost:4010';

// env values the admin needs to talk to the mock instead of the real services
export const MOCK_ENV = {
  BUNDESTAGIO_SERVER_URL: `${MOCK_ORIGIN}/bundestagio/graphql`,
  PROCEDURES_SERVER_URL: `${MOCK_ORIGIN}/procedures-server`,
  NON_NAMED_VOTES_AI_SERVER_URL: `${MOCK_ORIGIN}/non-named-votes-ai`,
  NON_NAMED_VOTES_AI_SECRET: 'mock',
  AI_SERVER_URL: `${MOCK_ORIGIN}/votes-ai/graphql`,
  AI_ACCESS_TOKEN: 'mock',
  AI_SIMULATION: 'false',
};

const bundestagio = graphql.link(MOCK_ENV.BUNDESTAGIO_SERVER_URL);
const votesAi = graphql.link(MOCK_ENV.AI_SERVER_URL);

// answer like the real AI helpers, but instantly and for free
const AI_DELAY_MS = 800;

export const handlers = [
  votesAi.query('ParseDecision', async ({ variables }) => {
    await delay(AI_DELAY_MS);
    const parties = variables.period === 21 ? ['Union', 'AfD', 'SPD', 'Grüne', 'Linke'] : ['Union', 'SPD', 'AfD', 'FDP', 'Grüne', 'Linke'];
    return HttpResponse.json({
      data: {
        parseDecision: {
          input: { decision: variables.decision, period: variables.period },
          result: {
            votes: parties.map((name, i) => ({ name, vote: i % 2 ? 'NO' : 'YES' })),
            votingDocument: 'mainDocument',
            votingRecommendation: true,
          },
          usage: null,
        },
      },
    });
  }),

  bundestagio.operation(async ({ query, variables }) => HttpResponse.json(await execute(query, variables))),

  http.get(`${MOCK_ENV.PROCEDURES_SERVER_URL}/procedures/list/:when`, ({ params, request }) => {
    const when = params.when === 'upcoming' ? 'upcoming' : 'past';
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 1);
    const limit = Number(url.searchParams.get('limit') ?? 10);
    return HttpResponse.json(listByVoteDate(when, page, limit));
  }),

  http.get(`${MOCK_ENV.NON_NAMED_VOTES_AI_SERVER_URL}/beschlusstext`, async ({ request }) => {
    await delay(AI_DELAY_MS);
    const url = new URL(request.url);
    const title = url.searchParams.get('title') ?? '';
    return HttpResponse.json({
      pdfUrl: url.searchParams.get('pdfUrl'),
      text: `Mock-Beschlusstext zu „${title}“: Wer stimmt dafür? – Wer stimmt dagegen? – Enthaltungen? – Der Antrag ist abgelehnt.`,
    });
  }),

  // placeholder for plenary minutes the public API does not know
  http.get(`${MOCK_ORIGIN}/plenarprotokoll/:procedureId`, ({ params }) => {
    const procedure = getProcedure(String(params.procedureId).replace(/\.pdf$/, ''));
    return new HttpResponse(
      `Mock: Hier stünde das Plenarprotokoll zu „${procedure?.title ?? params.procedureId}“.\n`,
      { headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  }),
];
