import { describe, expect, it } from 'vitest';

import {
  applyFilters,
  daysSince,
  EMPTY_FILTERS,
  formatDate,
  groupByWeek,
  hasEntryWithoutYes,
  hasVoteData,
  isoWeek,
  nextSort,
  parseListQuery,
  sortProcedures,
  statusOptions,
  toListQuery,
  DEFAULT_LIST_STATE,
  type TodoProcedure,
} from '../todo';

const p = (procedureId: string, voteDate: string | null, extra: Partial<TodoProcedure> = {}): TodoProcedure => ({
  procedureId,
  title: `Vorgang ${procedureId}`,
  voteDate,
  ...extra,
});

describe('dates in Berlin time', () => {
  it('puts a vote just after midnight Berlin into the new week, not the UTC one', () => {
    // Sunday 23:30 UTC is Monday 00:30 in Berlin
    expect(isoWeek('2026-11-08T23:30:00.000Z')).toEqual({ year: 2026, week: 46 });
    expect(formatDate('2026-11-08T23:30:00.000Z')).toBe('9.11.2026');
  });

  it('follows ISO weeks across the year boundary', () => {
    expect(isoWeek('2027-01-01T10:00:00.000Z')).toEqual({ year: 2026, week: 53 });
    expect(isoWeek('2026-01-01T10:00:00.000Z')).toEqual({ year: 2026, week: 1 });
  });

  it('counts calendar days, not 24-hour blocks', () => {
    expect(daysSince('2026-11-13T21:00:00.000Z', new Date('2026-11-14T08:00:00.000Z'))).toBe(1);
    expect(daysSince('2026-11-14T06:00:00.000Z', new Date('2026-11-14T20:00:00.000Z'))).toBe(0);
  });
});

describe('groupByWeek', () => {
  it('lists the newest week first, the latest vote first and undated procedures last', () => {
    const weeks = groupByWeek([
      p('1', '2026-11-06T10:00:00.000Z'),
      p('2', null),
      p('3', '2026-11-12T10:00:00.000Z'),
      p('4', '2026-11-13T10:00:00.000Z'),
    ]);
    expect(weeks.map((w) => [w.label, w.procedures.map((x) => x.procedureId)])).toEqual([
      ['KW 46 · 12.–13.11.2026', ['4', '3']],
      ['KW 45 · 6.11.2026', ['1']],
      ['Ohne Abstimmungsdatum', ['2']],
    ]);
  });

  it('shows the full dates when a week spans two months', () => {
    const [week] = groupByWeek([p('1', '2026-11-30T10:00:00.000Z'), p('2', '2026-12-02T10:00:00.000Z')]);
    expect(week.label).toBe('KW 49 · 30.11.2026 – 2.12.2026');
  });
});

describe('filters', () => {
  const list = [
    p('1', null, { title: 'Jahressteuergesetz', currentStatus: 'Verabschiedet' }),
    p('2', null, { namedVote: true, currentStatus: 'Abgelehnt' }),
    p('3', null, { customData: { voteResults: { yes: 0, no: 543, abstination: 85 } } }),
    p('4', null, { customData: null }),
  ];

  it('keeps the old rule for "Daten" and does not break on missing customData', () => {
    expect(list.map(hasVoteData)).toEqual([false, true, true, false]);
    expect(applyFilters(list, { ...EMPTY_FILTERS, data: 'false' }).map((x) => x.procedureId)).toEqual(['1', '4']);
  });

  it('marks an entered result without yes votes, which the server keeps open', () => {
    expect(list.map(hasEntryWithoutYes)).toEqual([false, false, true, false]);
  });

  it('searches title and ID, and filters named votes and status', () => {
    expect(applyFilters(list, { ...EMPTY_FILTERS, search: ' steuer ' }).map((x) => x.procedureId)).toEqual(['1']);
    expect(applyFilters(list, { ...EMPTY_FILTERS, search: '3' }).map((x) => x.procedureId)).toEqual(['3']);
    expect(applyFilters(list, { ...EMPTY_FILTERS, named: 'true' }).map((x) => x.procedureId)).toEqual(['2']);
    expect(applyFilters(list, { ...EMPTY_FILTERS, statuses: ['Abgelehnt'] }).map((x) => x.procedureId)).toEqual(['2']);
  });

  it('filters several statuses at once', () => {
    expect(
      applyFilters(list, { ...EMPTY_FILTERS, statuses: ['Abgelehnt', 'Verabschiedet'] }).map((x) => x.procedureId),
    ).toEqual(['1', '2']);
  });

  it('orders statuses like the parliamentary process, unknown ones last', () => {
    expect(
      statusOptions([
        p('1', null, { currentStatus: 'Verabschiedet' }),
        p('2', null, { currentStatus: 'Zz unbekannt' }),
        p('3', null, { currentStatus: 'Überwiesen' }),
        p('4', null, { currentStatus: 'Verabschiedet' }),
      ]),
    ).toEqual(['Überwiesen', 'Verabschiedet', 'Zz unbekannt']);
  });

  it('puts "Dem Bundestag zugeleitet" first and "Dem Bundesrat zugeleitet" after "Verabschiedet"', () => {
    expect(
      statusOptions([
        p('1', null, { currentStatus: 'Verkündet' }),
        p('2', null, { currentStatus: 'Dem Bundesrat zugeleitet - Noch nicht beraten' }),
        p('3', null, { currentStatus: 'Noch nicht beraten' }),
        p('4', null, { currentStatus: 'Dem Bundestag zugeleitet - Noch nicht beraten' }),
        p('5', null, { currentStatus: 'Verabschiedet' }),
      ]),
    ).toEqual([
      'Dem Bundestag zugeleitet - Noch nicht beraten',
      'Noch nicht beraten',
      'Verabschiedet',
      'Dem Bundesrat zugeleitet - Noch nicht beraten',
      'Verkündet',
    ]);
  });

  it('keeps a selected status as an option even when no procedure has it', () => {
    expect(statusOptions([p('1', null, { currentStatus: 'Abgelehnt' })], ['Verkündet'])).toEqual([
      'Abgelehnt',
      'Verkündet',
    ]);
  });
});

