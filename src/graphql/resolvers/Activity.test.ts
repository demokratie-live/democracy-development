import { ProcedureModel, ActivityModel } from '@democracy-deutschland/democracy-common'; // Assuming these are the correct imports
import ActivityApi from './Activity';

jest.mock('@democracy-deutschland/democracy-common', () => ({
  ProcedureModel: {
    findOne: jest.fn(),
  },
  ActivityModel: {
    find: jest.fn(),
    findOne: jest.fn(() => ({ count: jest.fn() })),
    create: jest.fn(),
  },
  testCronTime: jest.fn(),
}));

describe('ActivityApi', () => {
  describe('Query', () => {
    describe('activityIndex', () => {
      it('returns activity index when procedure is found', async () => {
        (ProcedureModel.findOne as jest.Mock).mockResolvedValue({ procedureId: '123' });
        (ActivityModel.find as jest.Mock).mockImplementation(() => ({ count: () => 10 }));

        const result = await ActivityApi.Query.activityIndex(
          null,
          { procedureId: '123' },
          { ProcedureModel, ActivityModel } as any,
          {} as any,
        );

        expect(result).toEqual({ activityIndex: 10, active: true });
      });

      it('returns null when procedure is not found', async () => {
        (ProcedureModel.findOne as jest.Mock).mockResolvedValue(null);

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
        (ProcedureModel.findOne as jest.Mock).mockResolvedValue(true);
        (ActivityModel.findOne as jest.Mock).mockResolvedValue(true);
        (ActivityModel.find as jest.Mock).mockImplementation(() => ({ count: () => 10 }));

        const result = await ActivityApi.Mutation.increaseActivity(
          null,
          { procedureId: '123' },
          { ProcedureModel, ActivityModel, phone: {}, device: {} } as any,
          {} as any,
        );

        expect(result).toEqual({ activityIndex: 10, active: true });
      });

      it('returns activity index and active status when procedure is found and activity does not exist', async () => {
        (ProcedureModel.findOne as jest.Mock).mockResolvedValue(true);
        (ActivityModel.findOne as jest.Mock).mockResolvedValue(null);
        (ActivityModel.create as jest.Mock).mockResolvedValue(true);
        (ActivityModel.find as jest.Mock).mockImplementation(() => ({ count: () => 10 }));

        const result = await ActivityApi.Mutation.increaseActivity(
          null,
          { procedureId: '123' },
          { ProcedureModel, ActivityModel, device: {}, phone: {} } as any,
          {} as any,
        );

        expect(result).toEqual({ activityIndex: 10, active: true });
      });

      it('throws an error when procedure is not found', async () => {
        (ProcedureModel.findOne as jest.Mock).mockResolvedValue(null);

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
