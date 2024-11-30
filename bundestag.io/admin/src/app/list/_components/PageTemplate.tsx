import Entry from '../_components/entry';
import { PaginationNavigation } from '../_components/pagination-navigation';
import { IProcedure } from '@democracy-deutschland/bundestagio-common';
import { ITEMS_PER_PAGE } from '../_utils/fetchProcedures';

interface PageTemplateProps {
  title: string;
  procedures: IProcedure[];
  count: number;
  currentPage: number;
}

export default function PageTemplate({ title, procedures, count, currentPage }: PageTemplateProps) {
  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

  return (
    <>
      <h1>{title}</h1>
      {totalPages === 0 && <p>There are no {title.toLowerCase()}.</p>}
      {totalPages > 0 && (
        <>
          <PaginationNavigation currentPage={currentPage} totalPages={totalPages} />
          {procedures.map((procedure) => (
            <Entry
              key={procedure.id}
              title={procedure.title}
              procedureId={procedure.procedureId}
              votes={procedure.customData?.voteResults.partyVotes.map((vote) => ({
                party: vote.party,
                decision: vote.main,
              }))}
            />
          ))}
          <PaginationNavigation currentPage={currentPage} totalPages={totalPages} />
        </>
      )}
    </>
  );
}
