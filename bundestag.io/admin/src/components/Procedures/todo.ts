/**
 * Grouping and filtering of the to-do list. The server already returns only open
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
  status: string;
  named: '' | 'true' | 'false';
  data: '' | 'true' | 'false';
};

export const EMPTY_FILTERS: TodoFilters = { search: '', status: '', named: '', data: '' };

// order of the statuses in the filter, as in the old list
const STATUS_ORDER: string[] = [
  PROCEDURE_DEFINITIONS.STATUS.NICHT_BERATEN,
  PROCEDURE_DEFINITIONS.STATUS.UEBERWIESEN,
  PROCEDURE_DEFINITIONS.STATUS.BESCHLUSSEMPFEHLUNG,
  PROCEDURE_DEFINITIONS.STATUS.ABGELEHNT,
  PROCEDURE_DEFINITIONS.STATUS.ANGENOMMEN,
  PROCEDURE_DEFINITIONS.STATUS.VERABSCHIEDET,
  PROCEDURE_DEFINITIONS.STATUS.BR_VERMITTLUNGSAUSSCHUSS_NICHT_ANGERUFEN,
  PROCEDURE_DEFINITIONS.STATUS.VERMITTLUNGSVERFAHREN,
  PROCEDURE_DEFINITIONS.STATUS.BR_ZUGESTIMMT,
  PROCEDURE_DEFINITIONS.STATUS.VERKUENDET,
];

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

export const statusOptions = (procedures: TodoProcedure[]) =>
  Array.from(new Set(procedures.map((p) => p.currentStatus).filter((s): s is string => Boolean(s)))).sort((a, b) => {
    const ia = STATUS_ORDER.indexOf(a);
    const ib = STATUS_ORDER.indexOf(b);
    // unknown statuses go last, alphabetically
    if (ia === -1 || ib === -1) return ia === ib ? a.localeCompare(b) : ia === -1 ? 1 : -1;
    return ia - ib;
  });

export const applyFilters = (procedures: TodoProcedure[], f: TodoFilters) => {
  const search = f.search.trim().toLowerCase();
  return procedures.filter((p) => {
    if (search && !`${p.title} ${p.procedureId}`.toLowerCase().includes(search)) return false;
    if (f.status && p.currentStatus !== f.status) return false;
    if (f.named && Boolean(p.namedVote) !== (f.named === 'true')) return false;
    if (f.data && hasVoteData(p) !== (f.data === 'true')) return false;
    return true;
  });
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
 * Groups by calendar week of the vote date. Newest week first and, within a
 * week, the latest vote first. Procedures without a date come last.
 */
export const groupByWeek = (procedures: TodoProcedure[]): TodoWeek[] => {
  const sorted = [...procedures].sort((a, b) => {
    const ta = a.voteDate ? Date.parse(a.voteDate) : -Infinity;
    const tb = b.voteDate ? Date.parse(b.voteDate) : -Infinity;
    return tb - ta || a.procedureId.localeCompare(b.procedureId);
  });

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
    const week = Number(w.key.slice(-2));
    // sorted newest first, so the range runs from the last to the first entry
    w.label = `KW ${week} · ${formatRange(dates.at(-1) as string, dates[0])}`;
  }
  return weeks;
};
