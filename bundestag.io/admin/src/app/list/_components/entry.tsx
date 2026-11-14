import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EntryProps {
  title: string;
  procedureId: string;
  // upcoming votes cannot have results yet
  upcoming?: boolean;
  votes?: Array<{
    party: string;
    decision?: string;
  }>;
}

const DECISION: Record<string, { label: string; className: string }> = {
  YES: { label: 'Ja', className: 'bg-green-100 text-green-900' },
  ABSTINATION: { label: 'Enthaltung', className: 'bg-amber-100 text-amber-900' },
  NO: { label: 'Nein', className: 'bg-red-100 text-red-900' },
};

export default function Entry({ title, procedureId, upcoming, votes }: EntryProps) {
  const hasVotes = Boolean(votes?.length);
  return (
    <article className={cn('space-y-2 rounded-md border p-4', !hasVotes && !upcoming && 'border-destructive')}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="font-medium [overflow-wrap:anywhere] hyphens-auto">{title}</h2>
        <Link href={`/procedure/${procedureId}`} className="shrink-0 text-sm text-primary hover:underline">
          Bearbeiten
        </Link>
      </div>
      <p className="text-xs text-muted-foreground tabular-nums">ID {procedureId}</p>
      {hasVotes ? (
        <ul className="flex flex-wrap gap-1.5">
          {votes!.map((vote) => {
            const d = vote.decision ? DECISION[vote.decision] : undefined;
            return (
              <li key={vote.party}>
                <Badge variant="outline" className={d?.className}>
                  {vote.party}: {d?.label ?? vote.decision ?? '–'}
                </Badge>
              </li>
            );
          })}
        </ul>
      ) : upcoming ? (
        <p className="text-sm text-muted-foreground">Abstimmung steht aus.</p>
      ) : (
        <p className="text-sm text-destructive">Noch keine Fraktionsstimmen.</p>
      )}
    </article>
  );
}
