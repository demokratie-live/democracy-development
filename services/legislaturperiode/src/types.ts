export type LegislaturperiodeBase = {
  number: number;
  start: Date;
  end?: Date;
};

export type LegislaturperiodeDB = LegislaturperiodeBase & {
  id: string;
};

export type Legislaturperiode = LegislaturperiodeBase & {
  current: boolean;
};
