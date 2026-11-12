import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { log } from '../../../lib/logger';
import axios from 'axios';

const get = async (req, res) => {
  if (!process.env.NON_NAMED_VOTES_AI_SERVER_URL) {
    return res.status(500).send('NON_NAMED_VOTES_AI_SERVER_URL not set');
  }
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(403).send('not authorized');
  }

  const { pdfUrl, title } = req.query as { pdfUrl: string; title: string };
  // axios sends arrays as drucksachen[]=…
  const drucksachen = req.query.drucksachen ?? req.query['drucksachen[]'];
  log.info('getBeschlusstext start');

  try {
    const response = await axios.get(`${process.env.NON_NAMED_VOTES_AI_SERVER_URL}/beschlusstext`, {
      params: { pdfUrl, title, drucksachen },
      headers: {
        Authorization: `Token ${process.env.NON_NAMED_VOTES_AI_SECRET}`,
      },
      timeout: 5 * 60 * 1000,
    });
    return res.status(200).json(response.data);
  } catch (err) {
    const status = err?.response?.status ?? 502;
    const message = err?.response?.data?.message ?? err?.message ?? 'KI-Anfrage fehlgeschlagen';
    log.error(`getBeschlusstext failed: ${status} ${message}`);
    return res.status(status).send(message);
  }
};

export default get;
