import Entry from '../_components/entry';
import { IProcedure } from '@democracy-deutschland/bundestagio-common';
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function Page() {
  noStore();
  const data = await getData();
  return (
    <>
      <h1>Past procedures</h1>
      {data.map((procedure) => (
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
    </>
  );
}

async function getData(): Promise<IProcedure[]> {
  const res = await fetch(`${process.env.PROCEDURES_SERVER_URL}/procedures/list/past`, {
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
