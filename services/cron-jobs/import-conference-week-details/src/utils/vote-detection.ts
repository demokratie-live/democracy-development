import { log } from 'crawlee';
import { ProcedureModel } from '@democracy-deutschland/bundestagio-common';
import {
  PROCEDURE as PROCEDURE_DEFINITIONS,
  CONFERENCEWEEKDETAIL as CONFERENCEWEEKDETAIL_DEFINITIONS,
} from '@democracy-deutschland/bundestag.io-definitions';

/**
 * Determines if a topic is a vote based on content analysis
 */
export function isVote(
  topic: string[],
  heading: string | null | undefined,
  _documents: string[],
  status: string[] | null | undefined,
): boolean | null {
  const topicText = topic.join(' ');

  /*
  Erste Beratung = NEIN
  ——
  // Beratung des Antrags = JA , es sei denn TOP ‚Überweisungen im vereinfachten Verfahren' = NEIN
  Beratung des Antrags = NEIN
  ——
  Beratung der Beschlussempfehlung = JA
  Zweite und dritte Beratung = JA
  */
  if (topicText.search(CONFERENCEWEEKDETAIL_DEFINITIONS.TOPIC.FIND_BERATUNG_ANTRAG) !== -1) {
    if (heading && heading.search(CONFERENCEWEEKDETAIL_DEFINITIONS.HEADING.FIND_ABSCHLIESSENDE_BERATUNG) !== -1) {
      return true;
    }
    if (
      status &&
      status.find((line: string) => {
        // Check if status line mentions completion/voting
        if (line.search(CONFERENCEWEEKDETAIL_DEFINITIONS.STATUS.FIND_ANTRAG_COMPLETED) !== -1) {
          return true;
        }
        return false;
      })
    ) {
      return true;
    }
    return false;
  }
  if (topicText.search(CONFERENCEWEEKDETAIL_DEFINITIONS.TOPIC.FIND_ERSTE_BERATUNG) !== -1) {
    return false;
  }
  if (
    topicText.search(CONFERENCEWEEKDETAIL_DEFINITIONS.TOPIC.FIND_BERATUNG_BESCHLUSSEMPFEHLUNG) !== -1 ||
    topicText.search(CONFERENCEWEEKDETAIL_DEFINITIONS.TOPIC.FIND_ZWEITE_DRITTE_BERATUNG) !== -1 ||
    topicText.search(CONFERENCEWEEKDETAIL_DEFINITIONS.TOPIC.FIND_ZWEITE_BERATUNG_SCHLUSSABSTIMMUNG) !== -1 ||
    topicText.search(CONFERENCEWEEKDETAIL_DEFINITIONS.TOPIC.FIND_DRITTE_BERATUNG) !== -1
  ) {
    return true;
  }
  return null;
}

/**
 * Retrieves procedure IDs associated with the given documents
 */
export async function getProcedureIds(documents: string[]): Promise<string[]> {
  log.info('getProcedureIds', { documents });
  const docs = documents
    .map((document: string) => {
      try {
        const pathname = new URL(document).pathname;
        const lastSegment = pathname.split('/').filter(Boolean).slice(-1)[0];
        return lastSegment ? `${lastSegment}$` : null;
      } catch {
        return null;
      }
    })
    .filter((doc): doc is string => doc !== null);
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
      importantDocuments: {
        $elemMatch: {
          $and: [
            { url: { $regex: docs.join('|') } },
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
    procedures,
  });

  return procedures.map(({ procedureId }) => procedureId);
}