describe('sorting', () => {
  const list = [
    p('9', '2026-11-12T10:00:00.000Z', { title: 'Zollgesetz', currentStatus: 'Überwiesen' }),
    p('10', '2026-11-06T10:00:00.000Z', { title: 'Abfallgesetz', currentStatus: 'Verkündet' }),
    p('11', null, { title: 'Ölgesetz', currentStatus: 'Zz unbekannt' }),
    p('12', '2026-11-13T10:00:00.000Z', { title: 'Mietrecht', currentStatus: null }),
    p('13', '2026-11-13T10:00:00.000Z', { title: 'Bahngesetz', currentStatus: 'Überwiesen' }),
  ];
  const ids = (sort: Parameters<typeof sortProcedures>[1]) => sortProcedures(list, sort).map((x) => x.procedureId);

  it('sorts by status in process order, unknown and missing last in both directions', () => {
    // ties (9 and 13) keep the latest vote first
    expect(ids({ key: 'status', dir: 'asc' })).toEqual(['13', '9', '10', '11', '12']);
    expect(ids({ key: 'status', dir: 'desc' })).toEqual(['10', '13', '9', '11', '12']);
  });

  it('sorts IDs as numbers and titles in German order', () => {
    expect(ids({ key: 'id', dir: 'asc' })).toEqual(['9', '10', '11', '12', '13']);
    expect(ids({ key: 'title', dir: 'asc' })).toEqual(['10', '13', '12', '11', '9']);
  });

  it('keeps procedures without a date last, also oldest first', () => {
    expect(ids({ key: 'date', dir: 'asc' })).toEqual(['10', '9', '12', '13', '11']);
    expect(ids({ key: 'date', dir: 'desc' })).toEqual(['12', '13', '9', '10', '11']);
  });

  it('flips the active column and starts others with their usual direction', () => {
    expect(nextSort({ key: 'date', dir: 'desc' }, 'status')).toEqual({ key: 'status', dir: 'desc' });
    expect(nextSort({ key: 'status', dir: 'desc' }, 'status')).toEqual({ key: 'status', dir: 'asc' });
    expect(nextSort({ key: 'status', dir: 'asc' }, 'title')).toEqual({ key: 'title', dir: 'asc' });
  });

  it('groups by week oldest first when the date is sorted ascending', () => {
    const weeks = groupByWeek(list, 'asc');
    expect(weeks.map((w) => [w.label, w.procedures.map((x) => x.procedureId)])).toEqual([
      ['KW 45 · 6.11.2026', ['10']],
      ['KW 46 · 12.–13.11.2026', ['9', '12', '13']],
      ['Ohne Abstimmungsdatum', ['11']],
    ]);
  });
});

describe('list state in the URL', () => {
  it('leaves the plain list without a query', () => {
    expect(toListQuery(DEFAULT_LIST_STATE)).toEqual({});
    expect(parseListQuery({})).toEqual(DEFAULT_LIST_STATE);
  });

  it('round-trips period, filters and sorting', () => {
    const state = {
      period: 20,
      filters: {
        search: 'steuer',
        statuses: ['Verkündet', 'Überwiesen'],
        named: 'false' as const,
        data: 'false' as const,
      },
      sort: { key: 'status' as const, dir: 'desc' as const },
    };
    const query = toListQuery(state);
    expect(query).toEqual({
      wp: '20',
      q: 'steuer',
      status: ['Verkündet', 'Überwiesen'],
      named: 'false',
      data: 'false',
      sort: 'status',
      dir: 'desc',
    });
    expect(parseListQuery(query)).toEqual(state);
  });

  it('reads a single status and falls back on unknown values', () => {
    expect(parseListQuery({ wp: '7', status: 'Verkündet', named: 'ja', sort: 'votes', dir: 'up', id: '1' })).toEqual({
      ...DEFAULT_LIST_STATE,
      filters: { ...EMPTY_FILTERS, statuses: ['Verkündet'] },
    });
    expect(parseListQuery({ sort: 'title' }).sort).toEqual({ key: 'title', dir: 'asc' });
  });
});
