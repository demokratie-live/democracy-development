import { NextApiRequest, NextApiResponse } from 'next';

/**
 * NextJS api endpoint to serve the apple-app-site-association file
 * to present different versoins for different environments
 * for example democracy-app.de presents the production version,
 * internal.democracy-app.de presents the staging & development version
 */

const appleAppSiteAssociationProduction = JSON.stringify({
  applinks: {
    apps: [],
    details: [
      {
        appID: 'A4B84UJD7M.de.democracy-deutschland.clientapp',
        paths: ['*'],
      },
    ],
  },
});

const appleAppSiteAssociationStagingDevelopment = JSON.stringify({
  applinks: {
    apps: [],
    details: [
      {
        appID: 'A4B84UJD7M.de.democracy-deutschland.clientapp.internal',
        paths: ['*'],
      },
    ],
  },
});

export default function handler(
  { headers: { host } }: NextApiRequest,
  res: NextApiResponse
) {
  const isProduction = host === 'democracy-app.de';

  const appleAppSiteAssociation = isProduction
    ? appleAppSiteAssociationProduction
    : appleAppSiteAssociationStagingDevelopment;

  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(appleAppSiteAssociation);
}
