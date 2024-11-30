import { IProcedure } from '@democracy-deutschland/bundestagio-common';

const ITEMS_PER_PAGE = 10;

export async function fetchProcedures(url: string, page: number): Promise<{ procedures: IProcedure[]; count: number }> {
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
