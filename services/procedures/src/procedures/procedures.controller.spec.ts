import { Test, TestingModule } from '@nestjs/testing';
import { ProceduresController } from './procedures.controller';
import { ProceduresService } from './procedures.service';
import { IProcedure } from '@democracy-deutschland/bundestagio-common/dist/models/Procedure/schema';

describe('ProceduresController', () => {
  let controller: ProceduresController;

  const mockProceduresService: Partial<
    jest.Mocked<Partial<ProceduresService>>
  > = {
    findAll: jest.fn(
      () =>
        ({
          title: 'test',
          id: 1,
          procedureId: '123456',
          type: '',
          period: '',
          importantDocuments: [],
        }) as unknown as Promise<IProcedure & { _id: any }>,
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
    expect(controller.findAll()).toStrictEqual({
      title: 'test',
      id: 1,
      procedureId: '123456',
      type: '',
      period: '',
      importantDocuments: [],
    });
  });
});
