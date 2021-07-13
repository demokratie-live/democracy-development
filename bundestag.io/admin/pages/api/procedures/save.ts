import { getSession } from "next-auth/client";
import {
  SAVE_VOTE_RESULTS,
  SAVE_VOTE_RESULTS_NAMED_POLL,
} from "../../../graphql/mutations/saveVoteResults";
import { getApolloClient } from "../../../lib/apolloClient";

const save = async (req, res) => {
  const session = await getSession({ req });
  if (!!session?.user) {
    const client = getApolloClient(undefined, {
      headers: {
        "bio-auth-token": process.env.BIO_EDIT_TOKEN,
      },
    });
    if (!req.body.namedPoll) {
      await client
        .mutate({
          mutation: SAVE_VOTE_RESULTS,
          variables: req.body,
          context: {
            headers: {
              "bio-auth-token": process.env.BIO_EDIT_TOKEN,
            },
          },
        })
        .catch((e) =>
          res.status(e.networkError.statusCode).send(e.networkError.result)
        );
    } else {
      console.log(req.body);
      await client
        .mutate({
          mutation: SAVE_VOTE_RESULTS_NAMED_POLL,
          variables: req.body,
          context: {
            headers: {
              "bio-auth-token": process.env.BIO_EDIT_TOKEN,
            },
          },
        })
        .catch((e) =>
          res.status(e.networkError.statusCode).send(e.networkError.result)
        );
    }
  } else {
    throw new Error("not authorized");
  }

  res.end();
};

export default save;
