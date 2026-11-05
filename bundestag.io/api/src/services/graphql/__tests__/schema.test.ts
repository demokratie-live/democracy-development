import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { graphql } from 'graphql';
import { buildSchema } from '../index';

const SAVE_CUSTOM_DATA = `
  mutation {
    saveProcedureCustomData(
      procedureId: "1"
      partyVotes: []
      decisionText: ""
      votingDocument: mainDocument
      toggleDecision: false
    ) {
      procedureId
    }
  }
`;

const SAVE_NAMED_POLL_CUSTOM_DATA = `
  mutation {
    saveProcedurenamedPollCustomData(procedureId: "1", toggleDecision: false) {
      procedureId
    }
  }
`;

const createContext = (headers: Record<string, string>) => {
  const ProcedureModel = {
    findOne: vi.fn(async () => ({ procedureId: '1', customData: { voteResults: {} } })),
    update: vi.fn(async () => ({})),
  };
  return { contextValue: { req: { headers }, ProcedureModel }, ProcedureModel };
};

describe('GraphQL schema', () => {
  const originalEnvToken = process.env.BIO_EDIT_TOKEN;

  beforeAll(() => {
    process.env.BIO_EDIT_TOKEN = 'test-token';
  });

  afterAll(() => {
    process.env.BIO_EDIT_TOKEN = originalEnvToken;
  });

  describe.each([
    ['saveProcedureCustomData', SAVE_CUSTOM_DATA],
    ['saveProcedurenamedPollCustomData', SAVE_NAMED_POLL_CUSTOM_DATA],
  ])('%s', (_name, source) => {
    it('rejects without token', async () => {
      const { contextValue, ProcedureModel } = createContext({});
      const result = await graphql({ schema: buildSchema(), source, contextValue });

      expect(result.errors?.[0]?.message).toBe('You do not have enough permissions!');
      expect(ProcedureModel.update).not.toHaveBeenCalled();
    });

    it('rejects with wrong token', async () => {
      const { contextValue, ProcedureModel } = createContext({ 'bio-auth-token': 'wrong-token' });
      const result = await graphql({ schema: buildSchema(), source, contextValue });

      expect(result.errors?.[0]?.message).toBe('You do not have enough permissions!');
      expect(ProcedureModel.update).not.toHaveBeenCalled();
    });

    it('accepts valid token', async () => {
      const { contextValue, ProcedureModel } = createContext({ 'bio-auth-token': 'test-token' });
      const result = await graphql({ schema: buildSchema(), source, contextValue });

      expect(result.errors).toBeUndefined();
      expect(ProcedureModel.update).toHaveBeenCalledOnce();
    });
  });
});
