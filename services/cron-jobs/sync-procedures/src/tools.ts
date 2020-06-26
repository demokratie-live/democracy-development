export const convertPartyName = (party: string) => {
  switch (party) {
    case 'CDU/CSU':
      // case 'Union':
      return 'Union';
    case 'AFD':
      // case 'AfD':
      return 'AfD';
    case 'Die Linke':
    case 'DIE LINKE.':
      // case 'Linke':
      return 'Linke';
    case 'Bündnis 90/Die Grünen':
    case 'B90/GR��NE':
    case 'B90/Grüne':
    case 'B90/GRÜNE':
      // case 'Grüne':
      return 'Grüne';
    // case 'FDP':
    //  return 'FDP';
    // case 'SPD':
    //  return 'SPD';
    case 'fraktionslose':
      // case 'fraktionslos':
      return 'fraktionslos';
    default:
      return party;
  }
};
