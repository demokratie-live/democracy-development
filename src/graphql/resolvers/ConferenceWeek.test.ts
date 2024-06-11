import { getCurrentConferenceWeek } from '../../data/conference-weeks';
import ConferenceWeekApi from './ConferenceWeek';
import { logger } from '../../services/logger';

jest.mock('../../data/conference-weeks');
jest.mock('../../services/logger');

describe('ConferenceWeekApi', () => {
  it('should return the current conference week', async () => {
    const mockConferenceWeek = {
      calendarWeek: 1,
      start: new Date(),
      end: new Date(),
    };

    (getCurrentConferenceWeek as jest.Mock).mockReturnValue(mockConferenceWeek);
    (logger.graphql as jest.Mock).mockReturnValue(null);

    const result = await ConferenceWeekApi.Query.currentConferenceWeek(null, null, null, null);

    expect(result).toEqual(mockConferenceWeek);
    expect(getCurrentConferenceWeek).toHaveBeenCalled();
    expect(logger.graphql).toHaveBeenCalledWith('ConferenceWeek.query.currentConferenceWeek');
  });
});