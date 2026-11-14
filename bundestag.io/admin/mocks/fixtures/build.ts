/**
 * Builds mocks/fixtures/procedures.json from the public DEMOCRACY API.
 *
 *   pnpm mocks:fixtures
 *
 * Title, type, status, vote date, documents and results are real. The public
 * API has no plenary history and no votingDocument/votingRecommendation, so
 * those come from the table below (cases from the votesAI gold data) or are
 * derived; every derived field is listed in `mock` on the procedure.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const API = 'https://api.democracy-app.de/';

type Case = {
  id: string;
  // what the case is there to show
  note: string;
  // real plenary minutes from the votesAI gold data
  protocol?: { period: number; meeting: number; page: string; initiator: string };
  votingDocument?: 'mainDocument' | 'recommendedDecision';
  votingRecommendation?: boolean;
  // replaces the real result (marked as synthetic)
  result?: 'zero-yes';
};

const CASES: Case[] = [
  // WP 21, vote date passed, no result yet: the to-do list
  { id: '340931', note: 'offen, Beschlussempfehlung' },
  { id: '338341', note: 'offen, Gesetz' },
  { id: '335886', note: 'offen, Antrag' },
  { id: '338410', note: 'offen, sehr langer Titel' },
  { id: '335476', note: 'offen, verabschiedet' },
  { id: '341113', note: 'offen, abgelehnt' },
  { id: '329212', note: 'offen, abgelehnt' },
  { id: '340932', note: 'offen, angenommen' },
  { id: '338349', note: 'offen, kurzer Titel' },
  { id: '336979', note: 'offen, Gesetz abgelehnt' },
  { id: '340627', note: 'offen, überwiesen' },
  { id: '334215', note: 'offen, für erledigt erklärt' },
  { id: '341459', note: 'Ergebnis mit Ja = 0, bleibt in der Liste', result: 'zero-yes' },
  // WP 21 with result
  { id: '325644', note: 'Ergebnis, Antrag abgelehnt' },
  { id: '335465', note: 'Ergebnis, Gesetz verabschiedet' },
  { id: '332038', note: 'Ergebnis, langer Titel' },
  { id: '341116', note: 'Ergebnis, Antrag angenommen' },
  { id: '321717', note: 'Ergebnis, Antrag abgelehnt' },
  { id: '338848', note: 'Ergebnis, Vertragsgesetz' },
  { id: '326806', note: 'namentliche Abstimmung' },
  // WP 21, upcoming
  { id: '336653', note: 'kommend' },
  { id: '325565', note: 'kommend' },
  { id: '338366', note: 'kommend, Haushalt' },
  { id: '341128', note: 'ohne Abstimmungstermin' },
  // older periods with real plenary minutes
  {
    id: '231103',
    note: 'WP 19, über Beschlussempfehlung, gedreht',
    protocol: { period: 19, meeting: 11, page: '798A', initiator: 'Beratung' },
    votingDocument: 'recommendedDecision',
    votingRecommendation: false,
  },
  {
    id: '84344',
    note: 'WP 19, über den Antrag',
    protocol: { period: 19, meeting: 1, page: '16B', initiator: 'Beratung' },
    votingDocument: 'mainDocument',
    votingRecommendation: true,
  },
  {
    id: '283069',
    note: 'WP 20, über Beschlussempfehlung, gedreht',
    protocol: { period: 20, meeting: 7, page: '303D', initiator: 'Beratung' },
    votingDocument: 'recommendedDecision',
    votingRecommendation: false,
  },
  {
    id: '282689',
    note: 'WP 20, über den Antrag',
    protocol: { period: 20, meeting: 2, page: '38D', initiator: 'Beratung' },
    votingDocument: 'mainDocument',
    votingRecommendation: true,
  },
];

const FIELDS = `
    procedureId title type period currentStatus voteDate
    importantDocuments { editor number type url }
    voteResults {
      yes no abstination decisionText namedVote
      partyVotes { party main deviants { yes no abstination } }
    }`;

// one aliased field per case, the API looks procedures up by procedureId only one at a time
const QUERY = `{ ${CASES.map((c, i) => `p${i}: procedure(id: ${JSON.stringify(c.id)}) { ${FIELDS} }`).join('\n')} }`;

type PublicProcedure = {
  procedureId: string;
  title: string;
  type: string;
  period: number;
  currentStatus: string;
  voteDate: string | null;
  importantDocuments: { editor: string; number: string; type: string; url: string }[];
  voteResults: {
    yes: number;
    no: number;
    abstination: number;
    decisionText: string | null;
    namedVote: boolean;
    partyVotes: { party: string; main: string; deviants: { yes: number; no: number; abstination: number } }[] | null;
  } | null;
};

const ZERO_YES_PARTIES = [
  { party: 'Union', main: 'NO' },
  { party: 'AfD', main: 'NO' },
  { party: 'SPD', main: 'NO' },
  { party: 'Grüne', main: 'ABSTINATION' },
  { party: 'Linke', main: 'NO' },
];

const pdfUrl = ({ period, meeting, page }: NonNullable<Case['protocol']>) =>
  `https://dserver.bundestag.de/btp/${period}/${period}${String(meeting).padStart(3, '0')}.pdf#P.${parseInt(page, 10)}`;

const build = (c: Case, p: PublicProcedure) => {
  const mock: string[] = [];
  const history: Record<string, unknown>[] = [];
  if (c.protocol) {
    history.push({
      assignment: 'BT',
      initiator: c.protocol.initiator,
      findSpot: `BT-Plenarprotokoll ${c.protocol.period}/${c.protocol.meeting}, S. ${c.protocol.page}`,
      findSpotUrl: pdfUrl(c.protocol),
      decision: [{ type: 'Beschluss' }],
    });
  } else if (p.voteDate && new Date(p.voteDate) <= new Date()) {
    // the session number is not in the public API: link to a mock placeholder
    history.push({
      assignment: 'BT',
      initiator: 'Beratung',
      findSpot: `BT-Plenarprotokoll ${p.period}/Beispiel, S. 1A`,
      findSpotUrl: `http://localhost:4010/plenarprotokoll/${p.procedureId}.pdf`,
      decision: [{ type: 'Beschluss' }],
    });
    mock.push('history');
  }

  let voteResults: Record<string, unknown> | null = null;
  if (c.result === 'zero-yes') {
    voteResults = {
      // sums as the API computes them from the seats of WP 21
      yes: 0,
      no: 208 + 151 + 120 + 64,
      abstination: 85,
      decisionText: 'Beispieltext: Der Antrag ist abgelehnt.',
      votingDocument: 'mainDocument',
      votingRecommendation: true,
      partyVotes: ZERO_YES_PARTIES.map((v) => ({ ...v, deviants: { yes: 0, no: 0, abstination: 0 } })),
    };
    mock.push('voteResults');
  } else if (p.voteResults?.partyVotes?.length) {
    const r = p.voteResults;
    let { votingDocument, votingRecommendation } = c;
    if (!votingDocument) {
      // derived: the decision text says what was voted on
      votingDocument = /Beschlussempfehlung/.test(r.decisionText ?? '') ? 'recommendedDecision' : 'mainDocument';
      votingRecommendation = !(votingDocument === 'recommendedDecision' && /Ablehnung/.test(r.decisionText ?? ''));
      mock.push('votingDocument', 'votingRecommendation');
    }
    voteResults = {
      yes: r.yes,
      no: r.no,
      abstination: r.abstination,
      decisionText: r.decisionText,
      votingDocument,
      votingRecommendation,
      partyVotes: r.partyVotes,
    };
  }

  return {
    _id: `mock-${p.procedureId}`,
    procedureId: p.procedureId,
    title: p.title,
    type: p.type,
    period: p.period,
    currentStatus: p.currentStatus,
    voteDate: p.voteDate,
    namedVote: Boolean(p.voteResults?.namedVote),
    importantDocuments: p.importantDocuments,
    history,
    // mongoose returns nested paths as objects and arrays as [] even when nothing was saved
    customData: { voteResults: voteResults ?? { partyVotes: [] } },
    note: c.note,
    mock,
  };
};

const main = async () => {
  const response = await fetch(API, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: QUERY }),
  });
  const { data, errors } = await response.json();
  if (errors) throw new Error(JSON.stringify(errors));

  const found = Object.values(data as Record<string, PublicProcedure | null>).filter(Boolean) as PublicProcedure[];
  const byId = new Map(found.map((p) => [p.procedureId, p]));
  const missing = CASES.filter((c) => !byId.has(c.id)).map((c) => c.id);
  if (missing.length) throw new Error(`not found in the public API: ${missing.join(', ')}`);

  const procedures = CASES.map((c) => build(c, byId.get(c.id)!));
  const out = fileURLToPath(new URL('./procedures.json', import.meta.url));
  writeFileSync(out, `${JSON.stringify(procedures, null, 2)}\n`);
  console.log(`${procedures.length} procedures → ${out}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
