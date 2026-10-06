import { getCron, setCronStart, setCronSuccess, ICronJob } from '@democracy-deutschland/bundestagio-common';
import importProcedures from './import-procedures/import-procedures';
import { handleCronJob } from './cronJob';
import { CONFIG } from './config';
import { Logger } from './logger';

jest.mock('@democracy-deutschland/bundestagio-common', () => ({
  getCron: jest.fn(),
  setCronStart: jest.fn(),
  setCronSuccess: jest.fn(),
}));
jest.mock('./import-procedures/import-procedures', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockGetCron = getCron as jest.MockedFunction<typeof getCron>;
const mockSetCronStart = setCronStart as jest.MockedFunction<typeof setCronStart>;
const mockSetCronSuccess = setCronSuccess as jest.MockedFunction<typeof setCronSuccess>;
const mockImportProcedures = importProcedures as jest.MockedFunction<typeof importProcedures>;

const RUN_START = new Date('2026-10-04T01:00:05.000Z');
const PREVIOUS_START = new Date('2026-10-03T01:00:29.000Z');
const PREVIOUS_SUCCESS_START = new Date('2026-10-02T01:00:29.000Z');

const config = (overrides: Partial<typeof CONFIG> = {}): typeof CONFIG => ({
  ...CONFIG,
  IMPORT_PROCEDURES_FILTER_AFTER: '2021-09-26',
  IMPORT_PROCEDURES_IGNORE_LAST_RUN: false,
  ...overrides,
});

const cronEntry = (entry: Partial<ICronJob>) => entry as Awaited<ReturnType<typeof getCron>>;

const logger: Logger = { info: jest.fn(), debug: jest.fn(), error: jest.fn() };

const filterAfterOfImport = () => mockImportProcedures.mock.calls[0][0].IMPORT_PROCEDURES_FILTER_AFTER;
const savedSuccessStartDate = () => mockSetCronSuccess.mock.calls[0][0].successStartDate;

describe('handleCronJob', () => {
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers({ now: RUN_START });
    exitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${code})`);
    });
    // DIP is queried long after the start of the run.
    mockImportProcedures.mockImplementation(async () => {
      jest.setSystemTime(new Date(RUN_START.getTime() + 8 * 60 * 60 * 1000));
    });
  });

  afterEach(() => {
    exitSpy.mockRestore();
    jest.useRealTimers();
  });

  it('filters from the last successful run (with overlap) and saves the start of its own run', async () => {
    mockGetCron.mockResolvedValue(cronEntry({ lastStartDate: PREVIOUS_START, lastSuccessStartDate: PREVIOUS_START }));

    await handleCronJob(config(), logger);

    expect(filterAfterOfImport()).toBe('2026-10-03T00:00:29.000Z');
    expect(mockSetCronStart).toHaveBeenCalledWith(expect.objectContaining({ startDate: RUN_START }));
    expect(savedSuccessStartDate()).toEqual(RUN_START);
  });

  it('uses IMPORT_PROCEDURES_FILTER_AFTER on the first run and saves the start of its own run', async () => {
    mockGetCron.mockResolvedValue(cronEntry({ lastStartDate: null!, lastSuccessStartDate: null! }));

    await handleCronJob(config(), logger);

    expect(filterAfterOfImport()).toBe('2021-09-26');
    expect(savedSuccessStartDate()).toEqual(RUN_START);
  });

  it('uses IMPORT_PROCEDURES_FILTER_AFTER after a failed previous run without success', async () => {
    mockGetCron.mockResolvedValue(cronEntry({ lastStartDate: PREVIOUS_START, lastSuccessStartDate: null! }));

    await handleCronJob(config(), logger);

    expect(filterAfterOfImport()).toBe('2021-09-26');
    expect(savedSuccessStartDate()).toEqual(RUN_START);
  });

  it('ignores the last successful run with IMPORT_PROCEDURES_IGNORE_LAST_RUN and saves the start of its own run', async () => {
    mockGetCron.mockResolvedValue(
      cronEntry({ lastStartDate: PREVIOUS_START, lastSuccessStartDate: PREVIOUS_SUCCESS_START }),
    );

    await handleCronJob(config({ IMPORT_PROCEDURES_IGNORE_LAST_RUN: true }), logger);

    expect(filterAfterOfImport()).toBe('2021-09-26');
    expect(savedSuccessStartDate()).toEqual(RUN_START);
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('IMPORT_PROCEDURES_IGNORE_LAST_RUN'));
  });

  it('does not touch lastSuccessStartDate when the import fails', async () => {
    mockGetCron.mockResolvedValue(
      cronEntry({ lastStartDate: PREVIOUS_START, lastSuccessStartDate: PREVIOUS_SUCCESS_START }),
    );
    mockImportProcedures.mockRejectedValue(new Error('socket hang up'));

    await expect(handleCronJob(config(), logger)).rejects.toThrow('process.exit(1)');

    expect(mockSetCronSuccess).not.toHaveBeenCalled();
  });
});
