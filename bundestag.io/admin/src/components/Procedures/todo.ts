/**
 * Grouping, filtering and sorting of the to-do list. The server already returns only open
 * procedures (manageVoteDate: vote date reached, no yes votes, not closed), so
 * everything here works on the full list in the browser.
 */
import { PROCEDURE as PROCEDURE_DEFINITIONS } from '@democracy-deutschland/bundestag.io-definitions';

export type TodoProcedure = {
  procedureId: string;
  title: string;
  type?: string | null;
  period?: number | null;
  currentStatus?: string | null;
  namedVote?: boolean | null;
  voteDate?: string | null;
  customData?: { voteResults?: { yes?: number | null; no?: number | null; abstination?: number | null } | null } | null;
};

export type TodoFilters = {
  search: string;
  statuses: string[];
  named: '' | 'true' | 'false';
  data: '' | 'true' | 'false';
};

export const EMPTY_FILTERS: TodoFilters = { search: '', statuses: [], named: '', data: '' };

export const hasActiveFilters = (f: TodoFilters) =>
  f.search !== '' || f.statuses.length > 0 || f.named !== '' || f.data !== '';

// order of the parliamentary process, used by the filter and the sorting
const STATUS_ORDER: string[] = [
  // a bill of the Länder reaching the Bundestag: the earliest state
  PROCEDURE_DEFINITIONS.STATUS.ZUGELEITET,
  PROCEDURE_DEFINITIONS.STATUS.NICHT_BERATEN,
  PROCEDURE_DEFINITIONS.STATUS.UEBERWIESEN,
  PROCEDURE_DEFINITIONS.STATUS.BESCHLUSSEMPFEHLUNG,
  PROCEDURE_DEFINITIONS.STATUS.ABGELEHNT,
  PROCEDURE_DEFINITIONS.STATUS.ANGENOMMEN,
  PROCEDURE_DEFINITIONS.STATUS.VERABSCHIEDET,
  // passed by the Bundestag and sent on to the Bundesrat
  PROCEDURE_DEFINITIONS.STATUS.BR_ZUGELEITET_NICHT_BERATEN,
  PROCEDURE_DEFINITIONS.STATUS.BR_VERMITTLUNGSAUSSCHUSS_NICHT_ANGERUFEN,
  PROCEDURE_DEFINITIONS.STATUS.VERMITTLUNGSVERFAHREN,
  PROCEDURE_DEFINITIONS.STATUS.BR_ZUGESTIMMT,
  PROCEDURE_DEFINITIONS.STATUS.VERKUENDET,
];

/** Process order; statuses not in the list come after it, alphabetically. */
export const compareStatus = (a: string, b: string) => {
  const ia = STATUS_ORDER.indexOf(a);
  const ib = STATUS_ORDER.indexOf(b);
  if (ia === -1 || ib === -1) return ia === ib ? a.localeCompare(b, 'de') : ia === -1 ? 1 : -1;
  return ia - ib;
};

const votes = (p: TodoProcedure) => p.customData?.voteResults ?? {};

/** Same rule as the old "Daten" column: named vote or any count entered. */
export const hasVoteData = (p: TodoProcedure) => {
  const { yes, no, abstination } = votes(p);
  return Boolean(p.namedVote) || (yes ?? 0) > 0 || (no ?? 0) > 0 || (abstination ?? 0) > 0;
};

/**
 * Something was entered, but the server still lists it because nobody voted yes
 * (it only checks yes < 1). Shown so the editor sees why it is still here.
 */
export const hasEntryWithoutYes = (p: TodoProcedure) => {
  const { no, abstination } = votes(p);
  return !p.namedVote && ((no ?? 0) > 0 || (abstination ?? 0) > 0);
};

/** Statuses on the list plus the selected ones, so a selection never disappears. */
export const statusOptions = (procedures: TodoProcedure[], selected: string[] = []) =>
  Array.from(
    new Set([...procedures.map((p) => p.currentStatus), ...selected].filter((s): s is string => Boolean(s))),
  ).sort(compareStatus);

