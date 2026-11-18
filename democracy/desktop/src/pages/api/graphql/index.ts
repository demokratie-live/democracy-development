import type { NextApiRequest, NextApiResponse } from 'next';

const graphql = async (req: NextApiRequest, res: NextApiResponse) => {
  const { query, variables } = req.body;

  if (!process.env.APP_API_URL) {
    res.status(500).send('Missing APP_API_URL');
    return;
  }

  try {
    const response = await fetch(process.env.APP_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`Upstream responded with ${response.status}`);
    }

    res.status(response.status).send(await response.json());
  } catch (error) {
    process.stdout.write(`${error instanceof Error ? error.message : String(error)}\n`);
    res.status(500).send("Couldn't fetch data");
  }
};

export default graphql;
