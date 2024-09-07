import Surreal, { RecordId } from 'surrealdb.js';
import { Legislaturperiode, LegislaturperiodeBase, LegislaturperiodeDB } from './types';

export const createLegislaturperiode = async (
  db: Surreal,
  { number, start, end }: LegislaturperiodeBase,
): Promise<LegislaturperiodeDB> => {
  const legislaturperioden = await db.query<[LegislaturperiodeDB[], LegislaturperiodeBase[]]>(
    'SELECT * FROM type::table($tb);',
    { tb: 'legislaturperiode' },
  );

  const legislaturperiode = legislaturperioden[0].find((lp) => lp.number === number);

  if (!legislaturperiode) {
    return db.create<LegislaturperiodeDB, LegislaturperiodeBase>(new RecordId('legislaturperiode', number), {
      number: number,
      start,
      end,
    });
  }

  return legislaturperiode;
};

export const getLegislaturperioden = async (db: Surreal): Promise<Legislaturperiode[]> => {
  const legislaturperioden = await db.query<[Legislaturperiode[], Legislaturperiode[]]>(
    'SELECT * FROM type::table($tb);',
    { tb: 'legislaturperiode' },
  );

  return legislaturperioden[0];
};

export const legislaturperiodeExists = async (
  db: Surreal,
  legislaturperiode: LegislaturperiodeBase,
): Promise<boolean> => {
  const legislaturperioden = await getLegislaturperioden(db);

  return legislaturperioden.some((lp) => lp.number === legislaturperiode.number);
};
