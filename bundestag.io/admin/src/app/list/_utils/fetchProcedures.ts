const ITEMS_PER_PAGE = 10;

export interface ProcedureListEntry {
  id?: string | number;
  title: string;
  procedureId: string;
  customData?: {
    voteResults: {
      partyVotes: {
        party: string;
        main?: string;
      }[];
    };
  };
}

export async function fetchProcedures(
  url: string,
  page: number,
): Promise<{ procedures: ProcedureListEntry[]; count: number }> {
  const limit = ITEMS_PER_PAGE;

  const res = await fetch(`${url}?limit=${limit}&page=${page}`, {
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

export { ITEMS_PER_PAGE };
