import elasticsearch from 'elasticsearch';

import CONFIG from '../../config';

const client = new elasticsearch.Client({
  host: `${CONFIG.ELASTICSEARCH_URL}:9200`,
  log: process.env.NODE_ENV === 'development' ? 'warning' : 'error',
});

export default client;
