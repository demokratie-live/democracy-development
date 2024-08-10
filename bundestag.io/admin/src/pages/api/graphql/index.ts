import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { axiosClient } from '../../../lib/axios';
import { config } from '@/lib/config';
import { log } from '@/lib/logger';

const graphql = async (req: NextApiRequest, res: NextApiResponse) => {
  log.debug(`api->graphql ${JSON.stringify(req.body.variables)}`);

  const session = await getServerSession(req, res, authOptions);
  const { query, variables } = req.body;

  if (!!session?.user) {
    try {
      const response = await axiosClient.post(config.BUNDESTAGIO_SERVER_URL, { query, variables });

      res.status(response.status).send(response.data);
    } catch (error) {
      log.error(error);
      res.status(500).send("Couldn't fetch data");
    }
  } else {
    res.status(403).send('not authorized');
  }
};

export default graphql;