export const applyFilters = (procedures: TodoProcedure[], f: TodoFilters) => {
  const search = f.search.trim().toLowerCase();
  return procedures.filter((p) => {
    if (search && !`${p.title} ${p.procedureId}`.toLowerCase().includes(search)) return false;
    if (f.statuses.length && !f.statuses.includes(p.currentStatus ?? '')) return false;
    if (f.named && Boolean(p.namedVote) !== (f.named === 'true')) return false;
    if (f.data && hasVoteData(p) !== (f.data === 'true')) return false;
    return true;
  });
};

// --- sorting ----------------------------------------------------------------------

export type SortKey = 'date' | 'id' | 'title' | 'status';
export type SortDir = 'asc' | 'desc';
export type TodoSort = { key: SortKey; dir: SortDir };

export const SORT_KEYS: SortKey[] = ['date', 'id', 'title', 'status'];
export const DEFAULT_SORT: TodoSort = { key: 'date', dir: 'desc' };

// first click: newest vote and latest status first, as the editors work through them
const FIRST_DIR: Record<SortKey, SortDir> = { date: 'desc', id: 'asc', title: 'asc', status: 'desc' };

/** Clicking the active column flips it, another column starts with its usual direction. */
export const nextSort = (current: TodoSort, key: SortKey): TodoSort =>
  current.key === key ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: FIRST_DIR[key] };

/** Week groups only make sense while the list is ordered by date. */
export const isGroupedByWeek = (sort: TodoSort) => sort.key === 'date';

const voteTime = (p: TodoProcedure) => (p.voteDate ? Date.parse(p.voteDate) : null);

// missing values go last in both directions
const missingLast = <T>(a: T | null | undefined, b: T | null | undefined, compare: (a: T, b: T) => number) => {
  if (a == null || a === '') return b == null || b === '' ? 0 : 1;
  if (b == null || b === '') return -1;
  return compare(a, b);
};

const COMPARE: Record<SortKey, (a: TodoProcedure, b: TodoProcedure, sign: number) => number> = {
  date: (a, b, sign) => missingLast(voteTime(a), voteTime(b), (x, y) => sign * (x - y)),
  id: (a, b, sign) => sign * a.procedureId.localeCompare(b.procedureId, undefined, { numeric: true }),
  title: (a, b, sign) => sign * a.title.localeCompare(b.title, 'de'),
  status: (a, b, sign) =>
    missingLast(a.currentStatus, b.currentStatus, (x, y) => {
      // statuses outside the process order stay after it in both directions
      const known = Number(STATUS_ORDER.includes(y)) - Number(STATUS_ORDER.includes(x));
      return known || (STATUS_ORDER.includes(x) ? sign : 1) * compareStatus(x, y);
    }),
};

export const sortProcedures = (procedures: TodoProcedure[], sort: TodoSort) => {
  const sign = sort.dir === 'asc' ? 1 : -1;
  return [...procedures].sort(
    (a, b) =>
      COMPARE[sort.key](a, b, sign) ||
      // ties: latest vote first, then by ID
      COMPARE.date(a, b, -1) ||
      COMPARE.id(a, b, 1),
  );
};

// --- list state in the URL ----------------------------------------------------------

export const PERIODS = [21, 20, 19];
export const DEFAULT_PERIOD = 21;

export type ListState = { period: number; filters: TodoFilters; sort: TodoSort };
export const DEFAULT_LIST_STATE: ListState = { period: DEFAULT_PERIOD, filters: EMPTY_FILTERS, sort: DEFAULT_SORT };

type Query = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const many = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
const boolParam = (v: string | undefined): '' | 'true' | 'false' => (v === 'true' || v === 'false' ? v : '');

