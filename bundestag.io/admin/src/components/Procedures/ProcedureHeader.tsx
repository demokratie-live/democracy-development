import React from 'react';
import { CalendarClock, ExternalLink, FileText, IdCard, ScrollText } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { daysSince, formatDate, hasVoteData } from './todo';

export type Document = { type?: string | null; editor?: string | null; number?: string | null; url?: string | null };
export type ProtocolEntry = { initiator?: string | null; findSpot?: string | null; findSpotUrl?: string | null };

type Props = {
  procedureId: string;
  type?: string | null;
  period?: number | null;
  currentStatus?: string | null;
  namedVote?: boolean | null;
  voteDate?: string | null;
  customData?: { voteResults?: { yes?: number | null; no?: number | null; abstination?: number | null } | null } | null;
  importantDocuments?: Document[] | null;
  plenaryProtocols: ProtocolEntry[];
};

const VoteDate: React.FC<{ voteDate?: string | null; entered: boolean }> = ({ voteDate, entered }) => {
  if (!voteDate) return <span className="text-muted-foreground">kein Termin</span>;
  const days = daysSince(voteDate);
  const upcoming = days < 0;
  // red: vote is over and nothing entered yet; green: still ahead (#1592)
  const tone = upcoming ? 'text-green-700' : entered ? 'text-foreground' : 'text-destructive';
  const hint = upcoming
    ? `in ${-days} ${days === -1 ? 'Tag' : 'Tagen'}`
    : days === 0
      ? 'heute'
      : `vor ${days} ${days === 1 ? 'Tag' : 'Tagen'}`;
  return (
    <span className={cn('font-medium', tone)}>
      {formatDate(voteDate)} <span className="font-normal text-muted-foreground">· {hint}</span>
    </span>
  );
};

const Fact: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
    <dd className="mt-0.5 text-sm">{children}</dd>
  </div>
);

const SourceLink: React.FC<{ href?: string | null; children: React.ReactNode }> = ({ href, children }) =>
  href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group inline-flex items-start gap-1.5 text-primary hover:underline"
    >
      <span>{children}</span>
      <ExternalLink
        aria-label="öffnet in neuem Tab"
        className="mt-0.5 size-3.5 shrink-0 opacity-60 group-hover:opacity-100"
      />
    </a>
  ) : (
    <span>{children}</span>
  );

export const ProcedureHeader: React.FC<Props> = ({
  procedureId,
  type,
  period,
  currentStatus,
  namedVote,
  voteDate,
  customData,
  importantDocuments,
  plenaryProtocols,
}) => {
  const entered = hasVoteData({ procedureId, title: '', namedVote, customData });
  const documents = importantDocuments ?? [];
  const upcoming = Boolean(voteDate) && daysSince(voteDate as string) < 0;
  const status = entered
    ? { label: 'Ergebnis eingetragen', variant: 'secondary' as const }
    : upcoming || !voteDate
      ? { label: 'Abstimmung steht aus', variant: 'outline' as const }
      : { label: 'Ergebnis fehlt', variant: 'destructive' as const };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={status.variant}>{status.label}</Badge>
        {namedVote && (
          <Badge variant="secondary">
            <IdCard />
            namentliche Abstimmung
          </Badge>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
        <Fact label="Abstimmung">
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock aria-hidden className="size-4 text-muted-foreground" />
            <VoteDate voteDate={voteDate} entered={entered} />
          </span>
        </Fact>
        <Fact label="Stand">{currentStatus || '–'}</Fact>
        <Fact label="Typ">{type || '–'}</Fact>
        <Fact label="ID">
          <span className="tabular-nums">{procedureId}</span>
        </Fact>
        <Fact label="Wahlperiode">{period ?? '–'}</Fact>
      </dl>

      <div className="grid gap-6 md:grid-cols-2">
        <section aria-labelledby="documents-heading">
          <h2 id="documents-heading" className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <FileText aria-hidden className="size-4 text-muted-foreground" />
            Dokumente
          </h2>
          {documents.length ? (
            <ul className="space-y-1.5 text-sm">
              {documents.map((d, i) => (
                <li key={d.number ?? i}>
                  <SourceLink href={d.url}>
                    {d.type}
                    <span className="text-muted-foreground">
                      {' '}
                      · {d.editor} {d.number}
                    </span>
                  </SourceLink>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Keine Dokumente.</p>
          )}
        </section>

        <section aria-labelledby="protocols-heading">
          <h2 id="protocols-heading" className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <ScrollText aria-hidden className="size-4 text-muted-foreground" />
            Plenarprotokolle
          </h2>
          {plenaryProtocols.length ? (
            <ul className="space-y-1.5 text-sm">
              {plenaryProtocols.map((p, i) => (
                <li key={p.findSpot ?? i}>
                  <SourceLink href={p.findSpotUrl}>
                    {p.findSpot}
                    {p.initiator && <span className="text-muted-foreground"> · {p.initiator}</span>}
                  </SourceLink>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Noch kein Plenarprotokoll.</p>
          )}
        </section>
      </div>
    </div>
  );
};
