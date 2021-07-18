import importProcedures from './import-procedures';
import config from '../config';
import { request } from 'graphql-request';
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
    await expect(importProcedures(config)).resolves.toBe(undefined);
  });

  it('calls `request`', async () => {
    await importProcedures(config);
    expect(request).toHaveBeenCalled();
  });

  it('calls `ProcedureModel.bulkWrite`', async () => {
    await importProcedures(config);
    expect(ProcedureModel.bulkWrite).toHaveBeenCalled();
  });
});
