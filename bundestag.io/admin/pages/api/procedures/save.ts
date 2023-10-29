import { getServerSession } from 'next-auth';
import { SAVE_VOTE_RESULTS, SAVE_VOTE_RESULTS_NAMED_POLL } from '../../../graphql/mutations/saveVoteResults';
import { getApolloClient } from '../../../lib/apolloClient';
import { authOptions } from '../auth/[...nextauth]';

const save = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  console.log(session);
  if (!!session?.user) {
    const client = getApolloClient(undefined, {
      headers: {
        'bio-auth-token': process.env.BIO_EDIT_TOKEN,
      },
    });
    if (!req.body.namedPoll) {
      await client
        .mutate({
          mutation: SAVE_VOTE_RESULTS,
          variables: req.body,
          context: {
            headers: {
              'bio-auth-token': process.env.BIO_EDIT_TOKEN,
            },
          },
        })
        .catch((e) => {
          console.log(e.graphQLErrors[0]);
          return res.status(500).send(e.graphQLErrors[0].message);
        });
    } else {
      console.log(req.body);
      await client
        .mutate({
          mutation: SAVE_VOTE_RESULTS_NAMED_POLL,
          variables: req.body,
          context: {
            headers: {
              'bio-auth-token': process.env.BIO_EDIT_TOKEN,
            },
          },
        })
        .catch((e) => {
          console.log(e.graphQLErrors[0]);
          return res.status(500).send(e.graphQLErrors[0].message);
        });
    }
  } else {
    throw new Error('not authorized');
  }

  res.end();
};

export default save;
