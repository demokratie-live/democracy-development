import Scraper from "@democracy-deutschland/bt-named-polls";
import moment from "moment";
import axios from "axios";

import CONSTANTS from "./config/constants";

import Procedure from "./models/Procedure";
import NamedPolls from "./models/NamedPolls";

const checkDocuments = async data => {
  const procedureIds = [];

  const { id, title, date, documents, voteResults } = data;

  const summarized = {
    yes: 0,
    no: 0,
    abstination: 0,
    notVoted: 0
  };

  const namedPoll = await NamedPolls.findOneAndUpdate(
    { pollId: id },
    {
      pollId: id,
      title,
      date,
      documents,
      voteResults: Object.keys(voteResults).map(key => {
        summarized.yes += parseInt(voteResults[key]["Ja"], 10);
        summarized.no += parseInt(voteResults[key]["Nein"], 10);
        summarized.abstination += parseInt(voteResults[key]["Enthalten"], 10);
        summarized.notVoted += parseInt(voteResults[key]["Nicht"], 10);
        return {
          party: key,
          yes: voteResults[key]["Ja"],
          no: voteResults[key]["Nein"],
          abstination: voteResults[key]["Enthalten"],
          notVoted: voteResults[key]["Nicht"]
        };
      })
    },
    {
      upsert: true
    }
  );

  const procedures = await Procedure.find({
    "importantDocuments.number": { $in: documents }
  });

  const matchedProcedures = procedures.filter(procedure => {
    return procedure.history.find(({ decision }) => {
      return (
        decision &&
        decision.find(({ type, comment }) => {
          try {
            if (type === "Namentliche Abstimmung") {
              if (
                comment.match(/\d{1,3}:\d{1,3}:\d{1,3}/)[0] ===
                `${summarized.yes}:${summarized.abstination}:${summarized.no}`
              ) {
                console.log(
                  `${comment.match(/\d{1,3}:\d{1,3}:\d{1,3}/)[0]} === ${
                    summarized.yes
                  }:${summarized.no}:${summarized.abstination}`,
                  comment.match(/\d{1,3}:\d{1,3}:\d{1,3}/)[0] ===
                    `${summarized.yes}:${summarized.no}:${
                      summarized.abstination
                    }`
                );
              }
              return (
                comment.match(/\d{1,3}:\d{1,3}:\d{1,3}/)[0] ===
                `${summarized.yes}:${summarized.no}:${summarized.abstination}`
              );
            }
          } catch (error) {
            return false;
          }
          return false;
        })
      );
    });
  });
  console.log(
    "\x1b[36m%s\x1b[0m",
    `${procedures.length} – ${title}`,
    matchedProcedures.length
  );

  // await axios
  //   .post(`${CONSTANTS.DEMOCRACY.WEBHOOKS.UPDATE_PROCEDURES}`, {
  //     data: { procedureIds },
  //     timeout: 1000 * 60 * 5
  //   })
  //   .then(async response => {
  //     console.log(response.data);
  //   })
  //   .catch(error => {
  //     console.log(`democracy server error: ${error}`);
  //   });
};

const scraper = new Scraper();
(async () => {
  scraper.addListener("data", checkDocuments);
  scraper.addListener("finish", data => console.log("FINISH", data));
  scraper.addListener("error", () => console.log("ERROR"));

  const lastNamedPoll = await NamedPolls.findOne({}, { pollId: 1 }).sort({
    pollId: -1
  });

  scraper
    .scrape({
      // startId: lastNamedPoll ? lastNamedPoll.pollId : 1,
      startId: 1
    })
    .catch(error => {
      console.error(error);
    });
})();
