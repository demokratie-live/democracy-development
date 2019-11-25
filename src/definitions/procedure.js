export default {
  STATUS: {
    // Bundesrat
    BR_ZUGELEITET_NICHT_BERATEN: 'Dem Bundesrat zugeleitet - Noch nicht beraten',
    BR_ERSTER_DURCHGANG_ABGESCHLOSSEN: '1. Durchgang im Bundesrat abgeschlossen',
    BR_ZUGESTIMMT: 'Bundesrat hat zugestimmt',
    BR_EINSPRUCH: 'Bundesrat hat Einspruch eingelegt',
    BR_ZUSTIMMUNG_VERSAGT: 'Bundesrat hat Zustimmung versagt',
    BR_VERMITTLUNGSAUSSCHUSS_NICHT_ANGERUFEN: 'Bundesrat hat Vermittlungsausschuss nicht angerufen',
    // Bundespräsident
    BP_ZUSTIMMUNGSVERWEIGERUNG:
      'Nicht ausgefertigt wegen Zustimmungsverweigerung des Bundespräsidenten',
    // Besonderheiten durch Vorgangsablauf
    NICHT_ABBESCHLOSSEN_VORGANGSABLAUF: 'Nicht abgeschlossen - Einzelheiten siehe Vorgangsablauf',
    ABBESCHLOSSEN_VORGANGSABLAUF: 'Abgeschlossen - Ergebnis siehe Vorgangsablauf',
    ZUSAMMENGEFUEHRT_VORGANGSABLAUF: 'Zusammengeführt mit... (siehe Vorgangsablauf)',
    BERATUNG_VORGANGSABLAUF: 'In der Beratung (Einzelheiten siehe Vorgangsablauf)',
    // Allgemein
    ZUGELEITET: 'Dem Bundestag zugeleitet - Noch nicht beraten',
    AUSSCHUESSEN_ZUGEWIESEN: 'Den Ausschüssen zugewiesen',
    NICHT_BERATEN: 'Noch nicht beraten',
    EINBRINGUNG_ABGELEHNT: 'Einbringung abgelehnt',
    EINBRINGUNG_BESCHLOSSEN: 'Einbringung beschlossen',
    UEBERWIESEN: 'Überwiesen',
    BESCHLUSSEMPFEHLUNG: 'Beschlussempfehlung liegt vor',
    ERLEDIGT_DURCH_WAHLPERIODE: 'Erledigt durch Ablauf der Wahlperiode',
    ZURUECKGEZOGEN: 'Zurückgezogen',
    ANGENOMMEN: 'Angenommen',
    ABGELEHNT: 'Abgelehnt',
    ABGESCHLOSSEN: 'Abgeschlossen',
    NICHTIG: 'Für nichtig erklärt',
    VERKUENDET: 'Verkündet',
    ERLEDIGT: 'Für erledigt erklärt',
    VERABSCHIEDET: 'Verabschiedet',
    VERMITTLUNGSVERFAHREN: 'Im Vermittlungsverfahren',
    VERMITTLUNGSVORSCHLAG: 'Vermittlungsvorschlag liegt vor',
    UNVEREINBAR_MIT_GRUNDGESETZ: 'Für mit dem Grundgesetz unvereinbar erklärt',
    ZUSTIMMUNG_VERSAGT: 'Zustimmung versagt',
    TEILE_FUER_NICHTIG_ERKLÄRT: 'Teile des Gesetzes für nichtig erklärt',
    GEGENSTANDSLOS: 'Für gegenstandslos erklärt',
    KEINE_BEHANDLUNG: 'Keine parlamentarische Behandlung',
  },
  TYPE: {
    GESETZGEBUNG: 'Gesetzgebung',
    ANTRAG: 'Antrag',
  },
  HISTORY: {
    DECISION: {
      TYPE: {
        NAMENTLICHE_ABSTIMMUNG: 'Namentliche Abstimmung',
      },
      TENOR: {
        VORLAGE_ABLEHNUNG: 'Ablehnung der Vorlage',
        VORLAGE_ANNAHME: 'Annahme der Vorlage',
        VORLAGE_ERLEDIGT: 'Erklärung der Vorlage für erledigt',
        // Search
        FIND_AENDERUNGSANTRAG: /Änderungsantrag/i,
      },
      COMMENT: {
        // Search
        FIND_BESCHLUSSEMPFEHLUNG_ABLEHNUNG: /Annahme der Beschlussempfehlung auf Ablehnung/i,
      },
    },
    ABSTRACT: {
      EMPFEHLUNG_VORLAGE_ANNAHME: 'Empfehlung: Annahme der Vorlage',
      EMPFEHLUNG_VORLAGE_ABLEHNUNG: 'Empfehlung: Ablehnung der Vorlage',
    },
    INITIATOR: {
      RUECKNAHME_AMTLICH: 'Amtliche Mitteilung: Rücknahme',
      RUECKNAHME: 'Rücknahme',
      RUECKNAHME_VORLAGE: 'Rücknahme der Vorlage',
      // Search
      FIND_BESCHLUSSEMPFEHLUNG_BERICHT: /Beschlussempfehlung und Bericht/i,
    },
    FINDSPOT: {
      // Search
      FIND_BT_PLENARPROTOKOLL: /BT-Plenarprotokoll/i,
    },
  },
  IMPORTANT_DOCUMENTS: {
    TYPE: {
      BESCHLUSSEMPFEHLUNG_BERICHT: 'Beschlussempfehlung und Bericht',
      BESCHLUSSEMPFEHLUNG: 'Beschlussempfehlung',
      BERICHT: 'Bericht',
    },
  },
};
