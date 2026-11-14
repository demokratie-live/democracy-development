// parties in the order the admin shows them, per legislative period
export const getFractions = (period: number) =>
  (period === 21 ? ['Union', 'AfD', 'SPD', 'Grüne', 'Linke'] : ['Union', 'SPD', 'AfD', 'Grüne', 'FDP', 'Linke']).map(
    (name) => ({ name }),
  );
