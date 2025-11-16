import { vi, describe, it, expect, type Mock } from 'vitest';
import { getCurrentConferenceWeek } from '../../data/conference-weeks';
import ConferenceWeekApi from './ConferenceWeek';
import { logger } from '../../services/logger';

vi.mock('../../data/conference-weeks');
vi.mock('../../services/logger');

describe('ConferenceWeekApi', () => {
  it('should return the current conference week', async () => {
    const mockConferenceWeek = {
      calendarWeek: 1,
      start: new Date(),
      end: new Date(),
    };

    (getCurrentConferenceWeek as Mock).mockReturnValue(mockConferenceWeek);
    (logger.graphql as Mock).mockReturnValue(null);

    const result = await ConferenceWeekApi.Query.currentConferenceWeek(null, null, null, null);

    expect(result).toEqual(mockConferenceWeek);
    expect(getCurrentConferenceWeek).toHaveBeenCalled();
    expect(logger.graphql).toHaveBeenCalledWith('ConferenceWeek.query.currentConferenceWeek');
  });
});