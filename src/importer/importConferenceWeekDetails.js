import { Scraper } from '@democracy-deutschland/scapacra';
import { ConferenceWeekDetailScraper } from '@democracy-deutschland/scapacra-bt';

import PROCEDURE_DEFINITIONS from '../definitions/procedure';
import CONFERENCEWEEKDETAIL_DEFINITIONS from '../definitions/conferenceWeekDetail';

import ConferenceWeekDetailModel from '../models/ConferenceWeekDetail';
import ProcedureModel from '../models/Procedure';

const isVote = (topic, heading, documents, status) => {
  /*
  Erste Beratung = NEIN
  ——
  // Beratung des Antrags = JA , es sei denn TOP ‚Überweisungen im vereinfachten Verfahren‘ = NEIN
  Beratung des Antrags = NEIN
  ——
  Beratung der Beschlussempfehlung = JA
  Zweite und dritte Beratung = JA
  */
  if (topic.search(CONFERENCEWEEKDETAIL_DEFINITIONS.TOPIC.FIND_BERATUNG_ANTRAG) !== -1) {
    if (
      heading &&
      heading.search(CONFERENCEWEEKDETAIL_DEFINITIONS.HEADING.FIND_ABSCHLIESSENDE_BERATUNG) !== -1
    ) {
      return true;
    }
    if (
      status &&
      status.find(s => {
        // if(s.documents.sort().join(',') === documents.sort().join(',') &&
        if (
          s.documents.some(l => documents.includes(l)) &&
          s.line.search(CONFERENCEWEEKDETAIL_DEFINITIONS.STATUS.FIND_ANTRAG_COMPLETED) !== -1
        ) {
          return true;
        }
        return false;
      })
    ) {
      return true;
    }
    return false;
  }
  if (topic.search(CONFERENCEWEEKDETAIL_DEFINITIONS.TOPIC.FIND_ERSTE_BERATUNG) !== -1) {
    return false;
  }
  if (
    topic.search(CONFERENCEWEEKDETAIL_DEFINITIONS.TOPIC.FIND_BERATUNG_BESCHLUSSEMPFEHLUNG) !== -1 ||
    topic.search(CONFERENCEWEEKDETAIL_DEFINITIONS.TOPIC.FIND_ZWEITE_DRITTE_BERATUNG) !== -1 ||
    topic.search(CONFERENCEWEEKDETAIL_DEFINITIONS.TOPIC.FIND_ZWEITE_BERATUNG_SCHLUSSABSTIMMUNG) !==
      -1 ||
    topic.search(CONFERENCEWEEKDETAIL_DEFINITIONS.TOPIC.FIND_DRITTE_BERATUNG) !== -1
  ) {
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
          $and: [
            // Match at least one Document
            { url: { $in: docs } },
            // which is not Beschlussempfehlung und Bericht || Beschlussempfehlung
            {
              type: {
                $nin: [
                  PROCEDURE_DEFINITIONS.IMPORTANT_DOCUMENTS.TYPE.BESCHLUSSEMPFEHLUNG_BERICHT,
                  PROCEDURE_DEFINITIONS.IMPORTANT_DOCUMENTS.TYPE.BESCHLUSSEMPFEHLUNG,
                  PROCEDURE_DEFINITIONS.IMPORTANT_DOCUMENTS.TYPE.BERICHT,
                ],
              },
            },
          ],
        },
      },
    },
    { procedureId: 1 },
  );

  return procedures.map(p => p.procedureId);
};

export default async () => {
  Log.info('START CONFERENCE WEEK DETAIL SCRAPER');
  try {
    const voteDates = [];
    let lastProcedureIds = [];
    await Scraper.scrape(new ConferenceWeekDetailScraper(), async dataPackage => {
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
        sessions: await dataPackage.data.sessions.reduce(async (pSession, session) => {
          const resultSession = await pSession;
          resultSession.push({
            ...session,
            tops: await session.tops.reduce(async (pTop, top) => {
              // Await for last result
              const resultTop = await pTop;
              // correct Time
              // TODO move to scraper? Since the scraper construct this data in a date form it might be wise to do it correctly there (?)
              if (resultTop.length) {
                const lastTop = resultTop[resultTop.length - 1];
                if (lastTop && lastTop.time.getUTCHours() > top.time.getUTCHours()) {
                  top.time.setDate(top.time.getDate() + 1);
                }
              }
              // Write VoteEnd Date
              lastProcedureIds.forEach(procedureId => {
                if (
                  voteDates[procedureId].voteDate &&
                  voteDates[procedureId].voteDate <= top.time
                ) {
                  voteDates[procedureId].voteEnd = top.time;
                }
              });
              lastProcedureIds = [];
              // Append current result
              resultTop.push({
                ...top,
                topic: await Promise.all(
                  top.topic.map(async topic => {
                    topic.isVote = isVote(topic.lines.join(' '), top.heading,topic.documents,
                    top.status); // eslint-disable-line no-param-reassign
                    topic.procedureIds = await getProcedureIds(topic.documents); // eslint-disable-line no-param-reassign
                    // Save VoteDates to update them at the end when the correct values are present
                    topic.procedureIds.forEach(procedureId => {
                      // Override voteDate only if there is none set or we would override it by a new date
                      if (
                        !voteDates[procedureId] ||
                        !voteDates[procedureId].voteDate ||
                        topic.isVote === true
                      ) {
                        voteDates[procedureId] = {
                          procedureId,
                          voteDate: topic.isVote ? top.time : null,
                          voteEnd: null,
                        };
                      }
                    });
                    // Remember last procedureIds to save voteEnd Date
                    lastProcedureIds = lastProcedureIds.concat(topic.procedureIds);
                    return topic;
                  }),
                ),
              });
              return resultTop;
            }, []),
          });
          return resultSession;
        }, []),
      };
      // Update/Insert
      await ConferenceWeekDetailModel.update(
        { id: ConferenceWeekDetail.id },
        { $set: ConferenceWeekDetail },
        { upsert: true },
      );
    });
    // Update Procedure VoteDates
    voteDates.map(async procedureUpdate => {
      await ProcedureModel.update(
        {
          procedureId: procedureUpdate.procedureId,
          // Update only when needed
          $or: [
            { voteDate: { $ne: procedureUpdate.voteDate } },
            { voteEnd: { $ne: procedureUpdate.voteEnd } },
          ],
        },
        {
          $set: {
            voteDate: procedureUpdate.voteDate,
            voteEnd: procedureUpdate.voteEnd,
          },
        },
      );
    });
  } catch (error) {
    Log.error(`Conference Week Detail Scraper failed ${error.message}`);
  }
  Log.info('FINISH CONFERENCE WEEK DETAIL SCRAPER');
};
