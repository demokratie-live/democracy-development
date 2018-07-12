import Scraper from "@democracy-deutschland/bt-named-polls";

// import moment from "moment";
import axios from "axios";

import CONSTANTS from "./config/constants";

import Procedure from "./models/Procedure";
import NamedPolls from "./models/NamedPolls";

let procedureIds = [];

const checkDocuments = async data => {
  process.stdout.write("n");
  const { id, title, date, documents, voteResults } = data;

  const summarized = {
    yes: 0,
    no: 0,
    abstination: 0,
    notVoted: 0
  };

  await NamedPolls.findOneAndUpdate(
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
    period: 19,
    "importantDocuments.number": { $in: documents }
  });

  const matchedProcedures = procedures.filter(procedure => {
    return procedure.history.find(({ decision }) => {
      return (
        decision &&
        decision.find(({ type, comment }) => {
          try {
            if (type === "Namentliche Abstimmung") {
              return (
                comment.match(/\d{1,3}:\d{1,3}:\d{1,3}/)[0] ===
                  `${summarized.yes}:${summarized.no}:${
                    summarized.abstination
                  }` ||
                comment.match(/\d{1,3}:\d{1,3}:\d{1,3}/)[0] ===
                  `${summarized.yes}:${summarized.abstination}:${summarized.no}`
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

  const customData = {
    voteResults: {
      partyVotes: Object.keys(voteResults).map(key => {
        let main = [
          {
            decision: "YES",
            value: parseInt(voteResults[key]["Ja"], 10)
          },
          {
            decision: "ABSTINATION",
            value: parseInt(voteResults[key]["Enthalten"], 10)
          },
          {
            decision: "NO",
            value: parseInt(voteResults[key]["Nein"], 10)
          },
          {
            decision: "NOTVOTED",
            value: parseInt(voteResults[key]["Nicht"], 10)
          }
        ].reduce(
          (prev, { decision, value }) => {
            if (prev.value < value) {
              return { decision, value };
            }
            return prev;
          },
          { value: 0 }
        );

        return {
          deviants: {
            yes: voteResults[key]["Ja"],
            abstination: voteResults[key]["Enthalten"],
            no: voteResults[key]["Nein"],
            notVoted: voteResults[key]["Nicht"]
          },
          party: key,
          main: main.decision
        };
      }),
      yes: Object.keys(voteResults).reduce((prev, key) => {
        return prev + parseInt(voteResults[key]["Ja"], 10);
      }, 0),
      abstination: Object.keys(voteResults).reduce((prev, key) => {
        return prev + parseInt(voteResults[key]["Enthalten"], 10);
      }, 0),
      no: Object.keys(voteResults).reduce((prev, key) => {
        return prev + parseInt(voteResults[key]["Nein"], 10);
      }, 0),
      notVoted: Object.keys(voteResults).reduce((prev, key) => {
        return prev + parseInt(voteResults[key]["Nicht"], 10);
      }, 0)
    }
  };

  // console.log(util.inspect(customData, false, null));

  await matchedProcedures.map(async ({ procedureId }) => {
    procedureIds.push(procedureId);
    await Procedure.findOneAndUpdate(
      { procedureId },
      { customData },
      {
        // returnNewDocument: true
      }
    );
  });
};

const syncWithDemocracy = async () => {
  await axios
    .post(`${CONSTANTS.DEMOCRACY.WEBHOOKS.UPDATE_PROCEDURES}`, {
      data: { procedureIds: [...new Set(procedureIds)], name: "NamedPolls" },
      timeout: 1000 * 60 * 5
    })
    .then(async response => {
      console.log(response.data);
    })
    .catch(error => {
      console.log(`democracy server error: ${error}`);
    });
  console.log("FINISH NAMED POLL SCRAPER");
  procedureIds = [];
};

const scraper = new Scraper();
export default async () => {
  console.log("START NAMED POLL SCRAPER");
  const lastNamedPoll = await NamedPolls.findOne({}, { pollId: 1 }).sort({
    pollId: -1
  });

  scraper
    .scrape({
      // startId: lastNamedPoll ? lastNamedPoll.pollId : 1
      onData: checkDocuments,
      onFinish: syncWithDemocracy
    })
    .catch(error => {
      console.error("ERROR: Named Polls", error);
    });
};
