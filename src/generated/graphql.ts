import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { IDeputy, IProcedure } from '@democracy-deutschland/democracy-common';
import { GraphQlContext } from '../types/graphqlContext';
import { DeepPartial } from 'utility-types';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: any; output: any; }
};

export type Query = {
  __typename?: 'Query';
  activityIndex?: Maybe<ActivityIndex>;
  communityVotes?: Maybe<CommunityVotes>;
  currentConferenceWeek: ConferenceWeek;
  deputies: DeputiesResult;
  deputiesOfConstituency: Array<Deputy>;
  deputy?: Maybe<Deputy>;
  me?: Maybe<User>;
  mostSearched: Array<SearchTerm>;
  notificationSettings?: Maybe<NotificationSettings>;
  notifiedProcedures: Array<Procedure>;
  procedure: Procedure;
  procedures: Array<Procedure>;
  proceduresById: Array<Procedure>;
  proceduresByIdHavingVoteResults: ProceduresHavingVoteResults;
  proceduresWithVoteResults: Array<Procedure>;
  recommendedProcedures: RecommendedProceduresResult;
  /** @deprecated use searchProceduresAutocomplete */
  searchProcedures: Array<Procedure>;
  searchProceduresAutocomplete: SearchProcedures;
  showRecommendations: Scalars['Boolean']['output'];
  votedProcedures: Array<Procedure>;
  votes?: Maybe<Vote>;
  voteStatistic?: Maybe<VoteStatistic>;
};


export type QueryActivityIndexArgs = {
  procedureId: Scalars['String']['input'];
};


export type QueryCommunityVotesArgs = {
  constituencies?: InputMaybe<Array<Scalars['String']['input']>>;
  procedure: Scalars['ID']['input'];
};


