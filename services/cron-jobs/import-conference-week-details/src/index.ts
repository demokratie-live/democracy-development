// Main entry point with error handling
import { log } from 'crawlee';
import { main } from './main.js';
import { getResults } from './routes.js';
import { ConferenceWeekDetailModel, mongoConnect, ProcedureModel } from '@democracy-deutschland/bundestagio-common';
import { IConferenceWeekDetail } from '@democracy-deutschland/bundestagio-common/dist/models/ConferenceWeekDetail/schema.js';
import { UpdateQuery } from 'mongoose';
import url from 'url';

import {
  PROCEDURE as PROCEDURE_DEFINITIONS,
  CONFERENCEWEEKDETAIL as CONFERENCEWEEKDETAIL_DEFINITIONS,
} from '@democracy-deutschland/bundestag.io-definitions';

// Configure logging
log.setLevel(log.LEVELS.INFO);

/**
 * Interface for status items used in isVote function
 */
interface StatusItem {
  documents: string[];
  lines: string[];
}

/**
 * Determines if a topic is a vote based on content analysis
 */
const isVote = (
  topic: string,
  heading: string | null | undefined,
  documents: string[],
  status: StatusItem[] | null | undefined,
) => {
  /*
  Erste Beratung = NEIN
  ——
  // Beratung des Antrags = JA , es sei denn TOP ‚Überweisungen im vereinfachten Verfahren' = NEIN
  Beratung des Antrags = NEIN
  ——
  Beratung der Beschlussempfehlung = JA
  Zweite und dritte Beratung = JA
  */
  if (topic.search(CONFERENCEWEEKDETAIL_DEFINITIONS.TOPIC.FIND_BERATUNG_ANTRAG) !== -1) {
    if (heading && heading.search(CONFERENCEWEEKDETAIL_DEFINITIONS.HEADING.FIND_ABSCHLIESSENDE_BERATUNG) !== -1) {
      return true;
    }
    if (
      status &&
      status.find((s: StatusItem) => {
        if (
          s.documents.some((l: string) => documents.includes(l)) &&
          s.lines.join(' ').search(CONFERENCEWEEKDETAIL_DEFINITIONS.STATUS.FIND_ANTRAG_COMPLETED) !== -1
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
    topic.search(CONFERENCEWEEKDETAIL_DEFINITIONS.TOPIC.FIND_ZWEITE_BERATUNG_SCHLUSSABSTIMMUNG) !== -1 ||
    topic.search(CONFERENCEWEEKDETAIL_DEFINITIONS.TOPIC.FIND_DRITTE_BERATUNG) !== -1
  ) {
    return true;
  }
  return null;
};

/**
 * Retrieves procedure IDs associated with the given documents
 */
const getProcedureIds = async (documents: string[]) => {
  log.info('getProcedureIds', { documents });
  const docs = documents.map((document: string) => {
    return `${url.parse(document).path?.split('/').slice(-1)[0]}$`;
  });
  log.info('getProcedureIds', { docs });

  if (docs.length === 0) {
    return [];
  }

  const procedures = await ProcedureModel.find(
    {
      // Find Procedures matching any of the given Documents, excluding Beschlussempfehlung
      importantDocuments: {
        $elemMatch: {
          $and: [
            // Match at least one Document
            { url: { $regex: docs.join('|') } },
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

  log.info('getProcedureIds Query', {
    query: JSON.stringify({
      // Find Procedures matching any of the given Documents, excluding Beschlussempfehlung
      importantDocuments: {
        $elemMatch: {
          $and: [
            // Match at least one Document
            { url: { $regex: docs.join('|') } },
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
    }),
  });

  log.info('getProcedureIds', { procedures });

  return procedures.map((p) => p.procedureId);
};

export async function run(): Promise<void> {
  try {
    if (!process.env.TEST) {
      await mongoConnect(process.env.DB_URL || 'mongodb://localhost:27017/bundestagio');
    }
    // Run the crawler
    await main();

    // Log the results
    const results = getResults();
    log.info('Fetched conference weeks:', results);

    // if test return here
    if (process.env.TEST) {
      log.info('Test mode: Skipping MongoDB save');
      return;
    }

    log.info('Connected to MongoDB');

    // Save to MongoDB
    log.info('Saving conference weeks to MongoDB...');
    try {
      for (const result of results) {
        log.info('Processing conference week:', { url: result.url });
        const data: UpdateQuery<IConferenceWeekDetail> = {
          id: `${result.year}_${String(result.week).padStart(2, '0')}`,
          URL: `https://www.bundestag.de${result.url}`,
          thisYear: result.year,
          thisWeek: result.week,
          previousYear: result.previousWeek?.year || null,
          previousWeek: result.previousWeek?.week || null,
          nextYear: result.nextWeek?.year || null,
          nextWeek: result.nextWeek?.week || null,
          sessions: await Promise.all(
            result.sessions.map(async (session) => ({
              date: session.date ? new Date(session.date) : null,
              dateText: session.dateText,
              session: session.session,
              tops: await Promise.all(
                session.tops.map(async (top) => ({
                  time: top.time,
                  top: top.top,
                  heading: top.heading,
                  article: top.article ? `https://www.bundestag.de${top.article}` : null,
                  topic: await Promise.all(
                    top.topic.map(async (t) => {
                      // Determine if this is a vote
                      const topicText = t.lines.join(' ');
                      const isVoteResult = isVote(topicText, top.heading, t.documents, top.status);

                      // Get associated procedure IDs
                      const procedureIds = await getProcedureIds(t.documents);
                      log.info('getProcedureIds', { topicText, procedureIds });

                      return {
                        lines: t.lines,
                        documents: t.documents,
                        documentIds: t.documentIds || [],
                        isVote: isVoteResult === true,
                        procedureIds,
                      };
                    }),
                  ),
                  status: top.status.map((s) => ({
                    line: s.lines.join(' '),
                    documents: s.documents || [],
                  })),
                })),
              ),
            })),
          ),
        };

        log.info('Data to save:', { week: data.thisWeek, year: data.thisYear });
        await ConferenceWeekDetailModel.findOneAndUpdate(
          {
            id: data.id,
          },
          data,
          { upsert: true, new: true, runValidators: true },
        );

        log.info(`Saved conference week ${data.thisYear}-${data.thisWeek} to database`);
      }

      log.info('Successfully saved all conference weeks to MongoDB');
      process.exit(0);
    } catch (dbError) {
      log.error('Error saving to MongoDB:', {
        message: dbError instanceof Error ? dbError.message : String(dbError),
      });
      // Don't exit process here to ensure we at least have the JSON file
    }
  } catch (error) {
    // Handle different types of errors
    if (error instanceof Error) {
      // Network errors and other standard errors
      log.error('Error while importing conference week details (NETWORK_ERROR):', { message: error.message });
      log.error('Original error:', { error });
      process.exit(1);
    } else {
      // Unknown errors
      log.error('Error while importing conference week details (UNKNOWN_ERROR):', { error });
      process.exit(1);
    }
  }
}

// Run the crawler if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  void run();
}
