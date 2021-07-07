import { getSession } from "next-auth/client";
import { SAVE_VOTE_RESULTS } from "../../../graphql/mutations/saveVoteResults";
import { getApolloClient } from "../../../lib/apolloClient";

const save = async (req, res) => {
  const session = await getSession({ req });
  if (!!session?.user) {
    const client = getApolloClient(undefined, {
      headers: {
        "bio-auth-token": process.env.BIO_EDIT_TOKEN,
      },
    });
    await client.mutate({
      mutation: SAVE_VOTE_RESULTS,
      variables: req.body,
      context: {
        headers: {
          "bio-auth-token": process.env.BIO_EDIT_TOKEN,
        },
      },
    });
  } else {
    throw new Error("not authorized");
  }

  res.end();
};

export default save;
