/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
  VotingDocument,
  VoteDecision,
} from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: ProcedureUpdates
// ====================================================

export interface ProcedureUpdates_procedureUpdates_procedures_history_decision {
  __typename: "Decision";
  tenor: string | null;
  type: string | null;
  comment: string | null;
}

export interface ProcedureUpdates_procedureUpdates_procedures_history {
  __typename: "ProcessFlow";
  assignment: string | null;
  initiator: string | null;
  decision:
    | (ProcedureUpdates_procedureUpdates_procedures_history_decision | null)[]
    | null;
  date: any | null;
}

export interface ProcedureUpdates_procedureUpdates_procedures_importantDocuments {
  __typename: "Document";
  editor: string | null;
  type: string | null;
  url: string | null;
  number: string | null;
}

export interface ProcedureUpdates_procedureUpdates_procedures_customData_voteResults_partyVotes_deviants {
  __typename: "Deviants";
  yes: number | null;
  no: number | null;
  abstination: number | null;
  notVoted: number | null;
}

export interface ProcedureUpdates_procedureUpdates_procedures_customData_voteResults_partyVotes {
  __typename: "PartyVote";
  party: string;
  main: VoteDecision | null;
  deviants: ProcedureUpdates_procedureUpdates_procedures_customData_voteResults_partyVotes_deviants | null;
}

export interface ProcedureUpdates_procedureUpdates_procedures_customData_voteResults {
  __typename: "VoteResults";
  yes: number;
  no: number;
  abstination: number;
  notVoted: number | null;
  decisionText: string | null;
  votingDocument: VotingDocument | null;
  votingRecommendation: boolean | null;
  partyVotes:
    | (ProcedureUpdates_procedureUpdates_procedures_customData_voteResults_partyVotes | null)[]
    | null;
}

export interface ProcedureUpdates_procedureUpdates_procedures_customData {
  __typename: "ProcedureCustomData";
  voteResults: ProcedureUpdates_procedureUpdates_procedures_customData_voteResults | null;
}

export interface ProcedureUpdates_procedureUpdates_procedures_sessions_session_top_topic {
  __typename: "FilteredConferenceWeekDetailSessionTopTopic";
  isVote: boolean | null;
}

export interface ProcedureUpdates_procedureUpdates_procedures_sessions_session_top {
  __typename: "FilteredConferenceWeekDetailSessionTop";
  heading: string | null;
  topic: ProcedureUpdates_procedureUpdates_procedures_sessions_session_top_topic | null;
}

export interface ProcedureUpdates_procedureUpdates_procedures_sessions_session {
  __typename: "FilteredConferenceWeekDetailSession";
  top: ProcedureUpdates_procedureUpdates_procedures_sessions_session_top | null;
}

export interface ProcedureUpdates_procedureUpdates_procedures_sessions {
  __typename: "FilteredConferenceWeekDetail";
  thisYear: number;
  thisWeek: number;
  session: ProcedureUpdates_procedureUpdates_procedures_sessions_session | null;
}

export interface ProcedureUpdates_procedureUpdates_procedures {
  __typename: "Procedure";
  title: string;
  procedureId: string | null;
  type: string | null;
  period: number | null;
  currentStatus: string | null;
  currentStatusHistory: (string | null)[] | null;
  abstract: string | null;
  tags: (string | null)[] | null;
  subjectGroups: (string | null)[] | null;
  history:
    | (ProcedureUpdates_procedureUpdates_procedures_history | null)[]
    | null;
  importantDocuments:
    | (ProcedureUpdates_procedureUpdates_procedures_importantDocuments | null)[]
    | null;
  namedVote: boolean | null;
  voteDate: any | null;
  voteEnd: any | null;
  customData: ProcedureUpdates_procedureUpdates_procedures_customData | null;
  sessions:
    | (ProcedureUpdates_procedureUpdates_procedures_sessions | null)[]
    | null;
}

export interface ProcedureUpdates_procedureUpdates {
  __typename: "ProcedureUpdate";
  beforeCount: number;
  afterCount: number;
  newCount: number | null;
  changedCount: number | null;
  procedures: (ProcedureUpdates_procedureUpdates_procedures | null)[] | null;
}

export interface ProcedureUpdates {
  procedureUpdates: ProcedureUpdates_procedureUpdates | null;
}

export interface ProcedureUpdatesVariables {
  since: any;
  limit?: number | null;
  offset?: number | null;
  periods?: number[] | null;
  types?: string[] | null;
}
