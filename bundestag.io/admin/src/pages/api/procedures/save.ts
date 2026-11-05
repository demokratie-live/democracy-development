import { getServerSession } from 'next-auth';
import { SAVE_VOTE_RESULTS, SAVE_VOTE_RESULTS_NAMED_POLL } from '../../../graphql/mutations/saveVoteResults';
import { getApolloClient } from '../../../lib/apolloClient';
import { authOptions } from '../auth/[...nextauth]';

const save = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).send('not authorized');
  }

  const client = getApolloClient(undefined, {
    headers: {
      'bio-auth-token': process.env.BIO_EDIT_TOKEN,
    },
  });
  try {
    await client.mutate({
      mutation: req.body.namedPoll ? SAVE_VOTE_RESULTS_NAMED_POLL : SAVE_VOTE_RESULTS,
      variables: req.body,
      context: {
        headers: {
          'bio-auth-token': process.env.BIO_EDIT_TOKEN,
        },
      },
    });
  } catch (e) {
    console.log(e?.graphQLErrors?.[0] ?? e);
    return res.status(500).send(e?.graphQLErrors?.[0]?.message ?? e?.message ?? 'save failed');
  }

  res.end();
};

export default save;
