import Scraper from "@democracy-deutschland/bt-agenda";
import moment from "moment";

import Procedure from "./models/Procedure";
import Agenda from "./models/Agenda";

const checkDocuments = async data => {
  await Promise.all(
    data.map(async ({ rows, year, week, meeting, date, ...rest }) => {
      await Agenda.findOneAndUpdate(
        { year, week, meeting },
        { rows, year, week, meeting, date: new Date(date), ...rest },
        {
          upsert: true
        }
      );
      await Promise.all(
        rows.map(async ({ topicDetails, dateTime }) => {
          await Promise.all(
            topicDetails.map(async ({ documents }) => {
              const procedures = await Procedure.find({
                "importantDocuments.number": { $in: documents }
              });
              if (
                procedures.length > 0
                // && text.indexOf("Beschlussempfehlung") !== -1
              ) {
                const promisesUpdate = procedures.map(
                  async ({ procedureId, currentStatus }) => {
                    console.log(procedureId, dateTime, Date(), new Date(dateTime));
                    if (
                      (currentStatus === "Beschlussempfehlung liegt vor" ||
                        currentStatus === "Überwiesen") &&
                      new Date() < new Date(dateTime)
                    ) {
                      await Procedure.findOneAndUpdate(
                        { procedureId },
                        {
                          $set: { "customData.expectedVotingDate": dateTime }
                        }
                      );
                      return true;
                    }
                  }
                );
                await Promise.all(promisesUpdate);
              }
            })
          );
        })
      );
    })
  );
};

const scraper = new Scraper();
(async () => {
  scraper.addListener("data", checkDocuments);
  scraper.addListener("finish", data => console.log("FINISH", data));

  const agenda = await Agenda.find({})
    .sort({
      year: -1,
      week: -1,
      meeting: -1
    })
    .limit(5);
  let startWeek = 3;
  let startYear = 2017;
  const lastPastAgenda = agenda.find(({ week, year }) => {
    return week <= moment().week() || year < moment().year();
  });
  if (lastPastAgenda) {
    startWeek = lastPastAgenda.week;
    startYear = lastPastAgenda.year;
  }
  scraper
    .scrape({
      startWeek,
      startYear,
      continue: true
    })
    .catch(error => {
      console.error(error);
    });
})();
