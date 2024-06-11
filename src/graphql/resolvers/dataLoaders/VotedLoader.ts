import { Device, Phone, VoteModel } from '@democracy-deutschland/democracy-common';
import { Types } from 'mongoose';

export const votedLoader = async ({
  procedureObjIds,
  phone,
}: {
  procedureObjIds: readonly Types.ObjectId[];
  phone: Phone | null | undefined;
  device: Device | null | undefined;
}) => {
  if (phone) {
    const votedProcedures = await VoteModel.find(
      {
        procedure: { $in: procedureObjIds },
        type: 'Phone',
        voters: {
          $elemMatch: {
            voter: phone._id,
          },
        },
      },
      {
        procedure: 1,
      },
    );
    const votedProcedureObjIds = votedProcedures.map(({ procedure }) =>
      typeof procedure === 'string' ? procedure : (procedure as Types.ObjectId).toHexString(),
    );

    return procedureObjIds.map((procedureObjId) => {
      if (typeof procedureObjId === 'string') {
        return votedProcedureObjIds.includes(procedureObjId);
      } else {
        return votedProcedureObjIds.includes(procedureObjId.toHexString());
      }
    });
  }
  return procedureObjIds.map(() => false);
};
