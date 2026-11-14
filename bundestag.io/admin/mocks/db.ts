/**
 * In-memory copy of the fixtures. Saving changes it until the mock restarts.
 * The rules follow bundestag.io/api/src/graphql/resolvers/Procedure.ts.
 */
import fixtures from './fixtures/procedures.json';

type Deviants = { yes?: number; no?: number; abstination?: number; notVoted?: number };
type PartyVote = { party: string; main?: string | null; deviants?: Deviants | null };
type VoteResults = {
  yes?: number;
  no?: number;
  abstination?: number;
  decisionText?: string | null;
  votingDocument?: string;
  votingRecommendation?: boolean;
  partyVotes?: PartyVote[] | null;
};
export type MockProcedure = Omit<(typeof fixtures)[number], 'customData'> & {
  customData: { voteResults: VoteResults };
};

// from the API resolver: seats per party, used to fill in the main vote
const DEPUTIES: Record<number, Record<string, number>> = {
  19: { Linke: 69, SPD: 153, Grüne: 67, Union: 246, FDP: 80, AfD: 92, Fraktionslos: 2 },
  20: { Linke: 39, SPD: 206, Grüne: 118, Union: 197, FDP: 92, AfD: 82, Fraktionslos: 2 },
  21: { Linke: 64, SPD: 120, Grüne: 85, Union: 208, AfD: 151, Fraktionslos: 2 },
};

// statuses the API excludes from the to-do list
const CLOSED = ['Zurückgezogen', 'Erledigt durch Ablauf der Wahlperiode'];
const DEFAULT_TYPES = ['Gesetzgebung', 'Antrag'];

let procedures: MockProcedure[] = [];

export const resetDb = () => {
  procedures = structuredClone(fixtures) as MockProcedure[];
};
resetDb();

export const getProcedure = (procedureId: string) => procedures.find((p) => p.procedureId === procedureId) ?? null;

export const listProcedures = ({
  period,
  type = DEFAULT_TYPES,
  manageVoteDate = false,
  limit = 99999,
  offset = 0,
}: {
  period: number[];
  type?: string[];
  manageVoteDate?: boolean;
  limit?: number;
  offset?: number;
}) => {
  const now = new Date();
  const matches = procedures.filter((p) => {
    if (!period.includes(p.period) || !type.includes(p.type)) return false;
    if (!manageVoteDate) return true;
    // like the API: no yes votes yet, vote date reached, not closed
    const noYes = !((p.customData?.voteResults?.yes ?? 0) >= 1);
    const due = p.voteDate !== null && new Date(p.voteDate) <= now;
    return noYes && due && !CLOSED.includes(p.currentStatus);
  });
  return { totalCount: matches.length, nodes: matches.slice(offset, offset + limit) };
};

// REST lists of the procedures service: vote date passed or upcoming
export const listByVoteDate = (when: 'past' | 'upcoming', page: number, limit: number) => {
  const now = Date.now();
  const matches = procedures
    .filter((p) => p.voteDate && (when === 'past' ? Date.parse(p.voteDate) <= now : Date.parse(p.voteDate) > now))
    // past: newest first, upcoming: next first
    .sort((a, b) => (Date.parse(b.voteDate!) - Date.parse(a.voteDate!)) * (when === 'past' ? 1 : -1));
  const start = (page - 1) * limit;
  return {
    count: matches.length,
    procedures: matches.slice(start, start + limit).map((p) => ({ ...p, id: p._id })),
  };
};

export const saveCustomData = ({
  procedureId,
  partyVotes,
  decisionText,
  votingDocument,
  toggleDecision,
}: {
  procedureId: string;
  partyVotes: PartyVote[];
  decisionText: string;
  votingDocument: string;
  toggleDecision: boolean;
}) => {
  const procedure = getProcedure(procedureId);
  if (!procedure) throw new Error(`Procedure ${procedureId} not found`);

  let voteResults: VoteResults = { partyVotes, decisionText: decisionText.trim(), votingDocument };
  const seats = DEPUTIES[procedure.period];
  if (seats) {
    const sum = { yes: 0, abstination: 0, no: 0 };
    const counted = partyVotes.map(({ party, main, deviants: given }) => {
      const deviants = { yes: 0, abstination: 0, no: 0, ...given };
      const total = seats[party] ?? 0;
      if (main === 'YES') deviants.yes = total - deviants.abstination - deviants.no;
      if (main === 'ABSTINATION') deviants.abstination = total - deviants.yes - deviants.no;
      if (main === 'NO') deviants.no = total - deviants.yes - deviants.abstination;
      sum.yes += deviants.yes;
      sum.abstination += deviants.abstination;
      sum.no += deviants.no;
      return { party, main, deviants };
    });
    voteResults = { ...voteResults, partyVotes: counted, ...sum, votingRecommendation: toggleDecision };
  }
  // the API replaces the whole object, so does the mock
  procedure.customData = { voteResults };
  return procedure;
};

export const saveNamedPollCustomData = ({ procedureId, toggleDecision }: { procedureId: string; toggleDecision: boolean }) => {
  const procedure = getProcedure(procedureId);
  if (!procedure) throw new Error(`Procedure ${procedureId} not found`);
  procedure.customData.voteResults.votingRecommendation = toggleDecision;
  return procedure;
};
