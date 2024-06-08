import ms from 'ms';
import _ from 'lodash';
import crypto from 'crypto';

import CONFIG from '../../config';
import { createTokens, headerToken } from '../../express/auth';
import { sendSMS, statusSMS } from '../../services/sms';
import { Resolvers, NotificationSettings } from '../../generated/graphql';
import { logger } from '../../services/logger';
import { addToken } from './Device/addToken';

const calculateResendTime = ({
  latestCodeTime,
  codesCount,
  expires,
}: {
  latestCodeTime: number;
  codesCount: number;
  expires: number;
}): Date =>
  new Date(
    Math.min(
      expires,
      latestCodeTime +
        (ms(CONFIG.SMS_VERIFICATION_CODE_RESEND_BASETIME) / 1000) ** codesCount * 1000,
    ),
  );

const DeviceApi: Resolvers = {
  Query: {
    notificationSettings: async (_parent, args, { device }) => {
      logger.graphql('Device.query.notificationSettings', args, { device });
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
    requestCode: async (
      parent,
      { newPhone, oldPhoneHash },
      { user, device, phone, PhoneModel, VerificationModel },
    ) => {
      logger.graphql('Device.mutation.requestCode', { newPhone, oldPhoneHash }, { user, device });
      // Check for SMS Verification
      if (!CONFIG.SMS_VERIFICATION) {
        return {
          reason: 'SMS Verification is disabled!',
          succeeded: false,
        };
      }

      if (!oldPhoneHash && user.isVerified()) {
        return {
          reason: 'You are already verified!',
          succeeded: false,
        };
      }

      // check newPhone prefix & length, 3 prefix, min. length 10
      if (newPhone.substr(0, 3) !== '+49' || newPhone.length < 12) {
        return {
          reason:
            'newPhone is invalid - does not have the required length of min. 12 digits or does not start with countrycode +49',
          succeeded: false,
        };
      }

      // Check for invalid transfere
      const newPhoneHash = crypto.createHash('sha256').update(newPhone).digest('hex');
      const newPhoneDBHash = crypto.createHash('sha256').update(newPhoneHash).digest('hex');
      const oldPhoneDBHash = oldPhoneHash
        ? crypto.createHash('sha256').update(oldPhoneHash).digest('hex')
        : null;
      if (newPhoneHash === oldPhoneHash) {
        return {
          reason: 'newPhoneHash equals oldPhoneHash',
          succeeded: false,
        };
      }

      // Check for valid oldPhoneHash
      if ((oldPhoneHash && !user.isVerified()) || (oldPhoneHash && !phone)) {
        return {
          reason: 'Provided oldPhoneHash is invalid',
          succeeded: false,
        };
      }

      let verification = await VerificationModel.findOne({
        phoneHash: newPhoneDBHash,
      });
      if (!verification) {
        verification = new VerificationModel({
          phoneHash: newPhoneDBHash,
        });
      }

      // Genrate Code
      const minVal = 100000;
      const maxVal = 999999;

      let code: string = (Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal).toString(); // eslint-disable-line
      if (CONFIG.SMS_SIMULATE) {
        code = '000000';
      }

      const now = new Date();
      // Check if there is still a valid Code
      const activeCode = verification.verifications?.find(({ expires }) => now < new Date(expires));
      if (activeCode) {
        // ***********
        // Resend Code
        // ***********
        // Find Code Count & latest Code Time
        const codesCount = activeCode.codes?.length || 0;
        const latestCode = activeCode.codes?.reduce(
          (max, p) => (p.time > max.time ? p : max),
          activeCode.codes[0],
        );

        // Check code time
        if (
          latestCode &&
          latestCode.time.getTime() +
            ms(CONFIG.SMS_VERIFICATION_CODE_RESEND_BASETIME) ** codesCount >=
            now.getTime()
        ) {
          return {
            reason: 'You have to wait till you can request another Code',
            resendTime: calculateResendTime({
              latestCodeTime: latestCode.time.getTime(),
              codesCount,
              expires: new Date(activeCode.expires).getTime(),
            }),
            expireTime: activeCode.expires,
            succeeded: false,
          };
        }

        // Validate that the Number has recieved the Code
        const smsstatus = await statusSMS(latestCode?.SMSID || '');
        if (!smsstatus.succeeded && [102, 103].includes(smsstatus.code)) {
          console.log('DEBUG latestCode', { latestCode, activeCode });
          return {
            reason: 'Your number seems incorrect, please correct it!',
            succeeded: false,
          };
        } else if (!smsstatus.succeeded) {
          // TODO better error handling
          console.error('SMS ERROR', latestCode, smsstatus);
        }

        // Send SMS
        const { status, SMSID } = await sendSMS(newPhone, code);

        activeCode.codes?.push({
          code,
          time: now,
          SMSID,
        });
        await verification.save();

        // Check Status here to make sure the Verification request is saved
        if (!status) {
          return {
            reason: 'Could not send SMS to given newPhone',
            succeeded: false,
          };
        }

        return {
          succeeded: true,
          resendTime: calculateResendTime({
            latestCodeTime: now.getTime(),
            codesCount: codesCount + 1,
            expires: new Date(activeCode.expires).getTime(),
          }),
          expireTime: activeCode.expires,
        };
        // ***********
        // Resend Code
        // ********END
      }

      // Send SMS
      const { status, SMSID } = await sendSMS(newPhone, code);

      // Allow to create new user based on last usage
      const verificationPhone = await PhoneModel.findOne({
        phoneHash: newPhoneDBHash,
      });
      let allowNewUser = false; // Is only set if there was a user registered
      if (
        verificationPhone &&
        verificationPhone.updatedAt <
          new Date(now.getTime() - ms(CONFIG.SMS_VERIFICATION_NEW_USER_DELAY))
      ) {
        // Older then 6 Months
        allowNewUser = true;
      }

      // Code expiretime
      const expires = new Date(now.getTime() + ms(CONFIG.SMS_VERIFICATION_CODE_TTL));
      verification.verifications?.push({
        deviceHash: device.deviceHash,
        oldPhoneHash: oldPhoneDBHash || '',
        codes: [{ code, time: now, SMSID }],
        expires,
      });
      await verification.save();

      // Check Status here to make sure the Verification request is saved
      if (!status) {
        return {
          reason: 'Could not send SMS to given newPhone',
          succeeded: false,
        };
      }

      return {
        allowNewUser,
        resendTime: calculateResendTime({
          latestCodeTime: now.getTime(),
          codesCount: 1,
          expires: expires.getTime(),
        }),
        expireTime: expires,
        succeeded: true,
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
      logger.graphql(
        'Device.mutation.requestVerification',
        { code, newPhoneHash, newUser },
        { device, phone },
      );
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

    addToken,

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
      logger.graphql(
        'Device.mutation.updateNotificationSettings',
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
        {
          phone,
          device,
        },
      );

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
      logger.graphql('Device.mutation.toggleNotification', { procedureId }, { device });
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
