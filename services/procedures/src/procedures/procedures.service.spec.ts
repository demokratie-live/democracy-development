import { Test, TestingModule } from '@nestjs/testing';
import { ProceduresService } from './procedures.service';
import { ProcedureModel } from '@democracy-deutschland/bundestagio-common';

describe('ProceduresService', () => {
  let service: ProceduresService;
  let procedureModel: Partial<typeof ProcedureModel>;

  beforeEach(async () => {
    procedureModel = {
      find: jest.fn().mockReturnValue([
        [
          {
            title: 'test',
            id: 1,
            type: '',
            period: '',
            importantDocuments: [],
          },
        ],
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProceduresService,
        { provide: 'ProcedureModel', useValue: procedureModel },
      ],
    }).compile();

    service = module.get<ProceduresService>(ProceduresService);
    // jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an array of procedures', () => {
    expect(service.findAll()).resolves.toStrictEqual([
      {
        title: 'test',
        id: 1,
        type: '',
        period: '',
        importantDocuments: [],
      },
    ]);
  });

  it('should return an array of upcoming procedures', () => {
    (procedureModel.find as jest.Mock).mockReturnValueOnce({
      sort: jest.fn().mockReturnValueOnce({
        limit: jest.fn().mockResolvedValue([
          {
            title: 'test',
            id: 1,
            type: '',
            period: '',
            importantDocuments: [],
          },
        ]),
      }),
    });

    expect(service.fetchUpcomingProcedures()).resolves.toStrictEqual([
      {
        title: 'test',
        id: 1,
        type: '',
        period: '',
        importantDocuments: [],
      },
    ]);
  });

  it('should return an array of past procedures', () => {
    (procedureModel.find as jest.Mock).mockReturnValueOnce({
      sort: jest.fn().mockReturnValueOnce({
        limit: jest.fn().mockResolvedValue([
          {
            title: 'test',
            id: 1,
            type: '',
            period: '',
            importantDocuments: [],
          },
        ]),
      }),
    });

    expect(service.fetchPastProcedures()).resolves.toStrictEqual([
      {
        title: 'test',
        id: 1,
        type: '',
        period: '',
        importantDocuments: [],
      },
    ]);
  });
});
