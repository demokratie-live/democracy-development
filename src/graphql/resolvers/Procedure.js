import axios from "axios";
import diffHistory from "mongoose-diff-history/diffHistory";

import CONSTANTS from "../../config/constants";

const deputiesNumber = {
  19: {
    Linke: 69,
    SPD: 153,
    Grüne: 67,
    "B90/Grüne": 67,
    CDU: 246,
    "CDU/CSU": 246,
    FDP: 80,
    AFD: 92,
    Andere: 2,
    Fraktionslos: 2
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
        voteDate,
        limit = 999999,
        offset = 0
      },
      { ProcedureModel }
    ) => {
      console.log("LIMIT", limit);
      console.log("OFFSET", offset);
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
        return ProcedureModel.find({ ...match })
          .sort({ createdAt: 1 })
          .skip(offset)
          .limit(limit);
      }

      if (status) {
        match = { ...match, currentStatus: { $in: status } };
      }
      if (IDs) {
        match = { ...match, procedureId: { $in: IDs } };
      }
      return ProcedureModel.aggregate([
        { $match: match },
        {
          $lookup: {
            from: "histories",
            localField: "_id",
            foreignField: "collectionId",
            as: "objectHistory"
          }
        },
        {
          $addFields: {
            bioUpdateAt: {
              $max: "$objectHistory.createdAt"
            }
          }
        },
        { $project: { objectHistory: false } },
        { $skip: offset },
        { $limit: limit }
      ]);
    },

    allProcedures: async (
      parent,
      { period = [19], type = ["Gesetzgebung", "Antrag"] },
      { ProcedureModel }
    ) =>
      ProcedureModel.aggregate([
        { $match: { period: { $in: period }, type: { $in: type } } },
        {
          $lookup: {
            from: "histories",
            localField: "_id",
            foreignField: "collectionId",
            as: "objectHistory"
          }
        },
        {
          $addFields: {
            bioUpdateAt: {
              $max: "$objectHistory.createdAt"
            }
          }
        },
        { $project: { objectHistory: false } }
      ]),

    procedureUpdates: async (parent, { period, type }, { ProcedureModel }) =>
      ProcedureModel.aggregate([
        { $match: { period: { $in: period }, type: { $in: type } } },
        {
          $lookup: {
            from: "histories",
            localField: "_id",
            foreignField: "collectionId",
            as: "objectHistory"
          }
        },
        {
          $addFields: {
            bioUpdateAt: {
              $max: "$objectHistory.createdAt"
            }
          }
        },
        { $project: { objectHistory: false } }
      ]),

    procedure: async (parent, { procedureId }, { ProcedureModel }) => {
      return ProcedureModel.findOne({ procedureId });
    }
  },

  Mutation: {
    saveProcedureCustomData: async (
      parent,
      { procedureId, partyVotes, decisionText, votingDocument },
      { ProcedureModel, user }
    ) => {
      // TODO: Add auth handling
      // if (!user || user.role !== "BACKEND") {
      //   throw new Error("Authentication required");
      // }
      const procedure = await ProcedureModel.findOne({ procedureId });

      let voteResults = {
        decisionText,
        votingDocument
      };

      if (deputiesNumber[procedure.period]) {
        const sumResults = {
          yes: 0,
          abstination: 0,
          no: 0
        };
        const partyResults = partyVotes.map(({ party, main, deviants }, i) => {
          switch (main) {
            case "YES":
              sumResults.yes +=
                deputiesNumber[procedure.period][party] -
                deviants.yes -
                deviants.abstination -
                deviants.no;
              deviants.yes =
                deputiesNumber[procedure.period][party] -
                deviants.abstination -
                deviants.no;
              break;
            case "ABSTINATION":
              sumResults.abstination +=
                deputiesNumber[procedure.period][party] -
                deviants.yes -
                deviants.abstination -
                deviants.no;
              deviants.abstination =
                deputiesNumber[procedure.period][party] -
                deviants.yes -
                deviants.no;
              break;
            case "NO":
              sumResults.no +=
                deputiesNumber[procedure.period][party] -
                deviants.yes -
                deviants.abstination -
                deviants.no;
              deviants.no =
                deputiesNumber[procedure.period][party] -
                deviants.yes -
                deviants.abstination;
              break;

            default:
              break;
          }
          sumResults.yes += deviants.yes;
          sumResults.abstination += deviants.abstination;
          sumResults.no += deviants.no;
          return { party, main, deviants };
        });

        console.log("partyVotes", partyResults);
        voteResults = {
          ...voteResults,
          partyVotes: partyResults,
          ...sumResults
        };
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
    },
    namedVote: procedure => {
      const namedVote = procedure.history.some(h => {
        if (h.decision) {
          return h.decision.some(decision => {
            if (decision.type === "Namentliche Abstimmung") {
              return true;
            }
            return false;
          });
        }
        return false;
      });
      return namedVote;
    }
  }
};
