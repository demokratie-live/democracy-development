export default {
  TOPIC: {
    // Search
    FIND_BERATUNG_ANTRAG: /Beratung des Antrags/i,
    FIND_ERSTE_BERATUNG: /Erste Beratung/i,
    FIND_BERATUNG_BESCHLUSSEMPFEHLUNG: /Beratung der Beschlussempfehlung/i,
    FIND_ZWEITE_DRITTE_BERATUNG: /Zweite und dritte Beratung/i,
    FIND_ZWEITE_BERATUNG_SCHLUSSABSTIMMUNG: /Zweite Beratung und Schlussabstimmung/i,
    FIND_DRITTE_BERATUNG: /Dritte Beratung/i,
  },
  HEADING: {
    // Search
    FIND_ABSCHLIESSENDE_BERATUNG: /Abschließende Beratung(en)? ohne Aussprache/i,
  },
  STATUS: {
    FIND_ANTRAG_COMPLETED: /Antrag[\s\S]*?(angenommen|beschlossen|abgelehnt|ablehnen)/i,
  },
};
