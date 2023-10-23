import { CONFIG } from '../config';
import importProcedures from './import-procedures';
import { ProcedureModel } from '@democracy-deutschland/bundestagio-common';

jest.mock('@democracy-deutschland/bundestagio-common', () => ({
  ProcedureModel: {
    bulkWrite: jest.fn(),
  },
}));

jest.mock('graphql-request', () => ({
  ...jest.requireActual('graphql-request'),
  request: jest.fn().mockResolvedValue({
    procedures: {
      edges: [],
      pageInfo: { endcursor: 'abcde', hasNextPage: false },
    },
  }),
}));

describe('importProcedures', () => {
  it('returns undefined once done', async () => {
    await expect(importProcedures(CONFIG)).resolves.toBe(undefined);
  });

  it('calls `ProcedureModel.bulkWrite`', async () => {
    await importProcedures(CONFIG);
    expect(ProcedureModel.bulkWrite).toHaveBeenCalled();
  });
});
