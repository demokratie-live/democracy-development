import Entry from '../_components/entry';
import { IProcedure } from '@democracy-deutschland/bundestagio-common';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const data = await getData();
  return (
    <>
      <h1>Upcoming procedures</h1>
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
  const res = await fetch('http://procedures/procedures/list/upcoming', {
    headers: {
      'Cache-Control': 'no-cache',
    },
  });

  if (!res.ok) {
    throw new Error('Fehler beim Abrufen der Daten');
  }

  return res.json();
}
