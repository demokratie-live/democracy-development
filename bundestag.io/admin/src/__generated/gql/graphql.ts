/* eslint-disable */
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
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
  Date: { input: any; output: any; }
};

export type ConferenceWeekDetail = {
  __typename?: 'ConferenceWeekDetail';
  URL?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  nextWeek?: Maybe<Scalars['Int']['output']>;
  nextYear?: Maybe<Scalars['Int']['output']>;
  previousWeek?: Maybe<Scalars['Int']['output']>;
  previousYear?: Maybe<Scalars['Int']['output']>;
  sessions?: Maybe<Array<Maybe<ConferenceWeekDetailSession>>>;
  thisWeek: Scalars['Int']['output'];
  thisYear: Scalars['Int']['output'];
};

export type ConferenceWeekDetailSession = {
  __typename?: 'ConferenceWeekDetailSession';
  date?: Maybe<Scalars['Date']['output']>;
  dateText?: Maybe<Scalars['String']['output']>;
  session?: Maybe<Scalars['String']['output']>;
  tops?: Maybe<Array<Maybe<ConferenceWeekDetailSessionTop>>>;
};

export type ConferenceWeekDetailSessionTop = {
  __typename?: 'ConferenceWeekDetailSessionTop';
  article?: Maybe<Scalars['String']['output']>;
  heading?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Array<Maybe<ConferenceWeekDetailSessionTopStatus>>>;
  time?: Maybe<Scalars['Date']['output']>;
  top?: Maybe<Scalars['String']['output']>;
  topic?: Maybe<Array<Maybe<ConferenceWeekDetailSessionTopTopic>>>;
};

export type ConferenceWeekDetailSessionTopStatus = {
  __typename?: 'ConferenceWeekDetailSessionTopStatus';
  documents?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  line?: Maybe<Scalars['String']['output']>;
};

