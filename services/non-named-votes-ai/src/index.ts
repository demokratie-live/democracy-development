import express from 'express';
import { authMiddleware } from './authMiddleware';
import { getBeschlusstext } from './beschlusstextController';
import { mongoConnect } from '@democracy-deutschland/bundestagio-common';
import { log } from './logger';
import helmet from 'helmet';
import { limiter } from './rateLimiter';
import { deleteAll } from './deleteAll';

(async () => {
  await mongoConnect(process.env.DB_URL!);

  const app = express();

  // Disable x-powered-by header to make it harder for attackers
  app.disable('x-powered-by');

  // Helmet verwenden, um HTTP-Header zu sichern
  app.use(helmet());

  // apply rate limiter to all requests
  app.use(limiter);

  app.get('/beschlusstext', authMiddleware, getBeschlusstext);

  app.delete('/all', authMiddleware, deleteAll);

  const PORT = process.env.PORT || 3005;
  app.listen(PORT, () => {
    log.info(`Server is running`);
    log.debug(`Server is running on port ${PORT}`);
  });
})();
