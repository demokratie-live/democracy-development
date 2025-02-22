import { DeputyModel } from '@democracy-deutschland/bundestagio-common';
import { DeputyListItem, Period } from './types';
import { fetchDeputyDetails, fetchDeputyList } from './scraper';
import { debugCheck, getUsername } from './utils';
import { getDeputyListUrl, isDebug } from './config';

const processDeputy = async (deputyListItem: DeputyListItem, period: Period) => {
  if (isDebug) {
    debugCheck('URL', deputyListItem.URL, 'Deputy List Item');
    debugCheck('webId', deputyListItem.webId, 'Deputy List Item');
  }

  const lastUpdate = await DeputyModel.findOne({ webId: deputyListItem.webId }).then(
    (deputy) => deputy?.updatedAt as string,
  );

  // Skip if last update is less than 7 days old
  if (lastUpdate && new Date(lastUpdate).getTime() > Date.now() - 1000 * 60 * 60 * 24 * 7) {
    console.log('skip', deputyListItem.URL);
    return;
  }

  if (isDebug) {
    console.log('[DEBUG] lastUpdate', lastUpdate);
  }

  const deputyData = await fetchDeputyDetails(deputyListItem.URL);

  if (isDebug) {
    debugCheck('imgURL', deputyData.imgURL, deputyListItem.URL);
    debugCheck('biography', deputyData.biography, deputyListItem.URL);
    debugCheck('party', deputyData.party, deputyListItem.URL);
    debugCheck('name', deputyData.name, deputyListItem.URL);
    debugCheck('job', deputyData.job, deputyListItem.URL);
    debugCheck('office', deputyData.office, deputyListItem.URL);
    if (deputyData.links && Array.isArray(deputyData.links)) {
      deputyData.links.forEach((link, index) => {
        debugCheck(`links[${index}].name`, link.name, deputyListItem.URL);
        debugCheck(`links[${index}].URL`, link.URL, deputyListItem.URL);
      });
    }
    debugCheck('constituency', deputyData.constituency, deputyListItem.URL);
    debugCheck('constituencyName', deputyData.constituencyName, deputyListItem.URL);
    debugCheck('directCandidate', deputyData.directCandidate, deputyListItem.URL);
  }

  const deputy = {
    period,
    URL: deputyListItem.URL,
    webId: deputyListItem.webId,
    ...deputyData,
    biography: Array.isArray(deputyData.biography) ? deputyData.biography.filter((d: string) => !!d) : [],
    links: Array.isArray(deputyData.links)
      ? deputyData.links.map((link) => ({
          ...link,
          username: getUsername(link),
        }))
      : [],
  };

  if (isDebug) {
    console.log(`[DEBUG] Processing deputy with webId: ${deputyListItem.webId}`);
    console.log(`[DEBUG] Data validation status: ${Object.keys(deputy).length > 0 ? 'Complete' : 'Incomplete'}`);
  } else {
    console.log(`Processing: ${deputy.name}`);
  }

  await DeputyModel.updateOne({ webId: deputy.webId }, { $set: deputy }, { upsert: true });
};

export const processDeputyList = async (period: Period) => {
  let offset = 0;
  let hasMore = true;
  while (hasMore) {
    const url = getDeputyListUrl({ period, offset });
    const deputyList = await fetchDeputyList(url);
    for (const deputyListItem of deputyList.deputies) {
      await processDeputy(deputyListItem, period);
    }
    if (deputyList.deputies.length) {
      offset += deputyList.deputies.length;
    } else {
      hasMore = false;
    }
    console.log(`offset: ${offset} 🚀`);
  }
};
