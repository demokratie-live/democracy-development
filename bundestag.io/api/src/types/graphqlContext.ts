import {
  ProcedureModel,
  ConferenceWeekDetailModel,
  DeputyModel,
  HistoryModel,
  PlenaryMinuteModel,
} from '@democracy-deutschland/bundestagio-common';

export interface GraphQlContext {
  ProcedureModel: typeof ProcedureModel;
  ConferenceWeekDetailModel: typeof ConferenceWeekDetailModel;
  DeputyModel: typeof DeputyModel;
  HistoryModel: typeof HistoryModel;
  PlenaryMinuteModel: typeof PlenaryMinuteModel;
}
