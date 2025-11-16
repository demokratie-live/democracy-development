import { vi, describe, it, expect, type Mock } from 'vitest';
import { ProcedureModel, ActivityModel } from '@democracy-deutschland/democracy-common'; // Assuming these are the correct imports
import ActivityApi from './Activity';

vi.mock('@democracy-deutschland/democracy-common', () => ({
  ProcedureModel: {
    findOne: vi.fn(),
  },
  ActivityModel: {
    find: vi.fn(),
    findOne: vi.fn(() => ({ count: vi.fn() })),
    create: vi.fn(),
  },
  testCronTime: vi.fn(),
}));

describe('ActivityApi', () => {
  describe('Query', () => {
    describe('activityIndex', () => {
      it('returns activity index when procedure is found', async () => {
        (ProcedureModel.findOne as Mock).mockResolvedValue({ procedureId: '123' });
        (ActivityModel.find as Mock).mockImplementation(() => ({ count: () => 10 }));

        const result = await ActivityApi.Query.activityIndex(
          null,
          { procedureId: '123' },
          { ProcedureModel, ActivityModel } as any,
          {} as any,
        );

        expect(result).toEqual({ activityIndex: 10, active: true });
      });

      it('returns null when procedure is not found', async () => {
        (ProcedureModel.findOne as Mock).mockResolvedValue(null);

        const result = await ActivityApi.Query.activityIndex(
          null,
          { procedureId: '123' },
          { ProcedureModel, ActivityModel, phone: {}, device: {} } as any,
          {} as any,
        );

        expect(result).toBeNull();
      });
    });
  });

  describe('Mutation', () => {
    describe('increaseActivity', () => {
      it('returns activity index and active status when procedure is found and activity exists', async () => {
        (ProcedureModel.findOne as Mock).mockResolvedValue(true);
        (ActivityModel.findOne as Mock).mockResolvedValue(true);
        (ActivityModel.find as Mock).mockImplementation(() => ({ count: () => 10 }));

        const result = await ActivityApi.Mutation.increaseActivity(
          null,
          { procedureId: '123' },
          { ProcedureModel, ActivityModel, phone: {}, device: {} } as any,
          {} as any,
        );

        expect(result).toEqual({ activityIndex: 10, active: true });
      });

      it('returns activity index and active status when procedure is found and activity does not exist', async () => {
        (ProcedureModel.findOne as Mock).mockResolvedValue(true);
        (ActivityModel.findOne as Mock).mockResolvedValue(null);
        (ActivityModel.create as Mock).mockResolvedValue(true);
        (ActivityModel.find as Mock).mockImplementation(() => ({ count: () => 10 }));

        const result = await ActivityApi.Mutation.increaseActivity(
          null,
          { procedureId: '123' },
          { ProcedureModel, ActivityModel, device: {}, phone: {} } as any,
          {} as any,
        );

        expect(result).toEqual({ activityIndex: 10, active: true });
      });

      it('throws an error when procedure is not found', async () => {
        (ProcedureModel.findOne as Mock).mockResolvedValue(null);

        await expect(
          ActivityApi.Mutation.increaseActivity(
            null,
            { procedureId: '123' },
            { ProcedureModel, ActivityModel, device: {}, phone: {} } as any,
            {} as any,
          ),
        ).rejects.toThrow('Procedure not found');
      });
    });
  });
});
