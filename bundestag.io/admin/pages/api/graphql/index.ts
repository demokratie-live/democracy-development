import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { getSession } from "next-auth/client";

const graphql = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });

  if (!!session?.user) {
    const response = await axios.post(
      process.env.BUNDESTAGIO_SERVER_URL,
      req.body,
      {
        headers: req.headers,
      }
    );

    res.status(response.status).send(response.data);
  } else {
    res.status(403).send("not authorized");
  }
};

export default graphql;
