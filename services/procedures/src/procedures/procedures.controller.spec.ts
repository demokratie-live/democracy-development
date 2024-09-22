import { Test, TestingModule } from '@nestjs/testing';
import { ProceduresController } from './procedures.controller';
import { ProceduresService } from './procedures.service';

describe('ProceduresController', () => {
  let controller: ProceduresController;

  const mockProceduresService: Partial<
    jest.Mocked<Partial<ProceduresService>>
  > = {
    findAll: jest.fn(
      ({}: { page: number; limit: number }) =>
        ({
          procedures: [
            {
              title: 'test',
              id: 1,
              procedureId: '123456',
              type: '',
              period: '',
              importantDocuments: [],
            },
          ],
          count: 1,
        }) as any,
    ),
    fetchUpcomingProcedures: jest.fn(
      ({}: { page: number; limit: number }) =>
        ({
          procedures: [
            {
              title: 'test',
              id: 1,
              procedureId: '123456',
              type: '',
              period: '',
              importantDocuments: [],
            },
          ],
          count: 1,
        }) as any,
    ),
    fetchPastProcedures: jest.fn(
      ({}: { page: number; limit: number }) =>
        ({
          procedures: [
            {
              title: 'test',
              id: 1,
              procedureId: '123456',
              type: '',
              period: '',
              importantDocuments: [],
            },
          ],
          count: 1,
        }) as any,
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProceduresController],
      providers: [
        { provide: ProceduresService, useValue: mockProceduresService },
      ],
    }).compile();

    controller = module.get<ProceduresController>(ProceduresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an array of procedures', async () => {
    expect(
      controller.findAll({
        page: 1,
        limit: 1,
      }),
    ).toStrictEqual({
      procedures: [
        {
          title: 'test',
          id: 1,
          procedureId: '123456',
          type: '',
          period: '',
          importantDocuments: [],
        },
      ],
      count: 1,
    });
  });

  it('should return an array of upcoming procedures', async () => {
    expect(
      controller.upcomingProcedures({
        page: 1,
        limit: 1,
      }),
    ).toStrictEqual({
      procedures: [
        {
          title: 'test',
          id: 1,
          procedureId: '123456',
          type: '',
          period: '',
          importantDocuments: [],
        },
      ],
      count: 1,
    });
  });

  it('should return an array of past procedures', async () => {
    expect(
      controller.pastProcedures({
        page: 1,
        limit: 1,
      }),
    ).toStrictEqual({
      procedures: [
        {
          title: 'test',
          id: 1,
          procedureId: '123456',
          type: '',
          period: '',
          importantDocuments: [],
        },
      ],
      count: 1,
    });
  });
});
