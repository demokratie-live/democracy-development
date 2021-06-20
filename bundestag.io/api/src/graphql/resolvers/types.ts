import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { GraphQlContext } from '../../types/graphqlContext';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};

export type ConferenceWeekDetailSessionTopTopic = {
  __typename?: 'ConferenceWeekDetailSessionTopTopic';
  lines?: Maybe<Array<Maybe<Scalars['String']>>>;
  documents?: Maybe<Array<Maybe<Scalars['String']>>>;
  isVote?: Maybe<Scalars['Boolean']>;
  procedureIds?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ConferenceWeekDetailSessionTopStatus = {
  __typename?: 'ConferenceWeekDetailSessionTopStatus';
  line?: Maybe<Scalars['String']>;
  documents?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ConferenceWeekDetailSessionTop = {
  __typename?: 'ConferenceWeekDetailSessionTop';
  time?: Maybe<Scalars['Date']>;
  top?: Maybe<Scalars['String']>;
  heading?: Maybe<Scalars['String']>;
  article?: Maybe<Scalars['String']>;
  topic?: Maybe<Array<Maybe<ConferenceWeekDetailSessionTopTopic>>>;
  status?: Maybe<Array<Maybe<ConferenceWeekDetailSessionTopStatus>>>;
};

export type ConferenceWeekDetailSession = {
  __typename?: 'ConferenceWeekDetailSession';
  date?: Maybe<Scalars['Date']>;
  dateText?: Maybe<Scalars['String']>;
  session?: Maybe<Scalars['String']>;
  tops?: Maybe<Array<Maybe<ConferenceWeekDetailSessionTop>>>;
};

export type ConferenceWeekDetail = {
  __typename?: 'ConferenceWeekDetail';
  URL?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  previousYear?: Maybe<Scalars['Int']>;
  previousWeek?: Maybe<Scalars['Int']>;
  thisYear: Scalars['Int'];
  thisWeek: Scalars['Int'];
  nextYear?: Maybe<Scalars['Int']>;
  nextWeek?: Maybe<Scalars['Int']>;
  sessions?: Maybe<Array<Maybe<ConferenceWeekDetailSession>>>;
};

export type Query = {
  __typename?: 'Query';
  conferenceWeekDetail?: Maybe<ConferenceWeekDetail>;
  conferenceWeekDetails?: Maybe<Array<Maybe<ConferenceWeekDetail>>>;
  deputy?: Maybe<Deputy>;
  deputies?: Maybe<Array<Maybe<Deputy>>>;
  deputyUpdates?: Maybe<DeputyUpdate>;
  legislativePeriod?: Maybe<LegislativePeriod>;
  legislativePeriods?: Maybe<Array<Maybe<LegislativePeriod>>>;
  namedPoll?: Maybe<NamedPoll>;
  namedPolls?: Maybe<Array<Maybe<NamedPoll>>>;
  namedPollUpdates?: Maybe<NamedPollUpdate>;
  procedure?: Maybe<Procedure>;
  procedures?: Maybe<Array<Maybe<Procedure>>>;
  allProcedures?: Maybe<Array<Maybe<Procedure>>>;
  procedureUpdates?: Maybe<ProcedureUpdate>;
  voteResultTextHelper?: Maybe<Array<VoteResultTexts>>;
};


export type QueryConferenceWeekDetailArgs = {
  year: Scalars['Int'];
  week: Scalars['Int'];
};


export type QueryConferenceWeekDetailsArgs = {
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};


export type QueryDeputyArgs = {
  webId: Scalars['String'];
};


export type QueryDeputiesArgs = {
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};


export type QueryDeputyUpdatesArgs = {
  since: Scalars['Date'];
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};


export type QueryLegislativePeriodArgs = {
  period: Scalars['Int'];
};


export type QueryNamedPollArgs = {
  webId: Scalars['String'];
};


export type QueryNamedPollsArgs = {
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};


export type QueryNamedPollUpdatesArgs = {
  since: Scalars['Date'];
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  associated?: Maybe<Scalars['Boolean']>;
};


export type QueryProcedureArgs = {
  procedureId: Scalars['String'];
};


export type QueryProceduresArgs = {
  offset?: Maybe<Scalars['Int']>;
  period?: Maybe<Array<Scalars['Int']>>;
  type?: Maybe<Array<Scalars['String']>>;
  IDs?: Maybe<Array<Scalars['String']>>;
  status?: Maybe<Array<Scalars['String']>>;
  voteDate?: Maybe<Array<Scalars['Boolean']>>;
  manageVoteDate?: Maybe<Scalars['Boolean']>;
  limit?: Maybe<Scalars['Int']>;
};


export type QueryAllProceduresArgs = {
  offset?: Maybe<Scalars['Int']>;
  period?: Maybe<Array<Scalars['Int']>>;
  type?: Maybe<Array<Scalars['String']>>;
};


export type QueryProcedureUpdatesArgs = {
  since: Scalars['Date'];
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  periods?: Maybe<Array<Scalars['Int']>>;
  types?: Maybe<Array<Scalars['String']>>;
};


export type QueryVoteResultTextHelperArgs = {
  procedureId: Scalars['String'];
};

export type Decision = {
  __typename?: 'Decision';
  page?: Maybe<Scalars['String']>;
  tenor?: Maybe<Scalars['String']>;
  document?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  comment?: Maybe<Scalars['String']>;
  foundation?: Maybe<Scalars['String']>;
  majority?: Maybe<Scalars['String']>;
};

export type DeputyLink = {
  __typename?: 'DeputyLink';
  name: Scalars['String'];
  URL: Scalars['String'];
  username?: Maybe<Scalars['String']>;
};

export type DeputyFunctions = {
  __typename?: 'DeputyFunctions';
  category?: Maybe<Scalars['String']>;
  functions?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type Deputy = {
  __typename?: 'Deputy';
  _id: Scalars['ID'];
  URL: Scalars['String'];
  webId?: Maybe<Scalars['String']>;
  imgURL?: Maybe<Scalars['String']>;
  party?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  job?: Maybe<Scalars['String']>;
  office?: Maybe<Array<Maybe<Scalars['String']>>>;
  links: Array<DeputyLink>;
  biography?: Maybe<Array<Maybe<Scalars['String']>>>;
  constituency?: Maybe<Scalars['String']>;
  constituencyName?: Maybe<Scalars['String']>;
  directCandidate?: Maybe<Scalars['Boolean']>;
  functions?: Maybe<Array<Maybe<DeputyFunctions>>>;
  speechesURL?: Maybe<Scalars['String']>;
  votesURL?: Maybe<Scalars['String']>;
  publicationRequirement?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DeputyUpdate = {
  __typename?: 'DeputyUpdate';
  beforeCount: Scalars['Int'];
  afterCount: Scalars['Int'];
  newCount?: Maybe<Scalars['Int']>;
  changedCount?: Maybe<Scalars['Int']>;
  deputies?: Maybe<Array<Maybe<Deputy>>>;
};

export type Document = {
  __typename?: 'Document';
  editor?: Maybe<Scalars['String']>;
  number?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
};

export type LegislativePeriod = {
  __typename?: 'LegislativePeriod';
  number: Scalars['Int'];
  start: Scalars['Date'];
  end?: Maybe<Scalars['Date']>;
  deputies: Scalars['Int'];
};

export type NamedPollMediaVideoUrl = {
  __typename?: 'NamedPollMediaVideoURL';
  URL?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type NamedPollMedia = {
  __typename?: 'NamedPollMedia';
  iTunesURL?: Maybe<Scalars['String']>;
  mediathekURL?: Maybe<Scalars['String']>;
  videoURLs?: Maybe<Array<Maybe<NamedPollMediaVideoUrl>>>;
};

export type NamedPollSpeech = {
  __typename?: 'NamedPollSpeech';
  deputyName?: Maybe<Scalars['String']>;
  deputyImgURL?: Maybe<Scalars['String']>;
  mediathekURL?: Maybe<Scalars['String']>;
  function?: Maybe<Scalars['String']>;
  party?: Maybe<Scalars['String']>;
};

export type NamedPollVotesVotes = {
  __typename?: 'NamedPollVotesVotes';
  total?: Maybe<Scalars['Int']>;
  yes?: Maybe<Scalars['Int']>;
  no?: Maybe<Scalars['Int']>;
  abstain?: Maybe<Scalars['Int']>;
  na?: Maybe<Scalars['Int']>;
};

export type NamedPollVotesParty = {
  __typename?: 'NamedPollVotesParty';
  name?: Maybe<Scalars['String']>;
  votes?: Maybe<NamedPollVotesVotes>;
};

export type NamedPollDeputy = {
  __typename?: 'NamedPollDeputy';
  webId?: Maybe<Scalars['String']>;
  URL?: Maybe<Scalars['String']>;
  imgURL?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  party?: Maybe<Scalars['String']>;
  vote?: Maybe<Scalars['String']>;
};

export type NamedPollVotes = {
  __typename?: 'NamedPollVotes';
  all?: Maybe<NamedPollVotesVotes>;
  parties?: Maybe<Array<Maybe<NamedPollVotesParty>>>;
  deputies?: Maybe<Array<Maybe<NamedPollDeputy>>>;
  inverseVoteDirection?: Maybe<Scalars['Boolean']>;
};

export type NamedPoll = {
  __typename?: 'NamedPoll';
  _id: Scalars['ID'];
  webId: Scalars['String'];
  URL: Scalars['String'];
  date?: Maybe<Scalars['Date']>;
  deputyVotesURL?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  detailedDescription?: Maybe<Scalars['String']>;
  documents?: Maybe<Array<Maybe<Scalars['String']>>>;
  media?: Maybe<Array<Maybe<NamedPollMedia>>>;
  plenarProtocolURL?: Maybe<Scalars['String']>;
  procedureId?: Maybe<Scalars['String']>;
  speeches?: Maybe<Array<Maybe<NamedPollSpeech>>>;
  title?: Maybe<Scalars['String']>;
  votes?: Maybe<NamedPollVotes>;
};

export type NamedPollUpdate = {
  __typename?: 'NamedPollUpdate';
  beforeCount: Scalars['Int'];
  afterCount: Scalars['Int'];
  newCount?: Maybe<Scalars['Int']>;
  changedCount?: Maybe<Scalars['Int']>;
  namedPolls?: Maybe<Array<Maybe<NamedPoll>>>;
};

export type FilteredConferenceWeekDetailSessionTopTopic = {
  __typename?: 'FilteredConferenceWeekDetailSessionTopTopic';
  lines?: Maybe<Array<Maybe<Scalars['String']>>>;
  documents?: Maybe<Array<Maybe<Scalars['String']>>>;
  isVote?: Maybe<Scalars['Boolean']>;
  procedureId?: Maybe<Scalars['String']>;
};

export type FilteredConferenceWeekDetailSessionTop = {
  __typename?: 'FilteredConferenceWeekDetailSessionTop';
  time?: Maybe<Scalars['Date']>;
  top?: Maybe<Scalars['String']>;
  heading?: Maybe<Scalars['String']>;
  article?: Maybe<Scalars['String']>;
  topic?: Maybe<FilteredConferenceWeekDetailSessionTopTopic>;
  status?: Maybe<Array<Maybe<ConferenceWeekDetailSessionTopStatus>>>;
};

export type FilteredConferenceWeekDetailSession = {
  __typename?: 'FilteredConferenceWeekDetailSession';
  date?: Maybe<Scalars['Date']>;
  dateText?: Maybe<Scalars['String']>;
  session?: Maybe<Scalars['String']>;
  top?: Maybe<FilteredConferenceWeekDetailSessionTop>;
};

export type FilteredConferenceWeekDetail = {
  __typename?: 'FilteredConferenceWeekDetail';
  URL?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  previousYear?: Maybe<Scalars['Int']>;
  previousWeek?: Maybe<Scalars['Int']>;
  thisYear: Scalars['Int'];
  thisWeek: Scalars['Int'];
  nextYear?: Maybe<Scalars['Int']>;
  nextWeek?: Maybe<Scalars['Int']>;
  session?: Maybe<FilteredConferenceWeekDetailSession>;
};

export enum VoteDecision {
  Yes = 'YES',
  Abstination = 'ABSTINATION',
  No = 'NO',
  Notvoted = 'NOTVOTED'
}

export enum VotingDocument {
  MainDocument = 'mainDocument',
  RecommendedDecision = 'recommendedDecision'
}

export type ProcedureCustomData = {
  __typename?: 'ProcedureCustomData';
  title?: Maybe<Scalars['String']>;
  voteResults?: Maybe<VoteResults>;
};

export type VoteResults = {
  __typename?: 'VoteResults';
  yes?: Maybe<Scalars['Int']>;
  no?: Maybe<Scalars['Int']>;
  abstination?: Maybe<Scalars['Int']>;
  notVoted?: Maybe<Scalars['Int']>;
  decisionText?: Maybe<Scalars['String']>;
  votingDocument?: Maybe<VotingDocument>;
  votingRecommendation?: Maybe<Scalars['Boolean']>;
  partyVotes?: Maybe<Array<Maybe<PartyVote>>>;
};

export type PartyVote = {
  __typename?: 'PartyVote';
  party: Scalars['String'];
  main?: Maybe<VoteDecision>;
  deviants?: Maybe<Deviants>;
};

export type PartyVoteInput = {
  party: Scalars['String'];
  main?: Maybe<VoteDecision>;
  deviants?: Maybe<DeviantsInput>;
};

export type Deviants = {
  __typename?: 'Deviants';
  yes?: Maybe<Scalars['Int']>;
  abstination?: Maybe<Scalars['Int']>;
  no?: Maybe<Scalars['Int']>;
  notVoted?: Maybe<Scalars['Int']>;
};

export type DeviantsInput = {
  yes?: Maybe<Scalars['Int']>;
  abstination?: Maybe<Scalars['Int']>;
  no?: Maybe<Scalars['Int']>;
  notVoted?: Maybe<Scalars['Int']>;
};

export type Procedure = {
  __typename?: 'Procedure';
  _id: Scalars['ID'];
  title: Scalars['String'];
  procedureId?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  period?: Maybe<Scalars['Int']>;
  currentStatus?: Maybe<Scalars['String']>;
  currentStatusHistory?: Maybe<Array<Maybe<Scalars['String']>>>;
  signature?: Maybe<Scalars['String']>;
  gestOrderNumber?: Maybe<Scalars['String']>;
  approvalRequired?: Maybe<Array<Maybe<Scalars['String']>>>;
  euDocNr?: Maybe<Scalars['String']>;
  abstract?: Maybe<Scalars['String']>;
  promulgation?: Maybe<Array<Maybe<Scalars['String']>>>;
  legalValidity?: Maybe<Array<Maybe<Scalars['String']>>>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  subjectGroups?: Maybe<Array<Maybe<Scalars['String']>>>;
  history?: Maybe<Array<Maybe<ProcessFlow>>>;
  importantDocuments?: Maybe<Array<Maybe<Document>>>;
  customData?: Maybe<ProcedureCustomData>;
  namedVote?: Maybe<Scalars['Boolean']>;
  voteDate?: Maybe<Scalars['Date']>;
  voteEnd?: Maybe<Scalars['Date']>;
  sessions?: Maybe<Array<Maybe<FilteredConferenceWeekDetail>>>;
};

export type ProcedureUpdate = {
  __typename?: 'ProcedureUpdate';
  beforeCount: Scalars['Int'];
  afterCount: Scalars['Int'];
  newCount?: Maybe<Scalars['Int']>;
  changedCount?: Maybe<Scalars['Int']>;
  procedures?: Maybe<Array<Maybe<Procedure>>>;
};

export type VoteResultTexts = {
  __typename?: 'VoteResultTexts';
  results: Array<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  saveProcedureCustomData?: Maybe<Procedure>;
  scrapeProcedures?: Maybe<Scalars['Boolean']>;
  signIn?: Maybe<User>;
};


export type MutationSaveProcedureCustomDataArgs = {
  procedureId: Scalars['String'];
  partyVotes: Array<PartyVoteInput>;
  decisionText: Scalars['String'];
  votingDocument: VotingDocument;
};


export type MutationScrapeProceduresArgs = {
  key: Scalars['String'];
};


export type MutationSignInArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};

export type ProcessFlow = {
  __typename?: 'ProcessFlow';
  assignment?: Maybe<Scalars['String']>;
  initiator?: Maybe<Scalars['String']>;
  findSpot?: Maybe<Scalars['String']>;
  findSpotUrl?: Maybe<Scalars['String']>;
  decision?: Maybe<Array<Maybe<Decision>>>;
  date?: Maybe<Scalars['Date']>;
};


export type Schema = {
  __typename?: 'Schema';
  query?: Maybe<Query>;
};

export enum UserRole {
  Web = 'WEB',
  Backend = 'BACKEND'
}

export type User = {
  __typename?: 'User';
  email: Scalars['String'];
  role?: Maybe<UserRole>;
  jwt?: Maybe<Scalars['String']>;
};

export enum Role {
  Backend = 'BACKEND',
  User = 'USER'
}

export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}




export type ResolverTypeWrapper<T> = Promise<T> | T;


export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

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
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

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

export type IsTypeOfResolverFn<T = {}> = (obj: T, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

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
  ConferenceWeekDetailSessionTopTopic: ResolverTypeWrapper<ConferenceWeekDetailSessionTopTopic>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  ConferenceWeekDetailSessionTopStatus: ResolverTypeWrapper<ConferenceWeekDetailSessionTopStatus>;
  ConferenceWeekDetailSessionTop: ResolverTypeWrapper<ConferenceWeekDetailSessionTop>;
  ConferenceWeekDetailSession: ResolverTypeWrapper<ConferenceWeekDetailSession>;
  ConferenceWeekDetail: ResolverTypeWrapper<ConferenceWeekDetail>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Query: ResolverTypeWrapper<{}>;
  Decision: ResolverTypeWrapper<Decision>;
  DeputyLink: ResolverTypeWrapper<DeputyLink>;
  DeputyFunctions: ResolverTypeWrapper<DeputyFunctions>;
  Deputy: ResolverTypeWrapper<Deputy>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  DeputyUpdate: ResolverTypeWrapper<DeputyUpdate>;
  Document: ResolverTypeWrapper<Document>;
  LegislativePeriod: ResolverTypeWrapper<LegislativePeriod>;
  NamedPollMediaVideoURL: ResolverTypeWrapper<NamedPollMediaVideoUrl>;
  NamedPollMedia: ResolverTypeWrapper<NamedPollMedia>;
  NamedPollSpeech: ResolverTypeWrapper<NamedPollSpeech>;
  NamedPollVotesVotes: ResolverTypeWrapper<NamedPollVotesVotes>;
  NamedPollVotesParty: ResolverTypeWrapper<NamedPollVotesParty>;
  NamedPollDeputy: ResolverTypeWrapper<NamedPollDeputy>;
  NamedPollVotes: ResolverTypeWrapper<NamedPollVotes>;
  NamedPoll: ResolverTypeWrapper<NamedPoll>;
  NamedPollUpdate: ResolverTypeWrapper<NamedPollUpdate>;
  FilteredConferenceWeekDetailSessionTopTopic: ResolverTypeWrapper<FilteredConferenceWeekDetailSessionTopTopic>;
  FilteredConferenceWeekDetailSessionTop: ResolverTypeWrapper<FilteredConferenceWeekDetailSessionTop>;
  FilteredConferenceWeekDetailSession: ResolverTypeWrapper<FilteredConferenceWeekDetailSession>;
  FilteredConferenceWeekDetail: ResolverTypeWrapper<FilteredConferenceWeekDetail>;
  VoteDecision: VoteDecision;
  VotingDocument: VotingDocument;
  ProcedureCustomData: ResolverTypeWrapper<ProcedureCustomData>;
  VoteResults: ResolverTypeWrapper<VoteResults>;
  PartyVote: ResolverTypeWrapper<PartyVote>;
  PartyVoteInput: PartyVoteInput;
  Deviants: ResolverTypeWrapper<Deviants>;
  DeviantsInput: DeviantsInput;
  Procedure: ResolverTypeWrapper<Procedure>;
  ProcedureUpdate: ResolverTypeWrapper<ProcedureUpdate>;
  VoteResultTexts: ResolverTypeWrapper<VoteResultTexts>;
  Mutation: ResolverTypeWrapper<{}>;
  ProcessFlow: ResolverTypeWrapper<ProcessFlow>;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  Schema: ResolverTypeWrapper<Schema>;
  UserRole: UserRole;
  User: ResolverTypeWrapper<User>;
  Role: Role;
  CacheControlScope: CacheControlScope;
  Upload: ResolverTypeWrapper<Scalars['Upload']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  ConferenceWeekDetailSessionTopTopic: ConferenceWeekDetailSessionTopTopic;
  String: Scalars['String'];
  Boolean: Scalars['Boolean'];
  ConferenceWeekDetailSessionTopStatus: ConferenceWeekDetailSessionTopStatus;
  ConferenceWeekDetailSessionTop: ConferenceWeekDetailSessionTop;
  ConferenceWeekDetailSession: ConferenceWeekDetailSession;
  ConferenceWeekDetail: ConferenceWeekDetail;
  Int: Scalars['Int'];
  Query: {};
  Decision: Decision;
  DeputyLink: DeputyLink;
  DeputyFunctions: DeputyFunctions;
  Deputy: Deputy;
  ID: Scalars['ID'];
  DeputyUpdate: DeputyUpdate;
  Document: Document;
  LegislativePeriod: LegislativePeriod;
  NamedPollMediaVideoURL: NamedPollMediaVideoUrl;
  NamedPollMedia: NamedPollMedia;
  NamedPollSpeech: NamedPollSpeech;
  NamedPollVotesVotes: NamedPollVotesVotes;
  NamedPollVotesParty: NamedPollVotesParty;
  NamedPollDeputy: NamedPollDeputy;
  NamedPollVotes: NamedPollVotes;
  NamedPoll: NamedPoll;
  NamedPollUpdate: NamedPollUpdate;
  FilteredConferenceWeekDetailSessionTopTopic: FilteredConferenceWeekDetailSessionTopTopic;
  FilteredConferenceWeekDetailSessionTop: FilteredConferenceWeekDetailSessionTop;
  FilteredConferenceWeekDetailSession: FilteredConferenceWeekDetailSession;
  FilteredConferenceWeekDetail: FilteredConferenceWeekDetail;
  ProcedureCustomData: ProcedureCustomData;
  VoteResults: VoteResults;
  PartyVote: PartyVote;
  PartyVoteInput: PartyVoteInput;
  Deviants: Deviants;
  DeviantsInput: DeviantsInput;
  Procedure: Procedure;
  ProcedureUpdate: ProcedureUpdate;
  VoteResultTexts: VoteResultTexts;
  Mutation: {};
  ProcessFlow: ProcessFlow;
  Date: Scalars['Date'];
  Schema: Schema;
  User: User;
  Upload: Scalars['Upload'];
};

export type ConferenceWeekDetailSessionTopTopicResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['ConferenceWeekDetailSessionTopTopic'] = ResolversParentTypes['ConferenceWeekDetailSessionTopTopic']> = {
  lines?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  documents?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  isVote?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  procedureIds?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type ConferenceWeekDetailSessionTopStatusResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['ConferenceWeekDetailSessionTopStatus'] = ResolversParentTypes['ConferenceWeekDetailSessionTopStatus']> = {
  line?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  documents?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type ConferenceWeekDetailSessionTopResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['ConferenceWeekDetailSessionTop'] = ResolversParentTypes['ConferenceWeekDetailSessionTop']> = {
  time?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  top?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  heading?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  article?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  topic?: Resolver<Maybe<Array<Maybe<ResolversTypes['ConferenceWeekDetailSessionTopTopic']>>>, ParentType, ContextType>;
  status?: Resolver<Maybe<Array<Maybe<ResolversTypes['ConferenceWeekDetailSessionTopStatus']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type ConferenceWeekDetailSessionResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['ConferenceWeekDetailSession'] = ResolversParentTypes['ConferenceWeekDetailSession']> = {
  date?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  dateText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  session?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tops?: Resolver<Maybe<Array<Maybe<ResolversTypes['ConferenceWeekDetailSessionTop']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type ConferenceWeekDetailResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['ConferenceWeekDetail'] = ResolversParentTypes['ConferenceWeekDetail']> = {
  URL?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  previousYear?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  previousWeek?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  thisYear?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  thisWeek?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nextYear?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nextWeek?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  sessions?: Resolver<Maybe<Array<Maybe<ResolversTypes['ConferenceWeekDetailSession']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type QueryResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  conferenceWeekDetail?: Resolver<Maybe<ResolversTypes['ConferenceWeekDetail']>, ParentType, ContextType, RequireFields<QueryConferenceWeekDetailArgs, 'year' | 'week'>>;
  conferenceWeekDetails?: Resolver<Maybe<Array<Maybe<ResolversTypes['ConferenceWeekDetail']>>>, ParentType, ContextType, RequireFields<QueryConferenceWeekDetailsArgs, never>>;
  deputy?: Resolver<Maybe<ResolversTypes['Deputy']>, ParentType, ContextType, RequireFields<QueryDeputyArgs, 'webId'>>;
  deputies?: Resolver<Maybe<Array<Maybe<ResolversTypes['Deputy']>>>, ParentType, ContextType, RequireFields<QueryDeputiesArgs, never>>;
  deputyUpdates?: Resolver<Maybe<ResolversTypes['DeputyUpdate']>, ParentType, ContextType, RequireFields<QueryDeputyUpdatesArgs, 'since'>>;
  legislativePeriod?: Resolver<Maybe<ResolversTypes['LegislativePeriod']>, ParentType, ContextType, RequireFields<QueryLegislativePeriodArgs, 'period'>>;
  legislativePeriods?: Resolver<Maybe<Array<Maybe<ResolversTypes['LegislativePeriod']>>>, ParentType, ContextType>;
  namedPoll?: Resolver<Maybe<ResolversTypes['NamedPoll']>, ParentType, ContextType, RequireFields<QueryNamedPollArgs, 'webId'>>;
  namedPolls?: Resolver<Maybe<Array<Maybe<ResolversTypes['NamedPoll']>>>, ParentType, ContextType, RequireFields<QueryNamedPollsArgs, never>>;
  namedPollUpdates?: Resolver<Maybe<ResolversTypes['NamedPollUpdate']>, ParentType, ContextType, RequireFields<QueryNamedPollUpdatesArgs, 'since'>>;
  procedure?: Resolver<Maybe<ResolversTypes['Procedure']>, ParentType, ContextType, RequireFields<QueryProcedureArgs, 'procedureId'>>;
  procedures?: Resolver<Maybe<Array<Maybe<ResolversTypes['Procedure']>>>, ParentType, ContextType, RequireFields<QueryProceduresArgs, never>>;
  allProcedures?: Resolver<Maybe<Array<Maybe<ResolversTypes['Procedure']>>>, ParentType, ContextType, RequireFields<QueryAllProceduresArgs, never>>;
  procedureUpdates?: Resolver<Maybe<ResolversTypes['ProcedureUpdate']>, ParentType, ContextType, RequireFields<QueryProcedureUpdatesArgs, 'since'>>;
  voteResultTextHelper?: Resolver<Maybe<Array<ResolversTypes['VoteResultTexts']>>, ParentType, ContextType, RequireFields<QueryVoteResultTextHelperArgs, 'procedureId'>>;
};

export type DecisionResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['Decision'] = ResolversParentTypes['Decision']> = {
  page?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tenor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  document?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  comment?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  foundation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  majority?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type DeputyLinkResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['DeputyLink'] = ResolversParentTypes['DeputyLink']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  URL?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type DeputyFunctionsResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['DeputyFunctions'] = ResolversParentTypes['DeputyFunctions']> = {
  category?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  functions?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type DeputyResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['Deputy'] = ResolversParentTypes['Deputy']> = {
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  URL?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  webId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imgURL?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  party?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  job?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  office?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  links?: Resolver<Array<ResolversTypes['DeputyLink']>, ParentType, ContextType>;
  biography?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  constituency?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  constituencyName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  directCandidate?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  functions?: Resolver<Maybe<Array<Maybe<ResolversTypes['DeputyFunctions']>>>, ParentType, ContextType>;
  speechesURL?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  votesURL?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  publicationRequirement?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type DeputyUpdateResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['DeputyUpdate'] = ResolversParentTypes['DeputyUpdate']> = {
  beforeCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  afterCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  newCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  changedCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  deputies?: Resolver<Maybe<Array<Maybe<ResolversTypes['Deputy']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type DocumentResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['Document'] = ResolversParentTypes['Document']> = {
  editor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  number?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type LegislativePeriodResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['LegislativePeriod'] = ResolversParentTypes['LegislativePeriod']> = {
  number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  start?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  end?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  deputies?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type NamedPollMediaVideoUrlResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['NamedPollMediaVideoURL'] = ResolversParentTypes['NamedPollMediaVideoURL']> = {
  URL?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type NamedPollMediaResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['NamedPollMedia'] = ResolversParentTypes['NamedPollMedia']> = {
  iTunesURL?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mediathekURL?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  videoURLs?: Resolver<Maybe<Array<Maybe<ResolversTypes['NamedPollMediaVideoURL']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type NamedPollSpeechResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['NamedPollSpeech'] = ResolversParentTypes['NamedPollSpeech']> = {
  deputyName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deputyImgURL?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mediathekURL?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  function?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  party?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type NamedPollVotesVotesResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['NamedPollVotesVotes'] = ResolversParentTypes['NamedPollVotesVotes']> = {
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  yes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  no?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  abstain?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  na?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type NamedPollVotesPartyResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['NamedPollVotesParty'] = ResolversParentTypes['NamedPollVotesParty']> = {
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  votes?: Resolver<Maybe<ResolversTypes['NamedPollVotesVotes']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type NamedPollDeputyResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['NamedPollDeputy'] = ResolversParentTypes['NamedPollDeputy']> = {
  webId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  URL?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imgURL?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  state?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  party?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  vote?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type NamedPollVotesResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['NamedPollVotes'] = ResolversParentTypes['NamedPollVotes']> = {
  all?: Resolver<Maybe<ResolversTypes['NamedPollVotesVotes']>, ParentType, ContextType>;
  parties?: Resolver<Maybe<Array<Maybe<ResolversTypes['NamedPollVotesParty']>>>, ParentType, ContextType>;
  deputies?: Resolver<Maybe<Array<Maybe<ResolversTypes['NamedPollDeputy']>>>, ParentType, ContextType>;
  inverseVoteDirection?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type NamedPollResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['NamedPoll'] = ResolversParentTypes['NamedPoll']> = {
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  webId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  URL?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  date?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  deputyVotesURL?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  detailedDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  documents?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  media?: Resolver<Maybe<Array<Maybe<ResolversTypes['NamedPollMedia']>>>, ParentType, ContextType>;
  plenarProtocolURL?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  procedureId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  speeches?: Resolver<Maybe<Array<Maybe<ResolversTypes['NamedPollSpeech']>>>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  votes?: Resolver<Maybe<ResolversTypes['NamedPollVotes']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type NamedPollUpdateResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['NamedPollUpdate'] = ResolversParentTypes['NamedPollUpdate']> = {
  beforeCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  afterCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  newCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  changedCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  namedPolls?: Resolver<Maybe<Array<Maybe<ResolversTypes['NamedPoll']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type FilteredConferenceWeekDetailSessionTopTopicResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['FilteredConferenceWeekDetailSessionTopTopic'] = ResolversParentTypes['FilteredConferenceWeekDetailSessionTopTopic']> = {
  lines?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  documents?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  isVote?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  procedureId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type FilteredConferenceWeekDetailSessionTopResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['FilteredConferenceWeekDetailSessionTop'] = ResolversParentTypes['FilteredConferenceWeekDetailSessionTop']> = {
  time?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  top?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  heading?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  article?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  topic?: Resolver<Maybe<ResolversTypes['FilteredConferenceWeekDetailSessionTopTopic']>, ParentType, ContextType>;
  status?: Resolver<Maybe<Array<Maybe<ResolversTypes['ConferenceWeekDetailSessionTopStatus']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type FilteredConferenceWeekDetailSessionResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['FilteredConferenceWeekDetailSession'] = ResolversParentTypes['FilteredConferenceWeekDetailSession']> = {
  date?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  dateText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  session?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  top?: Resolver<Maybe<ResolversTypes['FilteredConferenceWeekDetailSessionTop']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type FilteredConferenceWeekDetailResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['FilteredConferenceWeekDetail'] = ResolversParentTypes['FilteredConferenceWeekDetail']> = {
  URL?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  previousYear?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  previousWeek?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  thisYear?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  thisWeek?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nextYear?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nextWeek?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  session?: Resolver<Maybe<ResolversTypes['FilteredConferenceWeekDetailSession']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type ProcedureCustomDataResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['ProcedureCustomData'] = ResolversParentTypes['ProcedureCustomData']> = {
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  voteResults?: Resolver<Maybe<ResolversTypes['VoteResults']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type VoteResultsResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['VoteResults'] = ResolversParentTypes['VoteResults']> = {
  yes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  no?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  abstination?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  notVoted?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  decisionText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  votingDocument?: Resolver<Maybe<ResolversTypes['VotingDocument']>, ParentType, ContextType>;
  votingRecommendation?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  partyVotes?: Resolver<Maybe<Array<Maybe<ResolversTypes['PartyVote']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type PartyVoteResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['PartyVote'] = ResolversParentTypes['PartyVote']> = {
  party?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  main?: Resolver<Maybe<ResolversTypes['VoteDecision']>, ParentType, ContextType>;
  deviants?: Resolver<Maybe<ResolversTypes['Deviants']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type DeviantsResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['Deviants'] = ResolversParentTypes['Deviants']> = {
  yes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  abstination?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  no?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  notVoted?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type ProcedureResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['Procedure'] = ResolversParentTypes['Procedure']> = {
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  procedureId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  period?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  currentStatus?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  currentStatusHistory?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  signature?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  gestOrderNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  approvalRequired?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  euDocNr?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  abstract?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  promulgation?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  legalValidity?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  subjectGroups?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  history?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProcessFlow']>>>, ParentType, ContextType>;
  importantDocuments?: Resolver<Maybe<Array<Maybe<ResolversTypes['Document']>>>, ParentType, ContextType>;
  customData?: Resolver<Maybe<ResolversTypes['ProcedureCustomData']>, ParentType, ContextType>;
  namedVote?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  voteDate?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  voteEnd?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  sessions?: Resolver<Maybe<Array<Maybe<ResolversTypes['FilteredConferenceWeekDetail']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type ProcedureUpdateResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['ProcedureUpdate'] = ResolversParentTypes['ProcedureUpdate']> = {
  beforeCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  afterCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  newCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  changedCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  procedures?: Resolver<Maybe<Array<Maybe<ResolversTypes['Procedure']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type VoteResultTextsResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['VoteResultTexts'] = ResolversParentTypes['VoteResultTexts']> = {
  results?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type MutationResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  saveProcedureCustomData?: Resolver<Maybe<ResolversTypes['Procedure']>, ParentType, ContextType, RequireFields<MutationSaveProcedureCustomDataArgs, 'procedureId' | 'partyVotes' | 'decisionText' | 'votingDocument'>>;
  scrapeProcedures?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationScrapeProceduresArgs, 'key'>>;
  signIn?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationSignInArgs, 'email' | 'password'>>;
};

export type ProcessFlowResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['ProcessFlow'] = ResolversParentTypes['ProcessFlow']> = {
  assignment?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  initiator?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  findSpot?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  findSpotUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  decision?: Resolver<Maybe<Array<Maybe<ResolversTypes['Decision']>>>, ParentType, ContextType>;
  date?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export type SchemaResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['Schema'] = ResolversParentTypes['Schema']> = {
  query?: Resolver<Maybe<ResolversTypes['Query']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type UserResolvers<ContextType = GraphQlContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  role?: Resolver<Maybe<ResolversTypes['UserRole']>, ParentType, ContextType>;
  jwt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export interface UploadScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Upload'], any> {
  name: 'Upload';
}

export type Resolvers<ContextType = GraphQlContext> = {
  ConferenceWeekDetailSessionTopTopic?: ConferenceWeekDetailSessionTopTopicResolvers<ContextType>;
  ConferenceWeekDetailSessionTopStatus?: ConferenceWeekDetailSessionTopStatusResolvers<ContextType>;
  ConferenceWeekDetailSessionTop?: ConferenceWeekDetailSessionTopResolvers<ContextType>;
  ConferenceWeekDetailSession?: ConferenceWeekDetailSessionResolvers<ContextType>;
  ConferenceWeekDetail?: ConferenceWeekDetailResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Decision?: DecisionResolvers<ContextType>;
  DeputyLink?: DeputyLinkResolvers<ContextType>;
  DeputyFunctions?: DeputyFunctionsResolvers<ContextType>;
  Deputy?: DeputyResolvers<ContextType>;
  DeputyUpdate?: DeputyUpdateResolvers<ContextType>;
  Document?: DocumentResolvers<ContextType>;
  LegislativePeriod?: LegislativePeriodResolvers<ContextType>;
  NamedPollMediaVideoURL?: NamedPollMediaVideoUrlResolvers<ContextType>;
  NamedPollMedia?: NamedPollMediaResolvers<ContextType>;
  NamedPollSpeech?: NamedPollSpeechResolvers<ContextType>;
  NamedPollVotesVotes?: NamedPollVotesVotesResolvers<ContextType>;
  NamedPollVotesParty?: NamedPollVotesPartyResolvers<ContextType>;
  NamedPollDeputy?: NamedPollDeputyResolvers<ContextType>;
  NamedPollVotes?: NamedPollVotesResolvers<ContextType>;
  NamedPoll?: NamedPollResolvers<ContextType>;
  NamedPollUpdate?: NamedPollUpdateResolvers<ContextType>;
  FilteredConferenceWeekDetailSessionTopTopic?: FilteredConferenceWeekDetailSessionTopTopicResolvers<ContextType>;
  FilteredConferenceWeekDetailSessionTop?: FilteredConferenceWeekDetailSessionTopResolvers<ContextType>;
  FilteredConferenceWeekDetailSession?: FilteredConferenceWeekDetailSessionResolvers<ContextType>;
  FilteredConferenceWeekDetail?: FilteredConferenceWeekDetailResolvers<ContextType>;
  ProcedureCustomData?: ProcedureCustomDataResolvers<ContextType>;
  VoteResults?: VoteResultsResolvers<ContextType>;
  PartyVote?: PartyVoteResolvers<ContextType>;
  Deviants?: DeviantsResolvers<ContextType>;
  Procedure?: ProcedureResolvers<ContextType>;
  ProcedureUpdate?: ProcedureUpdateResolvers<ContextType>;
  VoteResultTexts?: VoteResultTextsResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  ProcessFlow?: ProcessFlowResolvers<ContextType>;
  Date?: GraphQLScalarType;
  Schema?: SchemaResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  Upload?: GraphQLScalarType;
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = GraphQlContext> = Resolvers<ContextType>;
