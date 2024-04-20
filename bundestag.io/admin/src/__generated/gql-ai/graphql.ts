/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Input = {
  __typename?: 'Input';
  decision?: Maybe<Scalars['String']['output']>;
  period?: Maybe<Scalars['Int']['output']>;
};

export type ProcessResult = {
  __typename?: 'ProcessResult';
  input?: Maybe<Input>;
  result?: Maybe<Result>;
  usage?: Maybe<ProcessUsage>;
};

export type ProcessUsage = {
  __typename?: 'ProcessUsage';
  costs?: Maybe<Usage>;
  duration?: Maybe<Scalars['String']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  tokens?: Maybe<Usage>;
};

export type Query = {
  __typename?: 'Query';
  parseDecision?: Maybe<ProcessResult>;
};


export type QueryParseDecisionArgs = {
  decision?: InputMaybe<Scalars['String']['input']>;
  period?: InputMaybe<Scalars['Int']['input']>;
};

export type Result = {
  __typename?: 'Result';
  votes?: Maybe<Array<Maybe<Vote>>>;
  votingDocument?: Maybe<VoteDocument>;
  votingRecommendation?: Maybe<VotingRecommendation>;
};

export type Usage = {
  __typename?: 'Usage';
  completion?: Maybe<Scalars['Float']['output']>;
  prompt?: Maybe<Scalars['Float']['output']>;
  total?: Maybe<Scalars['Float']['output']>;
};

export type Vote = {
  __typename?: 'Vote';
  name?: Maybe<Scalars['String']['output']>;
  vote?: Maybe<VoteResult>;
};

export enum VoteDocument {
  MainDocument = 'mainDocument',
  RecommendedDecision = 'recommendedDecision'
}

export enum VoteResult {
  Abstination = 'ABSTINATION',
  Mixed = 'MIXED',
  No = 'NO',
  Yes = 'YES'
}

export enum VotingRecommendation {
  Accept = 'ACCEPT',
  Reject = 'REJECT',
  Unknown = 'UNKNOWN'
}

export type ParseDecisionQueryVariables = Exact<{
  decision?: InputMaybe<Scalars['String']['input']>;
  period?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ParseDecisionQuery = { __typename?: 'Query', parseDecision?: { __typename?: 'ProcessResult', input?: { __typename?: 'Input', decision?: string | null, period?: number | null } | null, result?: { __typename?: 'Result', votingDocument?: VoteDocument | null, votingRecommendation?: VotingRecommendation | null, votes?: Array<{ __typename?: 'Vote', name?: string | null, vote?: VoteResult | null } | null> | null } | null, usage?: { __typename?: 'ProcessUsage', duration?: string | null, model?: string | null, costs?: { __typename?: 'Usage', completion?: number | null, prompt?: number | null, total?: number | null } | null, tokens?: { __typename?: 'Usage', completion?: number | null, prompt?: number | null, total?: number | null } | null } | null } | null };


export const ParseDecisionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ParseDecision"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"decision"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"period"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"parseDecision"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"decision"},"value":{"kind":"Variable","name":{"kind":"Name","value":"decision"}}},{"kind":"Argument","name":{"kind":"Name","value":"period"},"value":{"kind":"Variable","name":{"kind":"Name","value":"period"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"input"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"decision"}},{"kind":"Field","name":{"kind":"Name","value":"period"}}]}},{"kind":"Field","name":{"kind":"Name","value":"result"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"votes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"vote"}}]}},{"kind":"Field","name":{"kind":"Name","value":"votingDocument"}},{"kind":"Field","name":{"kind":"Name","value":"votingRecommendation"}}]}},{"kind":"Field","name":{"kind":"Name","value":"usage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"costs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completion"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"tokens"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completion"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ParseDecisionQuery, ParseDecisionQueryVariables>;