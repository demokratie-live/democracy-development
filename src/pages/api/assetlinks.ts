import { NextApiRequest, NextApiResponse } from 'next';

/**
 * NextJS api endpoint to serve the apple-app-site-association file
 * to present different versoins for different environments
 * for example democracy-app.de presents the production version,
 * internal.democracy-app.de presents the staging & development version
 */

const assetlinksProduction = JSON.stringify([
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: 'de.democracydeutschland.app',
      sha256_cert_fingerprints: [
        '56:C3:CC:61:4B:16:7C:61:D7:77:FB:12:E6:57:96:B4:04:F0:B4:03:4D:C1:0D:63:91:90:4B:67:E7:E7:5A:F5',
      ],
    },
  },
]);

const assetlinksStagingDevelopment = JSON.stringify([
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: 'de.democracydeutschland.app.internal',
      sha256_cert_fingerprints: [
        'FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C',
      ],
    },
  },
]);

export default function handler(
  { headers: { host } }: NextApiRequest,
  res: NextApiResponse
) {
  const isProduction = host === 'democracy-app.de';

  const assetlinks = isProduction
    ? assetlinksProduction
    : assetlinksStagingDevelopment;

  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(assetlinks);
}