export type QueryDeputiesArgs = {
  excludeIds?: InputMaybe<Array<Scalars['String']['input']>>;
  filterConstituency?: InputMaybe<Scalars['String']['input']>;
  filterIds?: InputMaybe<Array<Scalars['String']['input']>>;
  filterTerm?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  period?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryDeputiesOfConstituencyArgs = {
  constituency: Scalars['String']['input'];
  directCandidate?: InputMaybe<Scalars['Boolean']['input']>;
  period?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryDeputyArgs = {
  id: Scalars['String']['input'];
};


export type QueryProcedureArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProceduresArgs = {
  filter?: InputMaybe<ProcedureFilter>;
  listTypes?: InputMaybe<Array<ListType>>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  period?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<ProcedureType>;
};


export type QueryProceduresByIdArgs = {
  ids: Array<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryProceduresByIdHavingVoteResultsArgs = {
  filter?: InputMaybe<ProcedureWomFilter>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  period?: InputMaybe<Scalars['Int']['input']>;
  procedureIds?: InputMaybe<Array<Scalars['String']['input']>>;
  timespan?: InputMaybe<VotedTimeSpan>;
};


export type QueryProceduresWithVoteResultsArgs = {
  procedureIds: Array<Scalars['String']['input']>;
};


export type QueryRecommendedProceduresArgs = {
  period?: InputMaybe<Scalars['Int']['input']>;
};


export type QuerySearchProceduresArgs = {
  term: Scalars['String']['input'];
};


export type QuerySearchProceduresAutocompleteArgs = {
  period?: InputMaybe<Scalars['Int']['input']>;
  term: Scalars['String']['input'];
};


export type QueryShowRecommendationsArgs = {
  period?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryVotesArgs = {
  constituencies?: InputMaybe<Array<Scalars['String']['input']>>;
  procedure: Scalars['ID']['input'];
};

export type ActivityIndex = {
  __typename?: 'ActivityIndex';
  active?: Maybe<Scalars['Boolean']['output']>;
  activityIndex: Scalars['Int']['output'];
};

export type CommunityVotes = {
  __typename?: 'CommunityVotes';
  abstination: Scalars['Int']['output'];
  constituencies: Array<CommunityConstituencyVotes>;
  no: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  yes: Scalars['Int']['output'];
};

export type CommunityConstituencyVotes = {
  __typename?: 'CommunityConstituencyVotes';
  abstination: Scalars['Int']['output'];
  constituency: Scalars['String']['output'];
  no: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  yes: Scalars['Int']['output'];
};

export type ConferenceWeek = {
  __typename?: 'ConferenceWeek';
  calendarWeek: Scalars['Int']['output'];
  end: Scalars['Date']['output'];
  start: Scalars['Date']['output'];
};

export type DeputiesResult = {
  __typename?: 'DeputiesResult';
  data: Array<Deputy>;
  hasMore: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

export type Deputy = {
  __typename?: 'Deputy';
  _id: Scalars['ID']['output'];
  biography?: Maybe<Scalars['String']['output']>;
  constituency?: Maybe<Scalars['String']['output']>;
  contact?: Maybe<DeputyContact>;
  directCandidate?: Maybe<Scalars['Boolean']['output']>;
  imgURL: Scalars['String']['output'];
  job?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  party?: Maybe<Scalars['String']['output']>;
  period: Scalars['Int']['output'];
  procedures: Array<DeputyProcedure>;
  totalProcedures?: Maybe<Scalars['Int']['output']>;
  webId: Scalars['String']['output'];
};


export type DeputyProceduresArgs = {
  offset?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  procedureIds?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type DeputyContact = {
  __typename?: 'DeputyContact';
  address?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  links: Array<DeputyLink>;
};

export type DeputyLink = {
  __typename?: 'DeputyLink';
  name: Scalars['String']['output'];
  URL: Scalars['String']['output'];
  username?: Maybe<Scalars['String']['output']>;
};

export type DeputyProcedure = {
  __typename?: 'DeputyProcedure';
  decision: VoteSelection;
  procedure: Procedure;
};

export enum VoteSelection {
  Abstination = 'ABSTINATION',
  No = 'NO',
  Notvoted = 'NOTVOTED',
  Yes = 'YES'
}

export type Procedure = {
  __typename?: 'Procedure';
  _id: Scalars['ID']['output'];
  abstract?: Maybe<Scalars['String']['output']>;
  activityIndex: ActivityIndex;
  communityVotes?: Maybe<CommunityVotes>;
  completed?: Maybe<Scalars['Boolean']['output']>;
  currentStatus?: Maybe<Scalars['String']['output']>;
  currentStatusHistory: Array<Scalars['String']['output']>;
  importantDocuments: Array<Document>;
  list?: Maybe<ListType>;
  /** @deprecated Use listTypes instead of type */
  listType?: Maybe<ProcedureType>;
  notify?: Maybe<Scalars['Boolean']['output']>;
  period?: Maybe<Scalars['Int']['output']>;
  procedureId: Scalars['String']['output'];
  sessionTOPHeading?: Maybe<Scalars['String']['output']>;
  subjectGroups: Array<Scalars['String']['output']>;
  submissionDate?: Maybe<Scalars['Date']['output']>;
  tags: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  verified?: Maybe<Scalars['Boolean']['output']>;
  voted: Scalars['Boolean']['output'];
  voteDate?: Maybe<Scalars['Date']['output']>;
  votedGovernment?: Maybe<Scalars['Boolean']['output']>;
  voteEnd?: Maybe<Scalars['Date']['output']>;
  voteResults?: Maybe<VoteResult>;
  votes: Scalars['Int']['output'];
  voteWeek?: Maybe<Scalars['Int']['output']>;
  voteYear?: Maybe<Scalars['Int']['output']>;
};


export type ProcedureCommunityVotesArgs = {
  constituencies?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type Document = {
  __typename?: 'Document';
  editor: Scalars['String']['output'];
  number: Scalars['String']['output'];
  type: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export enum ListType {
  ConferenceweeksPlanned = 'CONFERENCEWEEKS_PLANNED',
  Hot = 'HOT',
  InVote = 'IN_VOTE',
  Past = 'PAST',
  Preparation = 'PREPARATION',
  Top100 = 'TOP100'
}

export enum ProcedureType {
  /** @deprecated Use procedures Query param listTypes instead of type */
  Hot = 'HOT',
  /** @deprecated Use procedures Query param listTypes instead of type */
  InVote = 'IN_VOTE',
  /** @deprecated Use procedures Query param listTypes instead of type */
  Past = 'PAST',
  /** @deprecated Use procedures Query param listTypes instead of type */
  Preparation = 'PREPARATION',
  /** @deprecated Use procedures Query param listTypes instead of type */
  Voting = 'VOTING'
}

export type VoteResult = {
  __typename?: 'VoteResult';
  abstination: Scalars['Int']['output'];
  decisionText?: Maybe<Scalars['String']['output']>;
  deputyVotes: Array<DeputyVote>;
  governmentDecision: VoteSelection;
  namedVote: Scalars['Boolean']['output'];
  no: Scalars['Int']['output'];
  /** @deprecated No longer supported */
  notVote?: Maybe<Scalars['Int']['output']>;
  notVoted?: Maybe<Scalars['Int']['output']>;
  partyVotes: Array<PartyVote>;
  procedureId: Scalars['String']['output'];
  yes: Scalars['Int']['output'];
};


export type VoteResultDeputyVotesArgs = {
  constituencies?: InputMaybe<Array<Scalars['String']['input']>>;
  directCandidate?: InputMaybe<Scalars['Boolean']['input']>;
  webIds?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type DeputyVote = {
  __typename?: 'DeputyVote';
  decision: VoteSelection;
  deputy: Deputy;
};

export type PartyVote = {
  __typename?: 'PartyVote';
  deviants: Deviants;
  main: VoteSelection;
  party: Scalars['String']['output'];
};

export type Deviants = {
  __typename?: 'Deviants';
  abstination: Scalars['Int']['output'];
  no: Scalars['Int']['output'];
  notVoted?: Maybe<Scalars['Int']['output']>;
  yes: Scalars['Int']['output'];
};

export type User = {
  __typename?: 'User';
  _id: Scalars['String']['output'];
  /** @deprecated No longer supported */
  deviceHash?: Maybe<Scalars['String']['output']>;
  verified: Scalars['Boolean']['output'];
};

export type SearchTerm = {
  __typename?: 'SearchTerm';
  term: Scalars['String']['output'];
};

export type NotificationSettings = {
  __typename?: 'NotificationSettings';
  conferenceWeekPushs?: Maybe<Scalars['Boolean']['output']>;
  disableUntil?: Maybe<Scalars['Date']['output']>;
  enabled?: Maybe<Scalars['Boolean']['output']>;
  /** @deprecated <= 1.22 Notification Settings */
  newPreperation?: Maybe<Scalars['Boolean']['output']>;
  /** @deprecated <= 1.22 Notification Settings */
  newVote?: Maybe<Scalars['Boolean']['output']>;
  outcomePushs?: Maybe<Scalars['Boolean']['output']>;
  procedures?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  voteConferenceWeekPushs?: Maybe<Scalars['Boolean']['output']>;
  voteTOP100Pushs?: Maybe<Scalars['Boolean']['output']>;
};

export type ProcedureFilter = {
  activity?: InputMaybe<Array<Scalars['String']['input']>>;
  status?: InputMaybe<Array<Scalars['String']['input']>>;
  subjectGroups?: InputMaybe<Array<Scalars['String']['input']>>;
  type?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type ProcedureWomFilter = {
  subjectGroups: Array<Scalars['String']['input']>;
};

export enum VotedTimeSpan {
  CurrentQuarter = 'CurrentQuarter',
  CurrentSittingWeek = 'CurrentSittingWeek',
  CurrentYear = 'CurrentYear',
  LastQuarter = 'LastQuarter',
  LastSittingWeek = 'LastSittingWeek',
  LastYear = 'LastYear',
  Period = 'Period'
}

export type ProceduresHavingVoteResults = {
  __typename?: 'ProceduresHavingVoteResults';
  procedures: Array<Procedure>;
  total: Scalars['Int']['output'];
};

export type RecommendedProceduresResult = {
  __typename?: 'RecommendedProceduresResult';
  data: Array<RecommendationGroup>;
  hasMore: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

export type RecommendationGroup = {
  __typename?: 'RecommendationGroup';
  procedures: Array<Procedure>;
  title: Scalars['String']['output'];
};

export type SearchProcedures = {
  __typename?: 'SearchProcedures';
  autocomplete: Array<Scalars['String']['output']>;
  procedures: Array<Procedure>;
};

export type Vote = {
  __typename?: 'Vote';
  _id: Scalars['ID']['output'];
  voted: Scalars['Boolean']['output'];
  voteResults?: Maybe<CommunityVotes>;
};

export type VoteStatistic = {
  __typename?: 'VoteStatistic';
  proceduresCount: Scalars['Int']['output'];
  votedProcedures: Scalars['Int']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addToken: TokenResult;
  finishSearch: SearchTerm;
  increaseActivity?: Maybe<ActivityIndex>;
  requestCode: CodeResult;
  requestVerification: VerificationResult;
  signUp?: Maybe<Auth>;
  toggleNotification?: Maybe<Procedure>;
  updateNotificationSettings?: Maybe<NotificationSettings>;
  vote: Vote;
};


export type MutationAddTokenArgs = {
  os: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationFinishSearchArgs = {
  term: Scalars['String']['input'];
};


export type MutationIncreaseActivityArgs = {
  procedureId: Scalars['String']['input'];
};


export type MutationRequestCodeArgs = {
  newPhone: Scalars['String']['input'];
  oldPhoneHash?: InputMaybe<Scalars['String']['input']>;
};


export type MutationRequestVerificationArgs = {
  code: Scalars['String']['input'];
  newPhoneHash: Scalars['String']['input'];
  newUser?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationSignUpArgs = {
  deviceHashEncrypted: Scalars['String']['input'];
};


export type MutationToggleNotificationArgs = {
  procedureId: Scalars['String']['input'];
};


export type MutationUpdateNotificationSettingsArgs = {
  conferenceWeekPushs?: InputMaybe<Scalars['Boolean']['input']>;
  disableUntil?: InputMaybe<Scalars['Date']['input']>;
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  newPreperation?: InputMaybe<Scalars['Boolean']['input']>;
  newVote?: InputMaybe<Scalars['Boolean']['input']>;
  outcomePushs?: InputMaybe<Scalars['Boolean']['input']>;
  outcomePushsEnableOld?: InputMaybe<Scalars['Boolean']['input']>;
  procedures?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  voteConferenceWeekPushs?: InputMaybe<Scalars['Boolean']['input']>;
  voteTOP100Pushs?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationVoteArgs = {
  constituency?: InputMaybe<Scalars['String']['input']>;
  procedure: Scalars['ID']['input'];
  selection: VoteSelection;
};

export type TokenResult = {
  __typename?: 'TokenResult';
  succeeded?: Maybe<Scalars['Boolean']['output']>;
};

export type CodeResult = {
  __typename?: 'CodeResult';
  allowNewUser?: Maybe<Scalars['Boolean']['output']>;
  expireTime?: Maybe<Scalars['Date']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  resendTime?: Maybe<Scalars['Date']['output']>;
  succeeded: Scalars['Boolean']['output'];
};

export type VerificationResult = {
  __typename?: 'VerificationResult';
  reason?: Maybe<Scalars['String']['output']>;
  succeeded: Scalars['Boolean']['output'];
};

export type Auth = {
  __typename?: 'Auth';
  token: Scalars['String']['output'];
};

export type Device = {
  __typename?: 'Device';
  notificationSettings?: Maybe<NotificationSettings>;
};

export type Schema = {
  __typename?: 'Schema';
  query?: Maybe<Query>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<DeepPartial<Scalars['String']['output']>>;
  ActivityIndex: ResolverTypeWrapper<DeepPartial<ActivityIndex>>;
  Boolean: ResolverTypeWrapper<DeepPartial<Scalars['Boolean']['output']>>;
  Int: ResolverTypeWrapper<DeepPartial<Scalars['Int']['output']>>;
  ID: ResolverTypeWrapper<DeepPartial<Scalars['ID']['output']>>;
  CommunityVotes: ResolverTypeWrapper<DeepPartial<CommunityVotes>>;
  CommunityConstituencyVotes: ResolverTypeWrapper<DeepPartial<CommunityConstituencyVotes>>;
  ConferenceWeek: ResolverTypeWrapper<DeepPartial<ConferenceWeek>>;
  Date: ResolverTypeWrapper<DeepPartial<Scalars['Date']['output']>>;
  DeputiesResult: ResolverTypeWrapper<DeepPartial<Omit<DeputiesResult, 'data'> & { data: Array<ResolversTypes['Deputy']> }>>;
  Deputy: ResolverTypeWrapper<IDeputy>;
  DeputyContact: ResolverTypeWrapper<DeepPartial<DeputyContact>>;
  DeputyLink: ResolverTypeWrapper<DeepPartial<DeputyLink>>;
  DeputyProcedure: ResolverTypeWrapper<DeepPartial<Omit<DeputyProcedure, 'procedure'> & { procedure: ResolversTypes['Procedure'] }>>;
  VoteSelection: ResolverTypeWrapper<DeepPartial<VoteSelection>>;
  Procedure: ResolverTypeWrapper<IProcedure>;
  Document: ResolverTypeWrapper<DeepPartial<Document>>;
  ListType: ResolverTypeWrapper<DeepPartial<ListType>>;
  ProcedureType: ResolverTypeWrapper<DeepPartial<ProcedureType>>;
  VoteResult: ResolverTypeWrapper<DeepPartial<Omit<VoteResult, 'deputyVotes'> & { deputyVotes: Array<ResolversTypes['DeputyVote']> }>>;
  DeputyVote: ResolverTypeWrapper<DeepPartial<Omit<DeputyVote, 'deputy'> & { deputy: ResolversTypes['Deputy'] }>>;
  PartyVote: ResolverTypeWrapper<DeepPartial<PartyVote>>;
  Deviants: ResolverTypeWrapper<DeepPartial<Deviants>>;
  User: ResolverTypeWrapper<DeepPartial<User>>;
  SearchTerm: ResolverTypeWrapper<DeepPartial<SearchTerm>>;
  NotificationSettings: ResolverTypeWrapper<DeepPartial<NotificationSettings>>;
  ProcedureFilter: ResolverTypeWrapper<DeepPartial<ProcedureFilter>>;
  ProcedureWOMFilter: ResolverTypeWrapper<DeepPartial<ProcedureWomFilter>>;
  VotedTimeSpan: ResolverTypeWrapper<DeepPartial<VotedTimeSpan>>;
  ProceduresHavingVoteResults: ResolverTypeWrapper<DeepPartial<Omit<ProceduresHavingVoteResults, 'procedures'> & { procedures: Array<ResolversTypes['Procedure']> }>>;
  RecommendedProceduresResult: ResolverTypeWrapper<DeepPartial<Omit<RecommendedProceduresResult, 'data'> & { data: Array<ResolversTypes['RecommendationGroup']> }>>;
  RecommendationGroup: ResolverTypeWrapper<DeepPartial<Omit<RecommendationGroup, 'procedures'> & { procedures: Array<ResolversTypes['Procedure']> }>>;
  SearchProcedures: ResolverTypeWrapper<DeepPartial<Omit<SearchProcedures, 'procedures'> & { procedures: Array<ResolversTypes['Procedure']> }>>;
  Vote: ResolverTypeWrapper<DeepPartial<Vote>>;
  VoteStatistic: ResolverTypeWrapper<DeepPartial<VoteStatistic>>;
  Mutation: ResolverTypeWrapper<{}>;
  TokenResult: ResolverTypeWrapper<DeepPartial<TokenResult>>;
  CodeResult: ResolverTypeWrapper<DeepPartial<CodeResult>>;
  VerificationResult: ResolverTypeWrapper<DeepPartial<VerificationResult>>;
  Auth: ResolverTypeWrapper<DeepPartial<Auth>>;
  Device: ResolverTypeWrapper<DeepPartial<Device>>;
  Schema: ResolverTypeWrapper<DeepPartial<Omit<Schema, 'query'> & { query?: Maybe<ResolversTypes['Query']> }>>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {};
  String: DeepPartial<Scalars['String']['output']>;
  ActivityIndex: DeepPartial<ActivityIndex>;
  Boolean: DeepPartial<Scalars['Boolean']['output']>;
  Int: DeepPartial<Scalars['Int']['output']>;
  ID: DeepPartial<Scalars['ID']['output']>;
  CommunityVotes: DeepPartial<CommunityVotes>;
  CommunityConstituencyVotes: DeepPartial<CommunityConstituencyVotes>;
  ConferenceWeek: DeepPartial<ConferenceWeek>;
  Date: DeepPartial<Scalars['Date']['output']>;
  DeputiesResult: DeepPartial<Omit<DeputiesResult, 'data'> & { data: Array<ResolversParentTypes['Deputy']> }>;
  Deputy: IDeputy;
  DeputyContact: DeepPartial<DeputyContact>;
  DeputyLink: DeepPartial<DeputyLink>;
  DeputyProcedure: DeepPartial<Omit<DeputyProcedure, 'procedure'> & { procedure: ResolversParentTypes['Procedure'] }>;
  Procedure: IProcedure;
  Document: DeepPartial<Document>;
  VoteResult: DeepPartial<Omit<VoteResult, 'deputyVotes'> & { deputyVotes: Array<ResolversParentTypes['DeputyVote']> }>;
  DeputyVote: DeepPartial<Omit<DeputyVote, 'deputy'> & { deputy: ResolversParentTypes['Deputy'] }>;
  PartyVote: DeepPartial<PartyVote>;
  Deviants: DeepPartial<Deviants>;
  User: DeepPartial<User>;
  SearchTerm: DeepPartial<SearchTerm>;
  NotificationSettings: DeepPartial<NotificationSettings>;
  ProcedureFilter: DeepPartial<ProcedureFilter>;
  ProcedureWOMFilter: DeepPartial<ProcedureWomFilter>;
  ProceduresHavingVoteResults: DeepPartial<Omit<ProceduresHavingVoteResults, 'procedures'> & { procedures: Array<ResolversParentTypes['Procedure']> }>;
  RecommendedProceduresResult: DeepPartial<Omit<RecommendedProceduresResult, 'data'> & { data: Array<ResolversParentTypes['RecommendationGroup']> }>;
  RecommendationGroup: DeepPartial<Omit<RecommendationGroup, 'procedures'> & { procedures: Array<ResolversParentTypes['Procedure']> }>;
  SearchProcedures: DeepPartial<Omit<SearchProcedures, 'procedures'> & { procedures: Array<ResolversParentTypes['Procedure']> }>;
  Vote: DeepPartial<Vote>;
  VoteStatistic: DeepPartial<VoteStatistic>;
  Mutation: {};
  TokenResult: DeepPartial<TokenResult>;
  CodeResult: DeepPartial<CodeResult>;
  VerificationResult: DeepPartial<VerificationResult>;
  Auth: DeepPartial<Auth>;
  Device: DeepPartial<Device>;
  Schema: DeepPartial<Omit<Schema, 'query'> & { query?: Maybe<ResolversParentTypes['Query']> }>;
};

export type QueryResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  activityIndex?: Resolver<Maybe<ResolversTypes['ActivityIndex']>, ParentType, ContextType, RequireFields<QueryActivityIndexArgs, 'procedureId'>>;
  communityVotes?: Resolver<Maybe<ResolversTypes['CommunityVotes']>, ParentType, ContextType, RequireFields<QueryCommunityVotesArgs, 'procedure'>>;
  currentConferenceWeek?: Resolver<ResolversTypes['ConferenceWeek'], ParentType, ContextType>;
  deputies?: Resolver<ResolversTypes['DeputiesResult'], ParentType, ContextType, Partial<QueryDeputiesArgs>>;
  deputiesOfConstituency?: Resolver<Array<ResolversTypes['Deputy']>, ParentType, ContextType, RequireFields<QueryDeputiesOfConstituencyArgs, 'constituency'>>;
  deputy?: Resolver<Maybe<ResolversTypes['Deputy']>, ParentType, ContextType, RequireFields<QueryDeputyArgs, 'id'>>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  mostSearched?: Resolver<Array<ResolversTypes['SearchTerm']>, ParentType, ContextType>;
  notificationSettings?: Resolver<Maybe<ResolversTypes['NotificationSettings']>, ParentType, ContextType>;
  notifiedProcedures?: Resolver<Array<ResolversTypes['Procedure']>, ParentType, ContextType>;
  procedure?: Resolver<ResolversTypes['Procedure'], ParentType, ContextType, RequireFields<QueryProcedureArgs, 'id'>>;
  procedures?: Resolver<Array<ResolversTypes['Procedure']>, ParentType, ContextType, Partial<QueryProceduresArgs>>;
  proceduresById?: Resolver<Array<ResolversTypes['Procedure']>, ParentType, ContextType, RequireFields<QueryProceduresByIdArgs, 'ids'>>;
  proceduresByIdHavingVoteResults?: Resolver<ResolversTypes['ProceduresHavingVoteResults'], ParentType, ContextType, Partial<QueryProceduresByIdHavingVoteResultsArgs>>;
  proceduresWithVoteResults?: Resolver<Array<ResolversTypes['Procedure']>, ParentType, ContextType, RequireFields<QueryProceduresWithVoteResultsArgs, 'procedureIds'>>;
  recommendedProcedures?: Resolver<ResolversTypes['RecommendedProceduresResult'], ParentType, ContextType, Partial<QueryRecommendedProceduresArgs>>;
  searchProcedures?: Resolver<Array<ResolversTypes['Procedure']>, ParentType, ContextType, RequireFields<QuerySearchProceduresArgs, 'term'>>;
  searchProceduresAutocomplete?: Resolver<ResolversTypes['SearchProcedures'], ParentType, ContextType, RequireFields<QuerySearchProceduresAutocompleteArgs, 'term'>>;
  showRecommendations?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, Partial<QueryShowRecommendationsArgs>>;
  votedProcedures?: Resolver<Array<ResolversTypes['Procedure']>, ParentType, ContextType>;
  votes?: Resolver<Maybe<ResolversTypes['Vote']>, ParentType, ContextType, RequireFields<QueryVotesArgs, 'procedure'>>;
  voteStatistic?: Resolver<Maybe<ResolversTypes['VoteStatistic']>, ParentType, ContextType>;
};

export type ActivityIndexResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['ActivityIndex'] = ResolversParentTypes['ActivityIndex']> = {
  active?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  activityIndex?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CommunityVotesResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['CommunityVotes'] = ResolversParentTypes['CommunityVotes']> = {
  abstination?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  constituencies?: Resolver<Array<ResolversTypes['CommunityConstituencyVotes']>, ParentType, ContextType>;
  no?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  yes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CommunityConstituencyVotesResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['CommunityConstituencyVotes'] = ResolversParentTypes['CommunityConstituencyVotes']> = {
  abstination?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  constituency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  no?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  yes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ConferenceWeekResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['ConferenceWeek'] = ResolversParentTypes['ConferenceWeek']> = {
  calendarWeek?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  end?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  start?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export type DeputiesResultResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['DeputiesResult'] = ResolversParentTypes['DeputiesResult']> = {
  data?: Resolver<Array<ResolversTypes['Deputy']>, ParentType, ContextType>;
  hasMore?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeputyResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['Deputy'] = ResolversParentTypes['Deputy']> = {
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  biography?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  constituency?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contact?: Resolver<Maybe<ResolversTypes['DeputyContact']>, ParentType, ContextType>;
  directCandidate?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  imgURL?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  job?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  party?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  period?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  procedures?: Resolver<Array<ResolversTypes['DeputyProcedure']>, ParentType, ContextType, Partial<DeputyProceduresArgs>>;
  totalProcedures?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  webId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeputyContactResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['DeputyContact'] = ResolversParentTypes['DeputyContact']> = {
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  links?: Resolver<Array<ResolversTypes['DeputyLink']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeputyLinkResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['DeputyLink'] = ResolversParentTypes['DeputyLink']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  URL?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeputyProcedureResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['DeputyProcedure'] = ResolversParentTypes['DeputyProcedure']> = {
  decision?: Resolver<ResolversTypes['VoteSelection'], ParentType, ContextType>;
  procedure?: Resolver<ResolversTypes['Procedure'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VoteSelectionResolvers = { ABSTINATION: 'undefined', NO: 'undefined', NOTVOTED: 'undefined', YES: 'undefined' };

export type ProcedureResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['Procedure'] = ResolversParentTypes['Procedure']> = {
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  abstract?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  activityIndex?: Resolver<ResolversTypes['ActivityIndex'], ParentType, ContextType>;
  communityVotes?: Resolver<Maybe<ResolversTypes['CommunityVotes']>, ParentType, ContextType, Partial<ProcedureCommunityVotesArgs>>;
  completed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  currentStatus?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  currentStatusHistory?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  importantDocuments?: Resolver<Array<ResolversTypes['Document']>, ParentType, ContextType>;
  list?: Resolver<Maybe<ResolversTypes['ListType']>, ParentType, ContextType>;
  listType?: Resolver<Maybe<ResolversTypes['ProcedureType']>, ParentType, ContextType>;
  notify?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  period?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  procedureId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sessionTOPHeading?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subjectGroups?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  submissionDate?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  tags?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  verified?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  voted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  voteDate?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  votedGovernment?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  voteEnd?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  voteResults?: Resolver<Maybe<ResolversTypes['VoteResult']>, ParentType, ContextType>;
  votes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  voteWeek?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  voteYear?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DocumentResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['Document'] = ResolversParentTypes['Document']> = {
  editor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  number?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ListTypeResolvers = { CONFERENCEWEEKS_PLANNED: 'undefined', HOT: 'undefined', IN_VOTE: 'undefined', PAST: 'undefined', PREPARATION: 'undefined', TOP100: 'undefined' };

export type ProcedureTypeResolvers = { HOT: 'undefined', IN_VOTE: 'undefined', PAST: 'undefined', PREPARATION: 'undefined', VOTING: 'undefined' };

export type VoteResultResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['VoteResult'] = ResolversParentTypes['VoteResult']> = {
  abstination?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  decisionText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deputyVotes?: Resolver<Array<ResolversTypes['DeputyVote']>, ParentType, ContextType, Partial<VoteResultDeputyVotesArgs>>;
  governmentDecision?: Resolver<ResolversTypes['VoteSelection'], ParentType, ContextType>;
  namedVote?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  no?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  notVote?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  notVoted?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  partyVotes?: Resolver<Array<ResolversTypes['PartyVote']>, ParentType, ContextType>;
  procedureId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  yes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeputyVoteResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['DeputyVote'] = ResolversParentTypes['DeputyVote']> = {
  decision?: Resolver<ResolversTypes['VoteSelection'], ParentType, ContextType>;
  deputy?: Resolver<ResolversTypes['Deputy'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PartyVoteResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['PartyVote'] = ResolversParentTypes['PartyVote']> = {
  deviants?: Resolver<ResolversTypes['Deviants'], ParentType, ContextType>;
  main?: Resolver<ResolversTypes['VoteSelection'], ParentType, ContextType>;
  party?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeviantsResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['Deviants'] = ResolversParentTypes['Deviants']> = {
  abstination?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  no?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  notVoted?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  yes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  _id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  deviceHash?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  verified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SearchTermResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['SearchTerm'] = ResolversParentTypes['SearchTerm']> = {
  term?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NotificationSettingsResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['NotificationSettings'] = ResolversParentTypes['NotificationSettings']> = {
  conferenceWeekPushs?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  disableUntil?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  enabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  newPreperation?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  newVote?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  outcomePushs?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  procedures?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  voteConferenceWeekPushs?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  voteTOP100Pushs?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VotedTimeSpanResolvers = { CurrentQuarter: 'undefined', CurrentSittingWeek: 'undefined', CurrentYear: 'undefined', LastQuarter: 'undefined', LastSittingWeek: 'undefined', LastYear: 'undefined', Period: 'undefined' };

export type ProceduresHavingVoteResultsResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['ProceduresHavingVoteResults'] = ResolversParentTypes['ProceduresHavingVoteResults']> = {
  procedures?: Resolver<Array<ResolversTypes['Procedure']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RecommendedProceduresResultResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['RecommendedProceduresResult'] = ResolversParentTypes['RecommendedProceduresResult']> = {
  data?: Resolver<Array<ResolversTypes['RecommendationGroup']>, ParentType, ContextType>;
  hasMore?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RecommendationGroupResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['RecommendationGroup'] = ResolversParentTypes['RecommendationGroup']> = {
  procedures?: Resolver<Array<ResolversTypes['Procedure']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SearchProceduresResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['SearchProcedures'] = ResolversParentTypes['SearchProcedures']> = {
  autocomplete?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  procedures?: Resolver<Array<ResolversTypes['Procedure']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VoteResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['Vote'] = ResolversParentTypes['Vote']> = {
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  voted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  voteResults?: Resolver<Maybe<ResolversTypes['CommunityVotes']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VoteStatisticResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['VoteStatistic'] = ResolversParentTypes['VoteStatistic']> = {
  proceduresCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  votedProcedures?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addToken?: Resolver<ResolversTypes['TokenResult'], ParentType, ContextType, RequireFields<MutationAddTokenArgs, 'os' | 'token'>>;
  finishSearch?: Resolver<ResolversTypes['SearchTerm'], ParentType, ContextType, RequireFields<MutationFinishSearchArgs, 'term'>>;
  increaseActivity?: Resolver<Maybe<ResolversTypes['ActivityIndex']>, ParentType, ContextType, RequireFields<MutationIncreaseActivityArgs, 'procedureId'>>;
  requestCode?: Resolver<ResolversTypes['CodeResult'], ParentType, ContextType, RequireFields<MutationRequestCodeArgs, 'newPhone'>>;
  requestVerification?: Resolver<ResolversTypes['VerificationResult'], ParentType, ContextType, RequireFields<MutationRequestVerificationArgs, 'code' | 'newPhoneHash'>>;
  signUp?: Resolver<Maybe<ResolversTypes['Auth']>, ParentType, ContextType, RequireFields<MutationSignUpArgs, 'deviceHashEncrypted'>>;
  toggleNotification?: Resolver<Maybe<ResolversTypes['Procedure']>, ParentType, ContextType, RequireFields<MutationToggleNotificationArgs, 'procedureId'>>;
  updateNotificationSettings?: Resolver<Maybe<ResolversTypes['NotificationSettings']>, ParentType, ContextType, Partial<MutationUpdateNotificationSettingsArgs>>;
  vote?: Resolver<ResolversTypes['Vote'], ParentType, ContextType, RequireFields<MutationVoteArgs, 'procedure' | 'selection'>>;
};

export type TokenResultResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['TokenResult'] = ResolversParentTypes['TokenResult']> = {
  succeeded?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CodeResultResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['CodeResult'] = ResolversParentTypes['CodeResult']> = {
  allowNewUser?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  expireTime?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  reason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  resendTime?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  succeeded?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VerificationResultResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['VerificationResult'] = ResolversParentTypes['VerificationResult']> = {
  reason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  succeeded?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AuthResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['Auth'] = ResolversParentTypes['Auth']> = {
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeviceResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['Device'] = ResolversParentTypes['Device']> = {
  notificationSettings?: Resolver<Maybe<ResolversTypes['NotificationSettings']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SchemaResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['Schema'] = ResolversParentTypes['Schema']> = {
  query?: Resolver<Maybe<ResolversTypes['Query']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = GraphQlContext> = {
  Query?: QueryResolvers<ContextType>;
  ActivityIndex?: ActivityIndexResolvers<ContextType>;
  CommunityVotes?: CommunityVotesResolvers<ContextType>;
  CommunityConstituencyVotes?: CommunityConstituencyVotesResolvers<ContextType>;
  ConferenceWeek?: ConferenceWeekResolvers<ContextType>;
  Date?: GraphQLScalarType;
  DeputiesResult?: DeputiesResultResolvers<ContextType>;
  Deputy?: DeputyResolvers<ContextType>;
  DeputyContact?: DeputyContactResolvers<ContextType>;
  DeputyLink?: DeputyLinkResolvers<ContextType>;
  DeputyProcedure?: DeputyProcedureResolvers<ContextType>;
  VoteSelection?: VoteSelectionResolvers;
  Procedure?: ProcedureResolvers<ContextType>;
  Document?: DocumentResolvers<ContextType>;
  ListType?: ListTypeResolvers;
  ProcedureType?: ProcedureTypeResolvers;
  VoteResult?: VoteResultResolvers<ContextType>;
  DeputyVote?: DeputyVoteResolvers<ContextType>;
  PartyVote?: PartyVoteResolvers<ContextType>;
  Deviants?: DeviantsResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  SearchTerm?: SearchTermResolvers<ContextType>;
  NotificationSettings?: NotificationSettingsResolvers<ContextType>;
  VotedTimeSpan?: VotedTimeSpanResolvers;
  ProceduresHavingVoteResults?: ProceduresHavingVoteResultsResolvers<ContextType>;
  RecommendedProceduresResult?: RecommendedProceduresResultResolvers<ContextType>;
  RecommendationGroup?: RecommendationGroupResolvers<ContextType>;
  SearchProcedures?: SearchProceduresResolvers<ContextType>;
  Vote?: VoteResolvers<ContextType>;
  VoteStatistic?: VoteStatisticResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  TokenResult?: TokenResultResolvers<ContextType>;
  CodeResult?: CodeResultResolvers<ContextType>;
  VerificationResult?: VerificationResultResolvers<ContextType>;
  Auth?: AuthResolvers<ContextType>;
  Device?: DeviceResolvers<ContextType>;
  Schema?: SchemaResolvers<ContextType>;
};

