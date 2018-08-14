import axios from "axios";
import diffHistory from "mongoose-diff-history/diffHistory";
import { mongoose } from "../../config/db";

const History = mongoose.model("History");

import CONSTANTS from "../../config/constants";

const deputiesNumber = {
  19: {
    Linke: 69,
    SPD: 153,
    Grüne: 67,
    CDU: 246,
    FDP: 80,
    AFD: 92,
    Andere: 2
  }
};

export default {
  Query: {
    procedures: (
      parent,
      {
        IDs,
        period = [19],
        type = ["Gesetzgebung", "Antrag"],
        status,
        voteDate
      },
      { ProcedureModel }
    ) => {
      let match = { period: { $in: period }, type: { $in: type } };
      if (voteDate) {
        match = {
          ...match,
          history: {
            $elemMatch: {
              decision: {
                $elemMatch: {
                  tenor: {
                    $in: ["Ablehnung der Vorlage", "Annahme der Vorlage"]
                  }
                }
              }
            }
          }
        };
      }
      if (status) {
        match = { ...match, currentStatus: { $in: status } };
      }
      if (IDs) {
        match = { ...match, procedureId: { $in: IDs } };
      }
      return ProcedureModel.find(match);
    },

    allProcedures: async (
      parent,
      { period = [19], type = ["Gesetzgebung", "Antrag"] },
      { ProcedureModel }
    ) => ProcedureModel.find({ period: { $in: period }, type: { $in: type } }),

    procedureUpdates: async (parent, { period, type }, { ProcedureModel }) =>
      ProcedureModel.find({ period: { $in: period }, type: { $in: type } }),

    procedure: async (parent, { procedureId }, { ProcedureModel }) => {
      return ProcedureModel.findOne({ procedureId });
    }
  },

  Mutation: {
    saveProcedureCustomData: async (
      parent,
      { procedureId, partyVotes, decisionText },
      { ProcedureModel, user }
    ) => {
      if (!user || user.role !== "BACKEND") {
        throw new Error("Authentication required");
      }
      const procedure = await ProcedureModel.findOne({ procedureId });

      let voteResults = {
        partyVotes,
        decisionText
      };

      if (deputiesNumber[procedure.period]) {
        const sumResults = {
          yes: 0,
          abstination: 0,
          no: 0
        };
        partyVotes.forEach(({ party, main, deviants }) => {
          switch (main) {
            case "YES":
              sumResults.yes +=
                deputiesNumber[procedure.period][party] -
                deviants.yes -
                deviants.abstination -
                deviants.no;
              break;
            case "ABSTINATION":
              sumResults.abstination +=
                deputiesNumber[procedure.period][party] -
                deviants.yes -
                deviants.abstination -
                deviants.no;
              break;
            case "NO":
              sumResults.no +=
                deputiesNumber[procedure.period][party] -
                deviants.yes -
                deviants.abstination -
                deviants.no;
              break;

            default:
              break;
          }
          sumResults.yes += deviants.yes;
          sumResults.abstination += deviants.abstination;
          sumResults.no += deviants.no;
        });
        voteResults = { ...voteResults, ...sumResults };
      }

      await ProcedureModel.update(
        { procedureId },
        {
          $set: {
            "customData.voteResults": { ...voteResults }
          }
        }
      );

      axios
        .post(`${CONSTANTS.DEMOCRACY_SERVER_WEBHOOK_URL}`, {
          data: [
            {
              period: procedure.period,
              types: [
                { type: procedure.type, changedIds: [procedure.procedureId] }
              ]
            }
          ],
          timeout: 1000 * 60 * 5
        })
        .then(async response => {
          console.log(response.data);
        })
        .catch(error => {
          console.log(`democracy server error: ${error}`);
        });

      return ProcedureModel.findOne({ procedureId });
    }
  },

  Procedure: {
    bioUpdateAt: async procedure => {
      const h = await History.findOne(
        { collectionId: procedure },
        { createdAt: 1 }
      ).sort({ createdAt: -1 });
      if (h) {
        return h.createdAt;
      }
      return null;
    },

    currentStatusHistory: async procedure => {
      const { _id } = procedure;
      const history = await diffHistory
        .getDiffs("Procedure", _id)
        .then(histories => {
          return histories.reduce((prev, version) => {
            let cur = prev;
            if (version.diff.currentStatus) {
              if (cur.length === 0) {
                cur.push(version.diff.currentStatus[0]);
              }
              cur.push(version.diff.currentStatus[1]);
            }
            return cur;
          }, []);
        });
      return history;
    }
  }
};
