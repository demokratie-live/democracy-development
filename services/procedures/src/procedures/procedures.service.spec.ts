import { Test, TestingModule } from '@nestjs/testing';
import { ProceduresService } from './procedures.service';
import { ProcedureModel } from '@democracy-deutschland/bundestagio-common';

describe('ProceduresService', () => {
  let service: ProceduresService;
  const procedureModel: Partial<typeof ProcedureModel> = {
    find: jest.fn(
      () =>
        [
          {
            title: 'test',
            id: 1,
            type: '',
            period: '',
            importantDocuments: [],
          },
        ] as any,
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProceduresService,
        { provide: 'ProcedureModel', useValue: procedureModel },
      ],
    }).compile();

    service = module.get<ProceduresService>(ProceduresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an array of procedures', () => {
    expect(service.findAll()).resolves.toStrictEqual({
      title: 'test',
      id: 1,
      type: '',
      period: '',
      importantDocuments: [],
    });
  });
});
