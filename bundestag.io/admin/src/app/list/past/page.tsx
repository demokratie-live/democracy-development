import Entry from '../_components/entry';
import { IProcedure } from '@democracy-deutschland/bundestagio-common';
import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import { PaginationNavigation } from '../_components/pagination-navigation';

const ITEMS_PER_PAGE = 10;

export const dynamic = 'force-dynamic';

async function getData(page: number = 1): Promise<{ procedures: IProcedure[]; count: number }> {
  const limit = ITEMS_PER_PAGE;

  const res = await fetch(`${process.env.PROCEDURES_SERVER_URL}/procedures/list/past?limit=${limit}&page=${page}`, {
    headers: {
      'Cache-Control': 'no-cache',
      cache: 'no-store',
    },
  });

  if (!res.ok) {
    throw new Error('Fehler beim Abrufen der Daten');
  }

  return res.json();
}

export default async function Page({ searchParams }: { searchParams: { page?: string } }) {
  noStore();
  const currentPage = searchParams.page ? parseInt(searchParams.page, 10) : 1; // Standardwert ist Seite 1
  const { procedures, count } = await getData(currentPage);
  const totalPages = Math.ceil(count / ITEMS_PER_PAGE); // Berechne die Gesamtseitenzahl basierend auf der Anzahl der Elemente

  return (
    <>
      <h1>Past procedures</h1>

      {totalPages === 0 && <p>There are no past procedures.</p>}
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
