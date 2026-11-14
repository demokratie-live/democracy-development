/**
 * Executes GraphQL against the real bundestag.io SDL, so mock answers have
 * the same shape (and __typename) as the API and wrong queries fail here too.
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { buildSchema, graphql } from 'graphql';

import {
  getProcedure,
  listProcedures,
  saveCustomData,
  saveNamedPollCustomData,
} from './db';

const SDL_DIR = path.resolve(__dirname, '../../api/src/graphql/schemas');

// the API merges one Query/Mutation per file; here every repeat becomes an extension
const seen = new Set<string>();
const sdl = readdirSync(SDL_DIR)
  .filter((file) => file.endsWith('.graphql'))
  .sort()
  .map((file) => readFileSync(path.join(SDL_DIR, file), 'utf8'))
  .join('\n')
  .replace(/^type (Query|Mutation)\b/gm, (match, name: string) => {
    if (!seen.has(name)) {
      seen.add(name);
      return match;
    }
    return `extend type ${name}`;
  });

// the SDL repeats an argument and uses @auth without declaring it here
const schema = buildSchema(sdl, { assumeValidSDL: true });

const rootValue = {
  procedure: ({ procedureId }: { procedureId: string }) => getProcedure(procedureId),
  proceduresData: (args: Parameters<typeof listProcedures>[0]) => listProcedures(args),
  // the API returns the protocol line that names a document plus its neighbours:
  // [line before, matching line, next three lines]
  voteResultTextHelper: ({ procedureId }: { procedureId: string }) => {
    const procedure = getProcedure(procedureId);
    if (!procedure?.voteDate) throw new Error('No vote date found');
    const doc = procedure.importantDocuments.at(-1)?.number ?? '';
    const text = procedure.customData.voteResults.decisionText;
    return [
      {
        results: [
          'Mock: Ich schließe die Aussprache.',
          `Wir kommen zur Abstimmung über die Vorlage auf Drucksache ${doc}.`,
          text ?? 'Wer stimmt dafür? – Wer stimmt dagegen? – Enthaltungen? – Die Vorlage ist abgelehnt.',
          'Ich rufe den nächsten Tagesordnungspunkt auf.',
          '',
        ],
      },
    ];
  },
  legislativePeriods: () =>
    [19, 20, 21].map((number) => ({ number, deputies: 0, start: null, end: null })),
  saveProcedureCustomData: (args: Parameters<typeof saveCustomData>[0]) => saveCustomData(args),
  saveProcedurenamedPollCustomData: (args: Parameters<typeof saveNamedPollCustomData>[0]) =>
    saveNamedPollCustomData(args),
};

export const execute = (query: string, variables?: Record<string, unknown>) =>
  graphql({ schema, source: query, rootValue, variableValues: variables });
