import {
  ActivityModel,
  Device,
  DeviceModel,
  IProcedure,
  Phone,
  PhoneModel,
  ProcedureModel,
  User,
  UserModel,
  Vote,
  VoteModel,
  VoteSelection,
} from '@democracy-deutschland/democracy-common';
import config from '../../config';
import crypto from 'crypto';
import axios from 'axios';
import { connectDB, disconnectDB } from '../../services/mongoose';

const GRAPHQL_API_URL = process.env.GRAPHQL_API_URL || 'http://localhost:3000';

describe('Resolver: Vote', () => {
  let vote: Vote;
  let device: Device;
  const xDeviceHash = 'SOME_DEVICE_HASH_VOTE';
  const deviceHash = crypto.createHash('sha256').update(xDeviceHash).digest('hex');
  let procedure: IProcedure;
  let procedureNotVoted: IProcedure;
  const PHONE_NUMBER = `+49111113112`;
  const xPhoneHash = crypto.createHash('sha256').update(PHONE_NUMBER).digest('hex');
  const phoneHash = crypto.createHash('sha256').update(xPhoneHash).digest('hex');
  let phone: Phone;
  let userVerified: User;
  let userNotVerified: User;

  beforeAll(async () => {
    await connectDB(config.DB_URL, { debug: false });

    procedure = await ProcedureModel.create({
      procedureId: '0001101',
      title: 'tmp procedure for increaseActivity test',
      period: 1,
      type: 'Antrag',
      voteResults: {
        yes: 10,
        no: 20,
        abstination: 30,
      },
    });

    procedureNotVoted = await ProcedureModel.create({
      procedureId: '0001102',
      title: 'tmp procedure for increaseActivity test',
      period: 1,
      type: 'Antrag',
      voteResults: {
        yes: 0,
        no: 0,
        abstination: 0,
      },
    });

    device = await DeviceModel.create({
      deviceHash,
    });

    phone = await PhoneModel.create({
      phoneHash,
    });

    vote = await VoteModel.create({
      procedure: procedure,
      type: 'Phone',
      votes: {
        general: {
          yes: 1,
          no: 2,
          abstain: 3,
        },
        cache: {
          yes: 4,
          no: 5,
          abstain: 6,
        },
        constituencies: [
          {
            constituency: '107',
            yes: 7,
            no: 8,
            abstain: 9,
          },
        ],
      },
      state: 'COMPLETED',
      voters: [
        {
          voter: phone._id,
        },
      ],
    });

    userVerified = await UserModel.create({
      verified: true,
      device,
      phone,
    });
    userNotVerified = await UserModel.create({
      verified: false,
      device,
    });
  });

  afterAll(async () => {
    await Promise.all([
      vote.remove(),
      device.remove(),
      procedure.remove(),
      procedureNotVoted.remove(),
      userVerified.remove(),
      userNotVerified.remove(),
      phone.remove(),
      ActivityModel.deleteOne({ procedure: procedureNotVoted }),
      VoteModel.deleteOne({ procedure: procedureNotVoted }),
    ]);

    await disconnectDB();
  });
  describe('Query', () => {
    describe('votes', () => {
      it('should return all votes', async () => {
        const response = await axios.post(
          GRAPHQL_API_URL,
          {
            query: `
                query Votes($procedure: ID!) {
                    votes(procedure: $procedure ) {
                      _id
                      voted
                      voteResults {
                        yes
                        no
                        abstination
                        total
                      }
                    }
                }
            `,
            variables: {
              procedure: procedure._id,
            },
          },
          {
            headers: {
              'x-device-hash': xDeviceHash,
              'x-phone-hash': xPhoneHash,
            },
          },
        );

        const { data } = response.data;

        expect(data).toBeDefined();
        expect(data.votes).toBeDefined();
        expect(data.votes.voted).toBeTruthy();
        expect(data.votes.voteResults).toBeDefined();
        expect(data.votes.voteResults.yes).toEqual(4);
        expect(data.votes.voteResults.no).toEqual(5);
        expect(data.votes.voteResults.abstination).toEqual(6);
        expect(data.votes.voteResults.total).toEqual(15);
      });

      it('try to get votes without device', async () => {
        const response = await axios.post(GRAPHQL_API_URL, {
          query: `
                query Votes($procedure: ID!) {
                    votes(procedure: $procedure ) {
                      _id
                      voted
                      voteResults {
                        yes
                        no
                        abstination
                        total
                      }
                    }
                }
            `,
          variables: {
            procedure: procedure._id,
          },
        });

        const { data, errors } = response.data;

        expect(data).toBeDefined();
        expect(data.votes).toBeNull();
        expect(errors).toBeDefined();
        expect(errors[0].message).toEqual('Not Authorised!');
      });
    });

    describe('votedProcedures', () => {
      it('get voted procedures', async () => {
        const response = await axios.post(
          GRAPHQL_API_URL,
          {
            query: `
                query VotedProcedures {
                    votedProcedures {
                        procedureId
                    }
                }
            `,
          },
          {
            headers: {
              'x-device-hash': xDeviceHash,
              'x-phone-hash': xPhoneHash,
            },
          },
        );

        const { data } = response.data;

        expect(data).toBeDefined();
        expect(data.votedProcedures).toBeDefined();
        expect(data.votedProcedures.length).toStrictEqual(1);
      });

      it('try to get voted procedures without phone', async () => {
        const response = await axios.post(
          GRAPHQL_API_URL,
          {
            query: `
                    query VotedProcedures {
                        votedProcedures {
                        procedureId
                        }
                    }
                `,
          },
          {
            headers: {
              'x-device-hash': xDeviceHash,
            },
          },
        );

        const { data } = response.data;

        expect(data).toBeDefined();
        expect(data).toBeNull();
      });
    });
  });

  describe('Mutation', () => {
    describe('vote', () => {
      it('Not Verified', async () => {
        const response = await axios.post(
          GRAPHQL_API_URL,
          {
            query: `
                mutation Vote($procedure: ID!, $selection: VoteSelection!) {
                    vote(procedure: $procedure, selection: $selection) {
                        voted
                        voteResults {
                            yes
                            no
                            abstination
                            total
                        }
                    }
                }
            `,
            variables: {
              procedure: procedureNotVoted._id,
              selection: VoteSelection.Yes,
            },
          },
          {
            headers: {
              'x-device-hash': xDeviceHash,
            },
          },
        );

        const { data, errors } = response.data;

        expect(data).toBeDefined();
        expect(data).toBeNull();
        expect(errors).toBeDefined();
        expect(errors[0].message).toEqual('Not Verified!');
      });

      it('should vote', async () => {
        const response = await axios.post(
          GRAPHQL_API_URL,
          {
            query: `
                mutation Vote($procedure: ID!, $selection: VoteSelection!) {
                    vote(procedure: $procedure, selection: $selection) {
                        voted
                        voteResults {
                            yes
                            no
                            abstination
                            total
                        }
                    }
                }
            `,
            variables: {
              procedure: procedureNotVoted._id,
              selection: VoteSelection.Yes,
            },
          },
          {
            headers: {
              'x-device-hash': xDeviceHash,
              'x-phone-hash': xPhoneHash,
            },
          },
        );

        const { data, errors } = response.data;

        expect(errors).toBeUndefined();
        expect(data).toBeDefined();
        expect(data.vote).toBeDefined();
        expect(data.vote.voted).toBeTruthy();
        expect(data.vote.voteResults).toBeDefined();
        expect(data.vote.voteResults.yes).toEqual(1);
        expect(data.vote.voteResults.no).toEqual(0);
        expect(data.vote.voteResults.abstination).toEqual(0);
        expect(data.vote.voteResults.total).toEqual(1);
      });
    });
  });
});
