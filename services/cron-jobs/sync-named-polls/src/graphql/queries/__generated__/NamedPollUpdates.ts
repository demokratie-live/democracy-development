/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: NamedPollUpdates
// ====================================================

export interface NamedPollUpdates_namedPollUpdates_namedPolls_votes_deputies {
  __typename: "NamedPollDeputy";
  webId: string | null;
  vote: string | null;
}

export interface NamedPollUpdates_namedPollUpdates_namedPolls_votes {
  __typename: "NamedPollVotes";
  deputies: (NamedPollUpdates_namedPollUpdates_namedPolls_votes_deputies | null)[] | null;
  inverseVoteDirection: boolean | null;
}

export interface NamedPollUpdates_namedPollUpdates_namedPolls {
  __typename: "NamedPoll";
  procedureId: string | null;
  votes: NamedPollUpdates_namedPollUpdates_namedPolls_votes | null;
}

export interface NamedPollUpdates_namedPollUpdates {
  __typename: "NamedPollUpdate";
  beforeCount: number;
  afterCount: number;
  newCount: number | null;
  changedCount: number | null;
  namedPolls: (NamedPollUpdates_namedPollUpdates_namedPolls | null)[] | null;
}

export interface NamedPollUpdates {
  namedPollUpdates: NamedPollUpdates_namedPollUpdates | null;
}

export interface NamedPollUpdatesVariables {
  since: any;
  limit?: number | null;
  offset?: number | null;
  associated?: boolean | null;
}
