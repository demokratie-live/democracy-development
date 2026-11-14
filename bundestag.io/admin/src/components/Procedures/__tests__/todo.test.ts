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
  statusOptions,
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
    expect(applyFilters(list, { ...EMPTY_FILTERS, status: 'Abgelehnt' }).map((x) => x.procedureId)).toEqual(['2']);
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
});
