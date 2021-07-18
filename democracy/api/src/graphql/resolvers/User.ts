/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
import RSAKey from 'react-native-rsa';
import crypto from 'crypto';

import { createTokens, headerToken } from '../../express/auth';
import CONFIG from '../../config';
import { Resolvers } from '../../generated/graphql';
import { logger } from '../../services/logger';

const UserApi: Resolvers = {
  Query: {
    me: async (parent, args, { UserModel, user, device }) => {
      logger.graphql('User.query.me');
      if (!user) {
        return null;
      }
      // Normal Code - remove stuff above and enable isLoggedin resolver
      // Maybe return user; ?
      const dbUser = await UserModel.findById(user._id);
      const { deviceHash } = device;
      if (dbUser) {
        return { ...dbUser.toObject(), deviceHash };
      }
    } /* ) */,
  },
  Mutation: {
    signUp: async (parent, { deviceHashEncrypted }, { res, UserModel, DeviceModel }) => {
      logger.graphql('User.mutation.signUp');
      if (!CONFIG.JWT_BACKWARD_COMPATIBILITY) {
        return null;
      }
      const rsa = new RSAKey();

      rsa.setPrivateString(CONFIG.SECRET_KEY);
      const deviceHash = rsa.decrypt(deviceHashEncrypted);
      if (!deviceHash) {
        throw new Error('invalid deviceHash');
      }

      let device = await DeviceModel.findOne({
        deviceHash: crypto
          .createHash('sha256')
          .update(deviceHash)
          .digest('hex'),
      });
      if (!device) {
        device = await DeviceModel.create({
          deviceHash: crypto
            .createHash('sha256')
            .update(deviceHash)
            .digest('hex'),
        }).catch(e => {
          console.log(e);
          throw new Error('Error on save device');
        });
      }

      let user = await UserModel.findOne({ device });
      if (!user) {
        user = await UserModel.create({ device });
      }

      const [token, refreshToken] = await createTokens(user._id);
      headerToken({ res, token, refreshToken });
      return { token };
    },
  },
};

export default UserApi;
