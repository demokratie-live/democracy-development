import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { log } from '../../../lib/logger';
import axios from 'axios';

const get = async (req, res) => {
  if (!process.env.NON_NAMED_VOTES_AI_SERVER_URL) {
    throw new Error('NON_NAMED_VOTES_AI_SERVER_URL not set');
  }
  const session = await getServerSession(req, res, authOptions);
  log.debug(session);
  if (!!session?.user) {
    const { pdfUrl, title, drucksachen } = req.query as { pdfUrl: string; title: string; drucksachen?: string[] };
    log.info('getBeschlusstext start');
    log.debug(`getBeschlusstext: ${pdfUrl}, ${title}, ${drucksachen}`);

    const response = await axios.get(`${process.env.NON_NAMED_VOTES_AI_SERVER_URL}/beschlusstext`, {
      params: { pdfUrl, title, drucksachen },
      headers: {
        Authorization: `Token ${process.env.NON_NAMED_VOTES_AI_SECRET}`,
      },
    });

    log.debug(response.data);

    res.status(200).json(response.data);
  } else {
    throw new Error('not authorized');
  }

  res.end();
};

export default get;
