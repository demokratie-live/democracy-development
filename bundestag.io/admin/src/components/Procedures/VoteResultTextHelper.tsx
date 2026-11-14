import { useQuery } from '@apollo/client';
import { ChevronRight } from 'lucide-react';

import { VOTE_TEXTS } from '../../graphql/queries/voteTexts';
import { PlenarText } from './PlenarText';

type Props = {
  procedureId: string;
  importantDocuments?: { number?: string | null }[] | null;
};

/** Passages of the plenary protocol that name one of the documents. */
export const VoteResultTextHelper: React.FC<Props> = ({ procedureId, importantDocuments }) => {
  const { data, loading, error } = useQuery(VOTE_TEXTS, { variables: { procedureId } });
  const docIds = (importantDocuments ?? []).map(({ number }) => number).filter((n): n is string => Boolean(n));

  if (loading) return <p className="text-sm text-muted-foreground">Textstellen werden gesucht …</p>;
  if (error) return <p className="text-sm text-muted-foreground">Keine Textstellen: {error.message}</p>;

  const passages: { results: string[] }[] = data?.voteResultTextHelper ?? [];
  if (!passages.length)
    return <p className="text-sm text-muted-foreground">Keine Textstellen im Plenarprotokoll gefunden.</p>;

  return (
    <div className="divide-y rounded-md border">
      {passages.map(({ results }, i) => (
        <details key={i} className="group" open={passages.length === 1}>
          <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm hover:bg-muted [&::-webkit-details-marker]:hidden">
            <ChevronRight aria-hidden className="size-4 shrink-0 transition-transform group-open:rotate-90" />
            {/* the API puts the line naming the document second */}
            <span className="truncate">{results[1] ?? results[0]}</span>
          </summary>
          <div className="space-y-2 border-t bg-muted/40 px-3 py-3 text-sm">
            {results.filter(Boolean).map((value, j) => (
              <PlenarText key={j} text={value} docIds={docIds} />
            ))}
          </div>
        </details>
      ))}
    </div>
  );
};
