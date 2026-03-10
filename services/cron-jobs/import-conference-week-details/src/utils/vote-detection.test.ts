import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@democracy-deutschland/bundestagio-common', () => ({
  ProcedureModel: {
    find: vi.fn(),
  },
}));

import { ProcedureModel } from '@democracy-deutschland/bundestagio-common';
import { getProcedureIds } from './vote-detection';

describe('getProcedureIds', () => {
  beforeEach(() => {
    vi.mocked(ProcedureModel.find).mockReset();
  });

  it('should resolve relative and absolute Bundestag links through the same lookup path', async () => {
    vi.mocked(ProcedureModel.find).mockResolvedValue([{ procedureId: '20-12345' }] as never);

    const procedureIds = await getProcedureIds([
      '/dip21/btd/20/123/2012345.pdf',
      'https://www.bundestag.de/dip21/btd/20/123/2012345.pdf',
      'https://dserver.bundestag.de/dip21/btd/20/123/2012345.pdf',
    ]);

    expect(procedureIds).toEqual(['20-12345']);
    expect(ProcedureModel.find).toHaveBeenCalledTimes(1);
    expect(ProcedureModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        importantDocuments: {
          $elemMatch: {
            $and: expect.arrayContaining([
              {
                url: {
                  $regex: '2012345.pdf$',
                },
              },
            ]),
          },
        },
      }),
      { procedureId: 1 },
    );
  });

  it('should skip malformed and non-Bundestag links', async () => {
    const procedureIds = await getProcedureIds([
      'https://example.com/dip21/btd/20/123/2012345.pdf',
      'javascript:alert(1)',
      'https://',
    ]);

    expect(procedureIds).toEqual([]);
    expect(ProcedureModel.find).not.toHaveBeenCalled();
  });
});
