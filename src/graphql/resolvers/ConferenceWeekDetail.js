export default {
  Query: {
    conferenceWeekDetail: async(parent, {year, week}, {ConferenceWeekDetailModel}) => {
      return ConferenceWeekDetailModel.findOne({thisYear: year, thisWeek: week})
    },
    conferenceWeekDetails: async(parent, {limit = 100, offset = 0}, {ConferenceWeekDetailModel}) => {
      return ConferenceWeekDetailModel.find({}).skip(offset).limit(limit);
    }
  }
};
