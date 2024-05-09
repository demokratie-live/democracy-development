import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { config } from '@/lib/config';
import request from 'graphql-request';
import { ParseDecisionDocument, ParseDecisionQuery, ParseDecisionQueryVariables } from '@/__generated/gql-ai/graphql';

const aiSimulationData = [
  {
    name: 'Union',
    vote: 'YES',
  },
  {
    name: 'SPD',
    vote: 'ABSTINATION',
  },
  {
    name: 'FDP',
    vote: 'NO',
  },
  {
    name: 'Grüne',
    vote: 'YES',
  },
  {
    name: 'AfD',
    vote: 'NO',
  },
  {
    name: 'Linke',
    vote: 'YES',
  },
];

const graphqlAi = async (req: NextApiRequest, res: NextApiResponse) => {
  if (config.AI_SIMULATION) {
    return res.status(200).send(aiSimulationData);
  }
  const session = await getServerSession(req, res, authOptions);

  const { decision, period } = req.body.variables;

  if (!!session?.user && decision && period) {
    try {
      const response = await request<ParseDecisionQuery, ParseDecisionQueryVariables>(
        config.AI_SERVER_URL!,
        ParseDecisionDocument,
        {
          decision,
          period,
        },
        {
          'x-token': `${config.AI_ACCESS_TOKEN}`,
        },
      ).then((data) => {
        console.info(JSON.stringify(data, null, 2));
        return {
          status: 200,
          data: data.parseDecision?.result?.votes,
        };
      });

      return res.status(response.status).send(response.data);
    } catch (error) {
      console.error(error);
      return res.status(500).send("Couldn't fetch data" + JSON.stringify(error));
    }
  } else {
    return res.status(403).send('not authorized');
  }
};

export default graphqlAi;
