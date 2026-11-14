import Entry from '../_components/entry';
import { PaginationNavigation } from '../_components/pagination-navigation';
import { IProcedure } from '@democracy-deutschland/bundestagio-common';
import { Card } from '@/components/Layout';
import { ITEMS_PER_PAGE } from '../_utils/fetchProcedures';

interface PageTemplateProps {
  title: string;
  empty: string;
  upcoming?: boolean;
  procedures: IProcedure[];
  count: number;
  currentPage: number;
}

export default function PageTemplate({ title, empty, upcoming, procedures, count, currentPage }: PageTemplateProps) {
  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">{title}</h1>
      <Card>
        {totalPages === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          <div className="space-y-4">
            <PaginationNavigation currentPage={currentPage} totalPages={totalPages} />
            <div className="space-y-3">
              {procedures.map((procedure) => (
                <Entry
                  key={procedure.procedureId}
                  title={procedure.title}
                  procedureId={procedure.procedureId}
                  upcoming={upcoming}
                  votes={procedure.customData?.voteResults?.partyVotes?.map((vote) => ({
                    party: vote.party,
                    decision: vote.main,
                  }))}
                />
              ))}
            </div>
            <PaginationNavigation currentPage={currentPage} totalPages={totalPages} />
          </div>
        )}
      </Card>
    </>
  );
}
