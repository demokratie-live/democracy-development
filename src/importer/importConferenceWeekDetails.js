import { Scraper } from '@democracy-deutschland/scapacra';
import { ConferenceWeekDetailScraper } from '@democracy-deutschland/scapacra-bt';

import ConferenceWeekDetailModel from '../models/ConferenceWeekDetail';
import ProcedureModel from '../models/Procedure';

const isVote = (topic, heading) => {
  /*
  Erste Beratung = NEIN
  ——
  // Beratung des Antrags = JA , es sei denn TOP ‚Überweisungen im vereinfachten Verfahren‘ = NEIN
  Beratung des Antrags = NEIN
  ——
  Beratung der Beschlussempfehlung = JA
  Zweite und dritte Beratung = JA
  */
  if (topic.search(/Beratung des Antrags/i) !== -1) {
    if (heading && heading.search(/Abschließende Beratung(en)? ohne Aussprache/i) !== -1) {
      return true;
    }
    return false;
  }
  if (topic.search(/Erste Beratung/i) !== -1) {
    return false;
  }
  if (topic.search(/Beratung der Beschlussempfehlung/i) !== -1) {
    return true;
  }
  if (topic.search(/Zweite und dritte Beratung/i) !== -1) {
    return true;
  }
  return null;
};

const getProcedureIds = async documents => {
  // TODO unify
  // currently the dip21 scraper returns document urls like so:
  // "http://dipbt.bundestag.de:80/dip21/btd/19/010/1901038.pdf
  // The named poll scraper returns them like so:
  // http://dip21.bundestag.de/dip21/btd/19/010/1901038.pdf
  const docs = documents.map(document =>
    document.replace('http://dip21.bundestag.de/', 'http://dipbt.bundestag.de:80/'),
  );
  const procedures = await ProcedureModel.find(
    {
      // Find Procedures matching any of the given Documents, excluding Beschlussempfehlung
      importantDocuments: {
        $elemMatch: {
          $and: [{ url: { $in: docs } }, { type: { $ne: 'Beschlussempfehlung und Bericht' } }],
        },
      },
    },
    { procedureId: 1 },
  );

  return procedures.map(p => p.procedureId);
};

// eslint-disable-next-line no-shadow
const timeProcedure = async (isVote, documents, time) => {
  // Either set voting date to time or null - this keeps this self correcting
  const expectedVotingDate = isVote ? time : null;
  // TODO unify
  // currently the dip21 scraper returns document urls like so:
  // "http://dipbt.bundestag.de:80/dip21/btd/19/010/1901038.pdf
  // The named poll scraper returns them like so:
  // http://dip21.bundestag.de/dip21/btd/19/010/1901038.pdf
  const docs = documents.map(document =>
    document.replace('http://dip21.bundestag.de/', 'http://dipbt.bundestag.de:80/'),
  );
  await ProcedureModel.update(
    {
      // Find Procedures matching any of the given Documents, excluding Beschlussempfehlung
      importantDocuments: {
        $elemMatch: {
          $and: [{ url: { $in: docs } }, { type: { $ne: 'Beschlussempfehlung und Bericht' } }],
        },
      },
      // with current Status Beschlussempfehlung or Überwiesen
      // currentStatus: { $in: ['Beschlussempfehlung liegt vor', 'Überwiesen'] }, // We removed this rule, since it seems no longer nessecary
      // Update only when needed
      'customData.expectedVotingDate': { $ne: expectedVotingDate },
    },
    {
      $set: { 'customData.expectedVotingDate': expectedVotingDate },
    },
  );
};

export default async () => {
  Log.info('START CONFERENCE WEEK DETAIL SCRAPER');
  try {
    await Scraper.scrape([new ConferenceWeekDetailScraper()], dataPackages => {
      dataPackages.map(async dataPackage => {
        // Construct Database object
        const ConferenceWeekDetail = {
          URL: dataPackage.meta.url,
          id: dataPackage.data.id,
          previousYear: dataPackage.data.previous.year,
          previousWeek: dataPackage.data.previous.week,
          thisYear: dataPackage.data.this.year,
          thisWeek: dataPackage.data.this.week,
          nextYear: dataPackage.data.next.year,
          nextWeek: dataPackage.data.next.week,
          sessions: await Promise.all(
            dataPackage.data.sessions.map(async session => ({
              ...session,
              tops: await Promise.all(
                session.tops.map(async top => ({
                  ...top,
                  topic: await Promise.all(
                    top.topic.map(async topic => {
                      topic.isVote = isVote(topic.lines.join(' '), topic.heading); // eslint-disable-line no-param-reassign
                      topic.procedureIds = await getProcedureIds(topic.documents); // eslint-disable-line no-param-reassign
                      timeProcedure(topic.isVote, topic.documents, top.time);
                      return topic;
                    }),
                  ),
                })),
              ),
            })),
          ),
        };
        // Update/Insert
        await ConferenceWeekDetailModel.update(
          { id: ConferenceWeekDetail.id },
          { $set: ConferenceWeekDetail },
          { upsert: true },
        );
      });
    });
  } catch (error) {
    Log.error(`Conference Week Detail Scraper failed ${error.message}`);
  }
  Log.info('FINISH CONFERENCE WEEK DETAIL SCRAPER');
};
