import ms from 'ms';
import _ from 'lodash';
import crypto from 'crypto';

import CONFIG from '../../config';
import { createTokens, headerToken } from '../../express/auth';
import { Resolvers, NotificationSettings } from '../../generated/graphql';
import { logger } from '../../services/logger';

const DeviceApi: Resolvers = {
  Query: {
    notificationSettings: async (_parent, _args, { device }) => {
      logger.graphql('Device.query.notificationSettings');
      const result: NotificationSettings = {
        ...device.notificationSettings,
        procedures: device.notificationSettings.procedures.map((procedure) => {
          if ('_id' in procedure) {
            return procedure._id;
          }
          return procedure;
        }),
      };
      return result;
    },
  },

  Mutation: {
    // ************
    // REQUEST CODE
    // ************
    requestCode: async (parent) => {
      logger.graphql('Device.mutation.requestCode');

      return {
        allowNewUser: false,
        resendTime: 99,
        expireTime: 99,
        succeeded: false,
      };
    },

    // ********************
    // REQUEST VERIFICATION
    // ********************
    requestVerification: async (
      parent,
      { code, newPhoneHash, newUser },
      { res, device, phone, UserModel, PhoneModel, VerificationModel },
    ) => {
      logger.graphql('Device.mutation.requestVerification');
      // Check for SMS Verification
      if (!CONFIG.SMS_VERIFICATION) {
        return {
          reason: 'SMS Verification is disabled!',
          succeeded: false,
        };
      }

      const newPhoneDBHash = crypto.createHash('sha256').update(newPhoneHash).digest('hex');
      // Find Verification
      const verifications = await VerificationModel.findOne({
        phoneHash: newPhoneDBHash,
      });
      if (!verifications) {
        return {
          reason: 'Could not find verification request',
          succeeded: false,
        };
      }

      // Find Code
      const now = new Date();
      const verification = verifications.verifications?.find(
        ({ expires, codes }) => now < expires && codes?.find(({ code: dbCode }) => code === dbCode),
      );

      // Code valid?
      if (!verification) {
        return {
          reason: 'Invalid Code or Code expired',
          succeeded: false,
        };
      }

      // Check device
      if (device.deviceHash !== verification.deviceHash) {
        return {
          reason: 'Code requested from another Device',
          succeeded: false,
        };
      }

      // User has phoneHash, but no oldPhoneHash?
      if (
        verification.oldPhoneHash &&
        (!phone ||
          (typeof phone.phoneHash === 'string' && phone.phoneHash !== verification.oldPhoneHash))
      ) {
        return {
          reason: 'User phoneHash and oldPhoneHash inconsistent',
          succeeded: false,
        };
      }

      // Invalidate Code
      verifications.verifications = verifications.verifications?.map((obj) => {
        if (obj._id === verification._id) {
          obj.expires = now;
        }
        return obj;
      });
      await verifications.save();

      // New Phone
      let newPhone = await PhoneModel.findOne({
        phoneHash: newPhoneDBHash,
      });
      // Phone exists & New User?
      if (
        newPhone &&
        newUser &&
        newPhone.updatedAt < new Date(now.getTime() - ms(CONFIG.SMS_VERIFICATION_NEW_USER_DELAY))
      ) {
        // Allow new User - Invalidate newPhone
        newPhone.phoneHash = `Invalidated at '${now}': ${newPhone.phoneHash}`;
        await newPhone.save();
        newPhone = null;
      }

      // oldPhoneHash and no newPhone
      if (verification.oldPhoneHash && !newPhone) {
        // Find old Phone
        const oldPhone = await PhoneModel.findOne({ phoneHash: verification.oldPhoneHash });
        // We found an old phone and no new User is requested
        if (
          oldPhone &&
          (!newUser ||
            oldPhone.updatedAt >=
              new Date(now.getTime() - ms(CONFIG.SMS_VERIFICATION_NEW_USER_DELAY)))
        ) {
          newPhone = oldPhone;
          newPhone.phoneHash = newPhoneHash;
          await newPhone.save();
        }
      }

      // Still no newPhone?
      if (!newPhone) {
        // Create Phone
        newPhone = new PhoneModel({
          phoneHash: newPhoneDBHash,
        });
        await newPhone.save();
      }

      // Delete Existing User
      await UserModel.deleteOne({ device: device._id, phone: newPhone._id });

      // Unverify all of the same device or phone
      await UserModel.update(
        { $or: [{ device: device._id }, { phone: newPhone._id }] },
        { verified: false },
        { multi: true },
      );

      // Create new User and update session User
      const saveUser = await UserModel.create({
        device: device._id,
        phone: newPhone._id,
        verified: true,
      });
      await saveUser.save();
      // This should not be necessary since the call ends here - but you never know
      // phone = newPhone;

      // Send new tokens since user id has been changed
      const [token, refreshToken] = await createTokens(saveUser._id);
      await headerToken({ res, token, refreshToken });

      return {
        succeeded: true,
      };
    },

    addToken: async (parent, { token, os }, { device }) => {
      logger.graphql('Device.mutation.addToken');
      if (!device.pushTokens.some((t) => t.token === token)) {
        device.pushTokens.push({ token, os });
        await device.save();
      }
      return {
        succeeded: true,
      };
    },

    updateNotificationSettings: async (
      parent,
      {
        enabled,
        disableUntil,
        procedures,
        tags,
        newVote,
        newPreperation,
        conferenceWeekPushs,
        voteConferenceWeekPushs,
        voteTOP100Pushs,
        outcomePushs,
        outcomePushsEnableOld,
      },
      { phone, device, DeviceModel, VoteModel },
    ) => {
      logger.graphql('Device.mutation.updateNotificationSettings');

      device.notificationSettings = {
        ...device.notificationSettings,
        ..._.omitBy(
          {
            enabled,
            disableUntil,
            procedures,
            tags,
            newVote,
            newPreperation,
            // traversal of old settings -> new settings
            conferenceWeekPushs,
            voteConferenceWeekPushs:
              newVote && !voteConferenceWeekPushs ? newVote : voteConferenceWeekPushs,
            voteTOP100Pushs: newPreperation && !voteTOP100Pushs ? newPreperation : voteTOP100Pushs,
            // new setting
            outcomePushs,
          },
          _.isNil,
        ),
      };

      await device.save();

      // Enable all old Procedures to be pushed
      // TODO here we use two write Operations since $addToSet is used
      // to ensure uniqueness of items - this can be done serverside aswell
      // reducing write operations - but required ObjectId comparison
      if (outcomePushs && outcomePushsEnableOld) {
        const actor = CONFIG.SMS_VERIFICATION ? phone._id : device._id;
        const kind = CONFIG.SMS_VERIFICATION ? 'Phone' : 'Device';
        const votedProcedures = await VoteModel.find(
          { type: kind, 'voters.voter': actor },
          { procedure: 1 },
        );

        const proceduresOld = votedProcedures.map(({ procedure }) => procedure);

        await DeviceModel.updateOne(
          { _id: device._id },
          { $addToSet: { 'notificationSettings.procedures': { $each: proceduresOld } } },
        );
        // TODO this additional read operation is also not nessecarily required
        // if the calculation is done serverside
        device = await DeviceModel.findOne({ _id: device._id }).then((d) =>
          d ? d.toObject() : null,
        );
      }

      const result: NotificationSettings = {
        ...device.notificationSettings,
        procedures: device.notificationSettings.procedures.map((procedure) => {
          if ('_id' in procedure) {
            return procedure._id;
          }
          return procedure;
        }),
      };
      return result;
    },

    toggleNotification: async (parent, { procedureId }, { device, ProcedureModel }) => {
      logger.graphql('Device.mutation.toggleNotification');
      const procedure = await ProcedureModel.findOne({ procedureId });
      if (procedure) {
        const index = device.notificationSettings.procedures.indexOf(procedure?._id);
        let notify;
        if (index > -1) {
          notify = false;
          device.notificationSettings.procedures.splice(index, 1);
        } else {
          notify = true;
          device.notificationSettings.procedures.push(procedure._id);
        }
        await device.save();
        return { ...procedure.toObject(), notify };
      }
    },
  },
};

export default DeviceApi;
