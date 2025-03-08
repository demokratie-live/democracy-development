import {
  ProcedureModel,
  ConferenceWeekDetailModel,
  DeputyModel,
  PlenaryMinuteModel,
  NamedPollModel,
} from '@democracy-deutschland/bundestagio-common';

export interface GraphQlContext {
  ProcedureModel: typeof ProcedureModel;
  ConferenceWeekDetailModel: typeof ConferenceWeekDetailModel;
  DeputyModel: typeof DeputyModel;
  PlenaryMinuteModel: typeof PlenaryMinuteModel;
  NamedPollModel: typeof NamedPollModel;
}