/** Reads the list state from the query; anything unknown falls back to the default. */
export const parseListQuery = (query: Query): ListState => {
  const period = Number(one(query.wp));
  const key = one(query.sort) as SortKey;
  const dir = one(query.dir);
  const sortKey = SORT_KEYS.includes(key) ? key : DEFAULT_SORT.key;
  return {
    period: PERIODS.includes(period) ? period : DEFAULT_PERIOD,
    filters: {
      search: one(query.q) ?? '',
      statuses: Array.from(new Set(many(query.status).filter(Boolean))),
      named: boolParam(one(query.named)),
      data: boolParam(one(query.data)),
    },
    sort: {
      key: sortKey,
      dir: dir === 'asc' || dir === 'desc' ? dir : SORT_KEYS.includes(key) ? FIRST_DIR[key] : DEFAULT_SORT.dir,
    },
  };
};

/** The query for a state, without defaults, so the plain list stays /procedures. */
export const toListQuery = ({ period, filters, sort }: ListState): Record<string, string | string[]> => {
  const query: Record<string, string | string[]> = {};
  if (period !== DEFAULT_PERIOD) query.wp = String(period);
  if (filters.search) query.q = filters.search;
  if (filters.statuses.length) query.status = filters.statuses;
  if (filters.named) query.named = filters.named;
  if (filters.data) query.data = filters.data;
  if (sort.key !== DEFAULT_SORT.key || sort.dir !== DEFAULT_SORT.dir) {
    query.sort = sort.key;
    query.dir = sort.dir;
  }
  return query;
};

// --- dates in Berlin time -------------------------------------------------------

const berlinParts = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Berlin',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Calendar day in Berlin as UTC midnight, so date math ignores the time zone. */
const berlinDay = (iso: string) => {
  const [y, m, d] = berlinParts.format(new Date(iso)).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

export const isoWeek = (iso: string) => {
  const day = berlinDay(iso);
  // ISO 8601: the week belongs to the year of its Thursday
  const weekday = day.getUTCDay() || 7;
  day.setUTCDate(day.getUTCDate() + 4 - weekday);
  const yearStart = Date.UTC(day.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((day.getTime() - yearStart) / 86400000 + 1) / 7);
  return { year: day.getUTCFullYear(), week };
};

export const formatDate = (iso: string) => {
  const day = berlinDay(iso);
  return `${day.getUTCDate()}.${day.getUTCMonth() + 1}.${day.getUTCFullYear()}`;
};

const formatRange = (from: string, to: string) => {
  const a = berlinDay(from);
  const b = berlinDay(to);
  if (a.getTime() === b.getTime()) return formatDate(from);
  if (a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth()) {
    return `${a.getUTCDate()}.–${formatDate(to)}`;
  }
  return `${formatDate(from)} – ${formatDate(to)}`;
};

/** Whole days between the vote and now, in Berlin calendar days. */
export const daysSince = (iso: string, now = new Date()) =>
  Math.round((berlinDay(now.toISOString()).getTime() - berlinDay(iso).getTime()) / 86400000);

export type TodoWeek = { key: string; label: string; procedures: TodoProcedure[] };

/**
 * Groups by calendar week of the vote date, newest week first by default and, within
 * a week, in the same direction. Procedures without a date come last.
 */
export const groupByWeek = (procedures: TodoProcedure[], dir: SortDir = 'desc'): TodoWeek[] => {
  const sorted = sortProcedures(procedures, { key: 'date', dir });

  const weeks: TodoWeek[] = [];
  for (const p of sorted) {
    let key = 'none';
    if (p.voteDate) {
      const { year, week } = isoWeek(p.voteDate);
      key = `${year}-W${String(week).padStart(2, '0')}`;
    }
    const last = weeks.at(-1);
    if (last?.key === key) last.procedures.push(p);
    else weeks.push({ key, label: '', procedures: [p] });
  }

  for (const w of weeks) {
    if (w.key === 'none') {
      w.label = 'Ohne Abstimmungsdatum';
      continue;
    }
    const dates = w.procedures.map((p) => p.voteDate as string);
    const [earliest, latest] = dir === 'desc' ? [dates.at(-1), dates[0]] : [dates[0], dates.at(-1)];
    w.label = `KW ${Number(w.key.slice(-2))} · ${formatRange(earliest as string, latest as string)}`;
  }
  return weeks;
};
