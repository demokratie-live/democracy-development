import { Test, TestingModule } from '@nestjs/testing';
import { ProceduresService } from './procedures.service';
import { ProcedureModel } from '@democracy-deutschland/bundestagio-common';

describe('ProceduresService', () => {
  let service: ProceduresService;
  let procedureModel: Partial<typeof ProcedureModel>;

  beforeEach(async () => {
    const mockResult = [
      {
        title: 'test',
        id: 1,
        type: '',
        period: '',
        importantDocuments: [],
      },
    ];

    // Mock the chain of .find().sort().skip().limit()
    const mockLimit = jest.fn().mockResolvedValue(mockResult);
    const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockFind = jest.fn().mockReturnValue({ skip: mockSkip });

    procedureModel = {
      find: jest.fn().mockImplementation(mockFind),
      countDocuments: jest.fn().mockResolvedValue(1),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProceduresService,
        { provide: 'ProcedureModel', useValue: procedureModel },
      ],
    }).compile();

    service = module.get<ProceduresService>(ProceduresService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an array of procedures', () => {
    expect(
      service.findAll({
        page: 1,
        limit: 1,
      }),
    ).resolves.toStrictEqual({
      procedures: [
        {
          title: 'test',
          id: 1,
          type: '',
          period: '',
          importantDocuments: [],
        },
      ],
      count: 1,
    });
  });

  it('should return an array of upcoming procedures', () => {
    const mockResult = [
      {
        title: 'test',
        id: 1,
        type: '',
        period: '',
        importantDocuments: [],
      },
    ];

    // Mock the chain of .find().sort().skip().limit()
    const mockLimit = jest.fn().mockResolvedValue(mockResult);
    const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
    const mockFind = jest.fn().mockReturnValue({ sort: mockSort });

    // Assign the mock to procedureModel.find
    (procedureModel.find as jest.Mock).mockImplementation(mockFind);

    expect(
      service.fetchUpcomingProcedures({
        page: 1,
        limit: 1,
      }),
    ).resolves.toStrictEqual({
      procedures: [
        {
          title: 'test',
          id: 1,
          type: '',
          period: '',
          importantDocuments: [],
        },
      ],
      count: 1,
    });
  });

  it('should return an array of past procedures', async () => {
    const mockResult = [
      {
        title: 'test',
        id: 1,
        type: '',
        period: '',
        importantDocuments: [],
      },
    ];

    // Mock the chain of .find().sort().skip().limit()
    const mockLimit = jest.fn().mockResolvedValue(mockResult);
    const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
    const mockFind = jest.fn().mockReturnValue({ sort: mockSort });

    // Assign the mock to procedureModel.find
    (procedureModel.find as jest.Mock).mockImplementation(mockFind);

    await expect(
      service.fetchPastProcedures({
        page: 1,
        limit: 1,
      }),
    ).resolves.toStrictEqual({
      procedures: [
        {
          title: 'test',
          id: 1,
          type: '',
          period: '',
          importantDocuments: [],
        },
      ],
      count: 1,
    });
  });
});
