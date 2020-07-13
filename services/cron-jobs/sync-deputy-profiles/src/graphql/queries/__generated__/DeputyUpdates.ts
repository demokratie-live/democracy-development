/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: DeputyUpdates
// ====================================================

export interface DeputyUpdates_deputyUpdates_deputies_links {
  __typename: "DeputyLink";
  name: string;
  URL: string;
  username: string | null;
}

export interface DeputyUpdates_deputyUpdates_deputies {
  __typename: "Deputy";
  webId: string | null;
  imgURL: string | null;
  name: string;
  party: string | null;
  job: string | null;
  biography: (string | null)[] | null;
  constituency: string | null;
  directCandidate: boolean | null;
  office: (string | null)[] | null;
  links: DeputyUpdates_deputyUpdates_deputies_links[];
}

export interface DeputyUpdates_deputyUpdates {
  __typename: "DeputyUpdate";
  beforeCount: number;
  afterCount: number;
  newCount: number | null;
  changedCount: number | null;
  deputies: (DeputyUpdates_deputyUpdates_deputies | null)[] | null;
}

export interface DeputyUpdates {
  deputyUpdates: DeputyUpdates_deputyUpdates | null;
}

export interface DeputyUpdatesVariables {
  since: any;
  limit?: number | null;
  offset?: number | null;
}
