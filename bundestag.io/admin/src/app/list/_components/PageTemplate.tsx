import { IProcedure } from '@democracy-deutschland/bundestagio-common';
import { ITEMS_PER_PAGE } from '../_utils/fetchProcedures';
import TableComponent from '../_components/TableComponent';

interface PageTemplateProps {
  title: string;
  procedures: IProcedure[];
  count: number;
  currentPage: number;
}

export default function PageTemplate({ title, procedures, count, currentPage }: PageTemplateProps) {
  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

  const data = procedures.map((procedure) => ({
    key: procedure.id,
    title: procedure.title,
    procedureId: procedure.procedureId,
    voteDate: procedure.voteDate as unknown as string,
    votes:
      procedure.customData?.voteResults.partyVotes.map((vote) => ({
        party: vote.party,
        decision: vote.main || '',
      })) || [],
  }));

  return (
    <>
      <h1>{title}</h1>
      {totalPages === 0 && <p>There are no {title.toLowerCase()}.</p>}
      {totalPages > 0 && (
        <>
          <TableComponent
            procedures={data}
            pagination={{ current: currentPage, total: count, pageSize: ITEMS_PER_PAGE }}
          />
        </>
      )}
    </>
  );
}
