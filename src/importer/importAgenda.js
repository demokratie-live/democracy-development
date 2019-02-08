import Scraper from '@democracy-deutschland/bt-agenda';
import moment from 'moment';
import axios from 'axios';
import { inspect } from 'util';

import CONSTANTS from './../config/constants';

import Procedure from './../models/Procedure';
import Agenda from './../models/Agenda';

let procedureIds = [];

const checkDocuments = async data => {
  await Promise.all(
    data.map(async ({ rows, year, week, meeting, date, ...rest }) => {
      await Agenda.findOneAndUpdate(
        { year, week, meeting },
        { rows, year, week, meeting, date: new Date(date), ...rest },
        {
          upsert: true,
        },
      );
      await Promise.all(
        rows.map(async ({ dateTime, topicDocuments: documents, status }) => {
          const igonreDocs = status
            .filter(stat => stat.indexOf('Überweisung') === 0)
            .map(stat => stat.match(/(\d{1,3}\/\d{1,10})/g));

          if (igonreDocs.length > 0) {
            return;
          }

          const procedures = await Procedure.find({
            'importantDocuments.number': { $in: documents },
          });
          if (procedures.length > 0) {
            const promisesUpdate = procedures.map(
              async ({ procedureId, currentStatus, history }) => {
                const recomendetDecisionDocument = history.find(
                  doc =>
                    doc.initiator && doc.initiator.indexOf('Beschlussempfehlung und Bericht') === 0,
                );
                const recomendetDecisionDocumentDate =
                  (recomendetDecisionDocument && new Date(recomendetDecisionDocument.date)) ||
                  false;

                if (
                  (currentStatus === 'Beschlussempfehlung liegt vor' ||
                    currentStatus === 'Überwiesen') &&
                  (recomendetDecisionDocumentDate && recomendetDecisionDocumentDate <= dateTime)
                ) {
                  await Procedure.findOneAndUpdate(
                    {
                      procedureId,
                    },
                    {
                      $set: { 'customData.expectedVotingDate': dateTime },
                    },
                  ).then(datas => {
                    if (datas) {
                      procedureIds.push(procedureId);
                    }
                  });
                  return true;
                } else if (
                  currentStatus === 'Beschlussempfehlung liegt vor' ||
                  currentStatus === 'Überwiesen'
                ) {
                  await Procedure.findOneAndUpdate(
                    {
                      procedureId,
                    },
                    {
                      $set: { 'customData.possibleVotingDate': dateTime },
                    },
                  ).then(datas => {
                    if (datas) {
                      procedureIds.push(procedureId);
                    }
                  });
                }
                return false;
              },
            );
            await Promise.all(promisesUpdate);
          }
        }),
      );
    }),
  );
};

const syncWithDemocracy = async () => {
  if (procedureIds.length > 0) {
    await axios
      .post(`${CONSTANTS.DEMOCRACY.WEBHOOKS.UPDATE_PROCEDURES}`, {
        data: { procedureIds: [...new Set(procedureIds)], name: 'Agenda' },
        timeout: 1000 * 60 * 5,
      })
      .then(async response => {
        Log.debug(inspect(response.data));
      })
      .catch(error => {
        Log.error(`democracy server error: ${inspect(error)}`);
      });
    procedureIds = [];
  }
};

const scraper = new Scraper();
export default async () => {
  Log.info('START AGENDA SCRAPER');

  const agenda = await Agenda.find({})
    .sort({
      year: -1,
      week: -1,
      meeting: -1,
    })
    .limit(5);
  let startWeek = 3;
  let startYear = 2017;
  const lastPastAgenda = agenda.find(
    ({ week, year }) => week <= moment().week() || year < moment().year(),
  );
  if (lastPastAgenda) {
    startWeek = lastPastAgenda.week;
    startYear = lastPastAgenda.year;
  }
  await scraper
    .scrape({
      onData: checkDocuments,
      onFinish: syncWithDemocracy,
      startWeek,
      startYear,
      continue: true,
    })
    .catch(error => {
      Log.error(inspect(error));
    });

  Log.info('FINISH AGENDA SCRAPER');
};
