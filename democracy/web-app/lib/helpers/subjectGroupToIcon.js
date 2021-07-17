const subjectGroups = {
  'Arbeit und Beschäftigung': {
    icon: 'hammer',
    image: '/static/images/sachgebiete/arbeit_beschaeftigung',
  },
  'Ausländerpolitik, Zuwanderung': {
    icon: 'add-user',
    image: '/static/images/sachgebiete/auslaenderpolitik',
  },
  'Außenpolitik und internationale Beziehungen': {
    icon: 'planet',
    displayTitle: 'Außenpolitik und intern. Beziehungen',
    image: '/static/images/sachgebiete/aussenpolitik',
  },
  Außenwirtschaft: {
    icon: 'anker',
    image: '/static/images/sachgebiete/aussenwirtschaft',
  },
  'Bildung und Erziehung': {
    icon: 'magic',
    image: '/static/images/sachgebiete/bildung_erziehung',
  },
  Bundestag: {
    icon: 'bundestag',
    image: '/static/images/sachgebiete/bundestag',
  },
  Energie: {
    icon: 'lamp',
    image: '/static/images/sachgebiete/energie',
  },
  Entwicklungspolitik: {
    icon: 'locate',
    image: '/static/images/sachgebiete/entwicklungspolitik',
  },
  'Europapolitik und Europäische Union': {
    icon: 'europe',
    image: '/static/images/sachgebiete/europapolitik',
  },
  'Gesellschaftspolitik, soziale Gruppen': {
    icon: 'society',
    image: '/static/images/sachgebiete/gesellschaft',
  },
  Gesundheit: {
    icon: 'heart',
    image: '/static/images/sachgebiete/gesundheit',
  },
  'Innere Sicherheit': {
    icon: 'camera',
    image: '/static/images/sachgebiete/innere_sicherheit',
  },
  Kultur: {
    icon: 'book',
    image: '/static/images/sachgebiete/kultur',
  },
  'Landwirtschaft und Ernährung': {
    icon: 'settings',
    image: '/static/images/sachgebiete/landwirtschaft_ernaehrung',
  },
  'Medien, Kommunikation und Informationstechnik': {
    icon: 'network',
    displayTitle: 'Medien, Kommunikation, Informationstechnik',
    image: '/static/images/sachgebiete/it',
  },
  'Neue Bundesländer / innerdeutsche Beziehungen': {
    icon: 'puzzle',
    displayTitle: 'Neue Bundesländer',
    image: '/static/images/sachgebiete/neue_bundeslaender',
  },
  'Öffentliche Finanzen, Steuern und Abgaben': {
    icon: 'calculator',
    image: '/static/images/sachgebiete/oeffentliche_finanzen_steuern_und_abgaben',
  },
  'Politisches Leben, Parteien': {
    icon: 'chat',
    displayTitle: 'Politisches Leben',
    image: '/static/images/sachgebiete/politisches_leben_parteien',
  },
  'Raumordnung, Bau- und Wohnungswesen': {
    icon: 'house',
    image: '/static/images/sachgebiete/bauwesen',
  },
  Recht: {
    icon: 'pen',
    image: '/static/images/sachgebiete/recht',
  },
  'Soziale Sicherung': {
    icon: 'umbrella',
    image: '/static/images/sachgebiete/soziale_sicherung',
  },
  'Sport, Freizeit und Tourismus': {
    icon: 'image',
    image: '/static/images/sachgebiete/tourismus',
  },
  'Staat und Verwaltung': {
    icon: 'government',
    image: '/static/images/sachgebiete/staat_verwaltung',
  },
  Umwelt: {
    icon: 'water-drop',
    image: '/static/images/sachgebiete/umwelt',
  },
  Verkehr: {
    icon: 'plane',
    image: '/static/images/sachgebiete/verkehr',
  },
  Verteidigung: {
    icon: 'shield',
    image: '/static/images/sachgebiete/verteidigung',
  },
  Wirtschaft: {
    icon: 'increase-arrow',
    image: '/static/images/sachgebiete/wirtschaft',
  },
  'Wissenschaft, Forschung und Technologie': {
    icon: 'rocket',
    image: '/static/images/sachgebiete/wissenschaft_forschung_technologie',
  },
};

const getDisplayTitle = subjectGroup => {
  if (subjectGroups[subjectGroup] && subjectGroups[subjectGroup].displayTitle) {
    return subjectGroups[subjectGroup].displayTitle;
  }
  return subjectGroup;
};

const getImage = subjectGroup => {
  if (subjectGroups[subjectGroup] && subjectGroups[subjectGroup].image) {
    return subjectGroups[subjectGroup].image;
  } else {
    return '/static/images/sachgebiete/default';
  }
};

export { subjectGroups, getDisplayTitle, getImage };

export default subjectGroup => {
  if (subjectGroups[subjectGroup]) {
    return subjectGroups[subjectGroup].icon;
  }
};