export type ConferenceWeekDetailSessionTopTopic = {
  __typename?: 'ConferenceWeekDetailSessionTopTopic';
  documents?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  isVote?: Maybe<Scalars['Boolean']['output']>;
  lines?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  procedureIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type Decision = {
  __typename?: 'Decision';
  comment?: Maybe<Scalars['String']['output']>;
  document?: Maybe<Scalars['String']['output']>;
  foundation?: Maybe<Scalars['String']['output']>;
  majority?: Maybe<Scalars['String']['output']>;
  page?: Maybe<Scalars['String']['output']>;
  tenor?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type Deputy = {
  __typename?: 'Deputy';
  URL: Scalars['String']['output'];
  biography?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  constituency?: Maybe<Scalars['String']['output']>;
  constituencyName?: Maybe<Scalars['String']['output']>;
  directCandidate?: Maybe<Scalars['Boolean']['output']>;
  functions?: Maybe<Array<Maybe<DeputyFunctions>>>;
  imgURL?: Maybe<Scalars['String']['output']>;
  job?: Maybe<Scalars['String']['output']>;
  links: Array<DeputyLink>;
  name: Scalars['String']['output'];
  office?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  party?: Maybe<Scalars['String']['output']>;
  period: Scalars['Int']['output'];
  publicationRequirement?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  speechesURL?: Maybe<Scalars['String']['output']>;
  votesURL?: Maybe<Scalars['String']['output']>;
  webId?: Maybe<Scalars['String']['output']>;
};

export type DeputyFunctions = {
  __typename?: 'DeputyFunctions';
  category?: Maybe<Scalars['String']['output']>;
  functions?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type DeputyLink = {
  __typename?: 'DeputyLink';
  URL: Scalars['String']['output'];
  name: Scalars['String']['output'];
  username?: Maybe<Scalars['String']['output']>;
};

export type DeputyUpdate = {
  __typename?: 'DeputyUpdate';
  afterCount: Scalars['Int']['output'];
  beforeCount: Scalars['Int']['output'];
  changedCount?: Maybe<Scalars['Int']['output']>;
  deputies?: Maybe<Array<Maybe<Deputy>>>;
  newCount?: Maybe<Scalars['Int']['output']>;
};

export type Deviants = {
  __typename?: 'Deviants';
  abstination?: Maybe<Scalars['Int']['output']>;
  no?: Maybe<Scalars['Int']['output']>;
  notVoted?: Maybe<Scalars['Int']['output']>;
  yes?: Maybe<Scalars['Int']['output']>;
};

export type DeviantsInput = {
  abstination?: InputMaybe<Scalars['Int']['input']>;
  no?: InputMaybe<Scalars['Int']['input']>;
  notVoted?: InputMaybe<Scalars['Int']['input']>;
  yes?: InputMaybe<Scalars['Int']['input']>;
};

export type Document = {
  __typename?: 'Document';
  editor?: Maybe<Scalars['String']['output']>;
  number?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type FilteredConferenceWeekDetail = {
  __typename?: 'FilteredConferenceWeekDetail';
  URL?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  nextWeek?: Maybe<Scalars['Int']['output']>;
  nextYear?: Maybe<Scalars['Int']['output']>;
  previousWeek?: Maybe<Scalars['Int']['output']>;
  previousYear?: Maybe<Scalars['Int']['output']>;
  session?: Maybe<FilteredConferenceWeekDetailSession>;
  thisWeek: Scalars['Int']['output'];
  thisYear: Scalars['Int']['output'];
};

export type FilteredConferenceWeekDetailSession = {
  __typename?: 'FilteredConferenceWeekDetailSession';
  date?: Maybe<Scalars['Date']['output']>;
  dateText?: Maybe<Scalars['String']['output']>;
  session?: Maybe<Scalars['String']['output']>;
  top?: Maybe<FilteredConferenceWeekDetailSessionTop>;
};

export type FilteredConferenceWeekDetailSessionTop = {
  __typename?: 'FilteredConferenceWeekDetailSessionTop';
  article?: Maybe<Scalars['String']['output']>;
  heading?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Array<Maybe<ConferenceWeekDetailSessionTopStatus>>>;
  time?: Maybe<Scalars['Date']['output']>;
  top?: Maybe<Scalars['String']['output']>;
  topic?: Maybe<FilteredConferenceWeekDetailSessionTopTopic>;
};

export type FilteredConferenceWeekDetailSessionTopTopic = {
  __typename?: 'FilteredConferenceWeekDetailSessionTopTopic';
  documents?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  isVote?: Maybe<Scalars['Boolean']['output']>;
  lines?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  procedureId?: Maybe<Scalars['String']['output']>;
};

export type LegislativePeriod = {
  __typename?: 'LegislativePeriod';
  deputies: Scalars['Int']['output'];
  end?: Maybe<Scalars['Date']['output']>;
  number: Scalars['Int']['output'];
  start: Scalars['Date']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  saveProcedureCustomData?: Maybe<Procedure>;
  saveProcedurenamedPollCustomData?: Maybe<Procedure>;
  scrapeProcedures?: Maybe<Scalars['Boolean']['output']>;
  signIn?: Maybe<User>;
};


export type MutationSaveProcedureCustomDataArgs = {
  decisionText: Scalars['String']['input'];
  partyVotes: Array<PartyVoteInput>;
  procedureId: Scalars['String']['input'];
  toggleDecision: Scalars['Boolean']['input'];
  votingDocument: VotingDocument;
};


export type MutationSaveProcedurenamedPollCustomDataArgs = {
  procedureId: Scalars['String']['input'];
  toggleDecision: Scalars['Boolean']['input'];
};


export type MutationScrapeProceduresArgs = {
  key: Scalars['String']['input'];
};


export type MutationSignInArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type NamedPoll = {
  __typename?: 'NamedPoll';
  URL: Scalars['String']['output'];
  _id: Scalars['ID']['output'];
  date?: Maybe<Scalars['Date']['output']>;
  deputyVotesURL?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  detailedDescription?: Maybe<Scalars['String']['output']>;
  documents?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  media?: Maybe<NamedPollMedia>;
  plenarProtocolURL?: Maybe<Scalars['String']['output']>;
  procedureId?: Maybe<Scalars['String']['output']>;
  speeches?: Maybe<Array<Maybe<NamedPollSpeech>>>;
  title?: Maybe<Scalars['String']['output']>;
  votes?: Maybe<NamedPollVotes>;
  webId: Scalars['String']['output'];
};

export type NamedPollDeputy = {
  __typename?: 'NamedPollDeputy';
  URL?: Maybe<Scalars['String']['output']>;
  imgURL?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  party?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  vote?: Maybe<Scalars['String']['output']>;
  webId?: Maybe<Scalars['String']['output']>;
};

export type NamedPollMedia = {
  __typename?: 'NamedPollMedia';
  iTunesURL?: Maybe<Scalars['String']['output']>;
  mediathekURL?: Maybe<Scalars['String']['output']>;
  videoURLs?: Maybe<Array<Maybe<NamedPollMediaVideoUrl>>>;
};

export type NamedPollMediaVideoUrl = {
  __typename?: 'NamedPollMediaVideoURL';
  URL?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
};

export type NamedPollSpeech = {
  __typename?: 'NamedPollSpeech';
  deputyImgURL?: Maybe<Scalars['String']['output']>;
  deputyName?: Maybe<Scalars['String']['output']>;
  function?: Maybe<Scalars['String']['output']>;
  mediathekURL?: Maybe<Scalars['String']['output']>;
  party?: Maybe<Scalars['String']['output']>;
};

export type NamedPollUpdate = {
  __typename?: 'NamedPollUpdate';
  afterCount: Scalars['Int']['output'];
  beforeCount: Scalars['Int']['output'];
  changedCount?: Maybe<Scalars['Int']['output']>;
  namedPolls?: Maybe<Array<Maybe<NamedPoll>>>;
  newCount?: Maybe<Scalars['Int']['output']>;
};

export type NamedPollVotes = {
  __typename?: 'NamedPollVotes';
  all?: Maybe<NamedPollVotesVotes>;
  deputies?: Maybe<Array<Maybe<NamedPollDeputy>>>;
  inverseVoteDirection?: Maybe<Scalars['Boolean']['output']>;
  parties?: Maybe<Array<Maybe<NamedPollVotesParty>>>;
};

export type NamedPollVotesParty = {
  __typename?: 'NamedPollVotesParty';
  name?: Maybe<Scalars['String']['output']>;
  votes?: Maybe<NamedPollVotesVotes>;
};

export type NamedPollVotesVotes = {
  __typename?: 'NamedPollVotesVotes';
  abstain?: Maybe<Scalars['Int']['output']>;
  na?: Maybe<Scalars['Int']['output']>;
  no?: Maybe<Scalars['Int']['output']>;
  total?: Maybe<Scalars['Int']['output']>;
  yes?: Maybe<Scalars['Int']['output']>;
};

export type PartyVote = {
  __typename?: 'PartyVote';
  deviants?: Maybe<Deviants>;
  main?: Maybe<VoteDecision>;
  party: Scalars['String']['output'];
};

export type PartyVoteInput = {
  deviants?: InputMaybe<DeviantsInput>;
  main?: InputMaybe<VoteDecision>;
  party: Scalars['String']['input'];
};

export type Procedure = {
  __typename?: 'Procedure';
  _id: Scalars['ID']['output'];
  abstract?: Maybe<Scalars['String']['output']>;
  approvalRequired?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  currentStatus?: Maybe<Scalars['String']['output']>;
  currentStatusHistory?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  customData?: Maybe<ProcedureCustomData>;
  euDocNr?: Maybe<Scalars['String']['output']>;
  gestOrderNumber?: Maybe<Scalars['String']['output']>;
  history?: Maybe<Array<Maybe<ProcessFlow>>>;
  importantDocuments?: Maybe<Array<Maybe<Document>>>;
  legalValidity?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  namedVote?: Maybe<Scalars['Boolean']['output']>;
  period?: Maybe<Scalars['Int']['output']>;
  procedureId?: Maybe<Scalars['String']['output']>;
  promulgation?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  sessions?: Maybe<Array<Maybe<FilteredConferenceWeekDetail>>>;
  signature?: Maybe<Scalars['String']['output']>;
  subjectGroups?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  title: Scalars['String']['output'];
  type?: Maybe<Scalars['String']['output']>;
  voteDate?: Maybe<Scalars['Date']['output']>;
  voteEnd?: Maybe<Scalars['Date']['output']>;
};

export type ProcedureCustomData = {
  __typename?: 'ProcedureCustomData';
  title?: Maybe<Scalars['String']['output']>;
  voteResults?: Maybe<VoteResults>;
};

export type ProcedureUpdate = {
  __typename?: 'ProcedureUpdate';
  afterCount: Scalars['Int']['output'];
  beforeCount: Scalars['Int']['output'];
  changedCount?: Maybe<Scalars['Int']['output']>;
  newCount?: Maybe<Scalars['Int']['output']>;
  procedures?: Maybe<Array<Maybe<Procedure>>>;
};

export type ProceduresData = {
  __typename?: 'ProceduresData';
  nodes: Array<Procedure>;
  totalCount: Scalars['Int']['output'];
};

export type ProcessFlow = {
  __typename?: 'ProcessFlow';
  assignment?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['Date']['output']>;
  decision?: Maybe<Array<Maybe<Decision>>>;
  findSpot?: Maybe<Scalars['String']['output']>;
  findSpotUrl?: Maybe<Scalars['String']['output']>;
  initiator?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  allProcedures?: Maybe<Array<Maybe<Procedure>>>;
  conferenceWeekDetail?: Maybe<ConferenceWeekDetail>;
  conferenceWeekDetails?: Maybe<Array<Maybe<ConferenceWeekDetail>>>;
  deputies?: Maybe<Array<Maybe<Deputy>>>;
  deputy?: Maybe<Deputy>;
  deputyUpdates?: Maybe<DeputyUpdate>;
  legislativePeriod?: Maybe<LegislativePeriod>;
  legislativePeriods?: Maybe<Array<Maybe<LegislativePeriod>>>;
  namedPoll?: Maybe<NamedPoll>;
  namedPollUpdates?: Maybe<NamedPollUpdate>;
  namedPolls?: Maybe<Array<Maybe<NamedPoll>>>;
  procedure?: Maybe<Procedure>;
  procedureUpdates?: Maybe<ProcedureUpdate>;
  procedures?: Maybe<Array<Maybe<Procedure>>>;
  proceduresData: ProceduresData;
  voteResultTextHelper?: Maybe<Array<VoteResultTexts>>;
};


export type QueryAllProceduresArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  period?: InputMaybe<Array<Scalars['Int']['input']>>;
  type?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryConferenceWeekDetailArgs = {
  week: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
};


export type QueryConferenceWeekDetailsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryDeputiesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryDeputyArgs = {
  webId: Scalars['String']['input'];
};


export type QueryDeputyUpdatesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  since: Scalars['Date']['input'];
};


export type QueryLegislativePeriodArgs = {
  period: Scalars['Int']['input'];
};


export type QueryNamedPollArgs = {
  webId: Scalars['String']['input'];
};


export type QueryNamedPollUpdatesArgs = {
  associated?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  since: Scalars['Date']['input'];
};


export type QueryNamedPollsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryProcedureArgs = {
  procedureId: Scalars['String']['input'];
};


export type QueryProcedureUpdatesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  periods?: InputMaybe<Array<Scalars['Int']['input']>>;
  since: Scalars['Date']['input'];
  types?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryProceduresArgs = {
  IDs?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  manageVoteDate?: InputMaybe<Scalars['Boolean']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  period?: InputMaybe<Array<Scalars['Int']['input']>>;
  status?: InputMaybe<Array<Scalars['String']['input']>>;
  type?: InputMaybe<Array<Scalars['String']['input']>>;
  voteDate?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};


export type QueryProceduresDataArgs = {
  IDs?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  manageVoteDate?: InputMaybe<Scalars['Boolean']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  period: Array<Scalars['Int']['input']>;
  status?: InputMaybe<Array<Scalars['String']['input']>>;
  type?: InputMaybe<Array<Scalars['String']['input']>>;
  voteDate?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};


export type QueryVoteResultTextHelperArgs = {
  procedureId: Scalars['String']['input'];
};

export enum Role {
  Backend = 'BACKEND',
  User = 'USER'
}

export type Schema = {
  __typename?: 'Schema';
  query?: Maybe<Query>;
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  jwt?: Maybe<Scalars['String']['output']>;
  role?: Maybe<UserRole>;
};

export enum UserRole {
  Backend = 'BACKEND',
  Web = 'WEB'
}

export enum VoteDecision {
  Abstination = 'ABSTINATION',
  No = 'NO',
  Notvoted = 'NOTVOTED',
  Yes = 'YES'
}

export type VoteResultTexts = {
  __typename?: 'VoteResultTexts';
  results: Array<Scalars['String']['output']>;
};

export type VoteResults = {
  __typename?: 'VoteResults';
  abstination?: Maybe<Scalars['Int']['output']>;
  decisionText?: Maybe<Scalars['String']['output']>;
  no?: Maybe<Scalars['Int']['output']>;
  notVoted?: Maybe<Scalars['Int']['output']>;
  partyVotes?: Maybe<Array<Maybe<PartyVote>>>;
  votingDocument?: Maybe<VotingDocument>;
  votingRecommendation?: Maybe<Scalars['Boolean']['output']>;
  yes?: Maybe<Scalars['Int']['output']>;
};

export enum VotingDocument {
  MainDocument = 'mainDocument',
  RecommendedDecision = 'recommendedDecision'
}

export type LegislativePeriodsQueryVariables = Exact<{ [key: string]: never; }>;


export type LegislativePeriodsQuery = { __typename?: 'Query', legislativePeriods?: Array<{ __typename?: 'LegislativePeriod', number: number, deputies: number, start: any, end?: any | null } | null> | null };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: DocumentTypeDecoration<TResult, TVariables>['__apiType'];

  constructor(private value: string, public __meta__?: Record<string, any>) {
    super(value);
  }

  toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const LegislativePeriodsDocument = new TypedDocumentString(`
    query LegislativePeriods {
  legislativePeriods {
    number
    deputies
    start
    end
  }
}
    `) as unknown as TypedDocumentString<LegislativePeriodsQuery, LegislativePeriodsQueryVariables>;