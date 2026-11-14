import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { AlertCircle, IdCard, Search } from 'lucide-react';

import PROCEDURE_LIST from '../../graphql/queries/procedureList';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  applyFilters,
  daysSince,
  EMPTY_FILTERS,
  formatDate,
  groupByWeek,
  hasEntryWithoutYes,
  statusOptions,
  type TodoFilters,
  type TodoProcedure,
} from './todo';

const PERIODS = [21, 20, 19];
// the whole to-do list is loaded at once, so filters see every entry
export const TODO_LIMIT = 500;

const Field: React.FC<{ label: string; htmlFor: string; children: React.ReactNode; className?: string }> = ({
  label,
  htmlFor,
  children,
  className,
}) => (
  <div className={className}>
    <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-muted-foreground">
      {label}
    </label>
    {children}
  </div>
);

const since = (voteDate: string) => {
  const days = daysSince(voteDate);
  if (days <= 0) return 'heute';
  if (days === 1) return 'seit gestern';
  return `seit ${days} Tagen`;
};

export const ProcedureList: React.FC = () => {
  const [period, setPeriod] = useState(21);
  const [filters, setFilters] = useState<TodoFilters>(EMPTY_FILTERS);
  const { data, loading, error } = useQuery(PROCEDURE_LIST, {
    variables: { period, manageVoteDate: true, limit: TODO_LIMIT, offset: 0 },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
  });

  const procedures: TodoProcedure[] = useMemo(() => data?.proceduresData.nodes ?? [], [data]);
  const totalCount: number = data?.proceduresData.totalCount ?? 0;
  const statuses = useMemo(() => statusOptions(procedures), [procedures]);
  const filtered = useMemo(() => applyFilters(procedures, filters), [procedures, filters]);
  const weeks = useMemo(() => groupByWeek(filtered), [filtered]);

  const set =
    <K extends keyof TodoFilters>(key: K) =>
    (value: TodoFilters[K]) =>
      setFilters((f) => ({ ...f, [key]: value }));
  const filtersActive = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Abstimmungen, deren Termin erreicht ist und für die noch kein Ergebnis eingetragen wurde.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-[6rem_minmax(12rem,1fr)_repeat(3,11rem)]">
        <Field label="Wahlperiode" htmlFor="todo-period">
          <NativeSelect id="todo-period" value={period} onChange={(e) => setPeriod(Number(e.target.value))}>
            {PERIODS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field
          label="Suche"
          htmlFor="todo-search"
          className="col-span-2 row-start-2 sm:col-span-4 lg:col-span-1 lg:row-start-auto"
        >
          <div className="relative">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="todo-search"
              type="search"
              placeholder="Titel oder ID"
              className="pl-8"
              value={filters.search}
              onChange={(e) => set('search')(e.target.value)}
            />
          </div>
        </Field>
        <Field label="Stand" htmlFor="todo-status">
          <NativeSelect id="todo-status" value={filters.status} onChange={(e) => set('status')(e.target.value)}>
            <option value="">Alle</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Abstimmung" htmlFor="todo-named">
          <NativeSelect
            id="todo-named"
            value={filters.named}
            onChange={(e) => set('named')(e.target.value as TodoFilters['named'])}
          >
            <option value="">Alle</option>
            <option value="true">namentlich</option>
            <option value="false">nicht namentlich</option>
          </NativeSelect>
        </Field>
        <Field label="Daten" htmlFor="todo-data">
          <NativeSelect
            id="todo-data"
            value={filters.data}
            onChange={(e) => set('data')(e.target.value as TodoFilters['data'])}
          >
            <option value="">Alle</option>
            <option value="true">mit Daten</option>
            <option value="false">ohne Daten</option>
          </NativeSelect>
        </Field>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Liste konnte nicht geladen werden</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {totalCount > procedures.length && (
        <Alert>
          <AlertCircle />
          <AlertTitle>{totalCount - procedures.length} weitere Vorgänge nicht geladen</AlertTitle>
          <AlertDescription>
            Die Liste zeigt die ersten {procedures.length}. Filter wirken nur auf diese.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium" aria-live="polite">
          {loading && !data
            ? 'Lädt …'
            : filtersActive
              ? `${filtered.length} von ${procedures.length} offen`
              : `${procedures.length} offen`}
        </span>
        {filtersActive && (
          <button type="button" className="text-primary hover:underline" onClick={() => setFilters(EMPTY_FILTERS)}>
            Filter zurücksetzen
          </button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-32">Abstimmung</TableHead>
            <TableHead className="hidden w-24 sm:table-cell">ID</TableHead>
            <TableHead>Titel</TableHead>
            <TableHead className="hidden w-56 md:table-cell">Stand</TableHead>
          </TableRow>
        </TableHeader>
        {weeks.map((week) => (
          <TableBody key={week.key}>
            <TableRow className="bg-muted hover:bg-muted">
              <TableHead colSpan={4} scope="colgroup" className="h-8 text-xs text-foreground">
                {week.label}
                <span className="ml-2 font-normal text-muted-foreground">{week.procedures.length}</span>
              </TableHead>
            </TableRow>
            {week.procedures.map((p) => (
              <TableRow key={p.procedureId}>
                <TableCell className="align-top whitespace-nowrap">
                  {p.voteDate ? (
                    <>
                      <div>{formatDate(p.voteDate)}</div>
                      <div className="text-xs text-muted-foreground">{since(p.voteDate)}</div>
                    </>
                  ) : (
                    '–'
                  )}
                </TableCell>
                <TableCell className="hidden align-top text-muted-foreground tabular-nums sm:table-cell">
                  {p.procedureId}
                </TableCell>
                <TableCell className="align-top [overflow-wrap:anywhere] hyphens-auto">
                  <Link href={`/procedure/${p.procedureId}`} className="font-medium text-primary hover:underline">
                    {p.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    {p.type && <span>{p.type}</span>}
                    <span className="sm:hidden">· {p.procedureId}</span>
                    {p.namedVote && (
                      <Badge variant="secondary">
                        <IdCard />
                        namentlich
                      </Badge>
                    )}
                    {hasEntryWithoutYes(p) && (
                      <Badge
                        variant="outline"
                        title="Ergebnis ohne Ja-Stimmen: der Server führt den Vorgang weiter als offen"
                      >
                        Eintrag ohne Ja-Stimmen
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden align-top md:table-cell">{p.currentStatus}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        ))}
        {!loading && !error && weeks.length === 0 && (
          <TableBody>
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                {filtersActive
                  ? 'Keine Vorgänge für diese Filter.'
                  : 'Nichts zu tun. Alle Ergebnisse sind eingetragen.'}
              </TableCell>
            </TableRow>
          </TableBody>
        )}
      </Table>
    </div>
  );
};
