import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

const graphql = async (req: NextApiRequest, res: NextApiResponse) => {
  const { query, variables } = req.body;

  if (!process.env.APP_API_URL) {
    res.status(500).send('Missing APP_API_URL');
    return;
  }

  try {
    const response = await axios.post(process.env.APP_API_URL, {
      query,
      variables,
    });

    res.status(response.status).send(response.data);
  } catch (error) {
    process.stdout.write(JSON.stringify(error, null, 2));
    res.status(500).send("Couldn't fetch data");
  }
};

export default graphql;
