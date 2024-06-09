import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Response, NextFunction } from 'express';
import CONFIG from '../../config';
import {
  UserModel,
  DeviceModel,
  PhoneModel,
  User,
  Device,
  Phone,
} from '@democracy-deutschland/democracy-common';
import { ExpressReqContext } from '../../types/graphqlContext';
import { logger } from '../../services/logger';

export const createTokens = async (user: string) => {
  logger.debug('createTokens', { user });
  const token = jwt.sign(
    {
      user,
    },
    CONFIG.AUTH_JWT_SECRET,
    {
      expiresIn: CONFIG.AUTH_JWT_TTL,
    },
  );

  const refreshToken = jwt.sign(
    {
      user,
    },
    CONFIG.AUTH_JWT_SECRET,
    {
      expiresIn: CONFIG.AUTH_JWT_REFRESH_TTL,
    },
  );

  return Promise.all([token, refreshToken]);
};

const refreshTokens = async (refreshToken: string) => {
  logger.debug('refreshTokens', { refreshToken });
  // Verify Token
  try {
    jwt.verify(refreshToken, CONFIG.AUTH_JWT_SECRET);
  } catch (err) {
    logger.error(err);
    return {};
  }
  // Decode Token
  let userid = null;
  const jwtUser = jwt.decode(refreshToken);
  if (jwtUser && typeof jwtUser === 'object' && jwtUser.user) {
    userid = jwtUser.user;
  } else {
    return {};
  }
  // Validate UserData if an old User was set
  const user = await UserModel.findOne({ _id: userid });

  if (!user) {
    return {};
  }
  // logger.jwt(`JWT: Token Refresh for User: ${user._id}`);
  // Generate new Tokens
  const [newToken, newRefreshToken] = await createTokens(user._id);
  return {
    token: newToken,
    refreshToken: newRefreshToken,
    user,
  };
};

export const headerToken = async ({
  res,
  token,
  refreshToken,
}: {
  res: Response;
  token: string;
  refreshToken: string;
}) => {
  logger.debug('headerToken', { token, refreshToken });
  res.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token');
  res.set('x-token', token);
  res.set('x-refresh-token', refreshToken);

  if (CONFIG.DEBUG) {
    res.cookie('debugToken', token, { maxAge: 900000, httpOnly: true });
    res.cookie('debugRefreshToken', refreshToken, { maxAge: 900000, httpOnly: true });
  }
};

export const authMiddleware = async (req: ExpressReqContext, res: Response, next: NextFunction) => {
  logger.graphql(`authMiddleware`, {
    cookies: req.cookies,
    headers: req.headers,
    query: req.query,
    user: req.user,
    device: req.device,
    phone: req.phone,
  });
  logger.debug(`Server: Connection from: ${req.connection.remoteAddress}`);
  let token: string | null =
    req.headers['x-token'] || (CONFIG.DEBUG ? req.cookies.debugToken : null);
  // In some cases the old Client transmitts the token via authorization header as 'Bearer [token]'
  if (CONFIG.JWT_BACKWARD_COMPATIBILITY && !token && req.headers.authorization) {
    token = req.headers.authorization.substr(7);
  }
  let deviceHash =
    req.headers['x-device-hash'] || (CONFIG.DEBUG ? req.query.deviceHash || null : null);
  deviceHash = typeof deviceHash === 'string' ? deviceHash : null;
  let phoneHash =
    req.headers['x-phone-hash'] || (CONFIG.DEBUG ? req.query.phoneHash || null : null);
  phoneHash = typeof phoneHash === 'string' ? phoneHash : null;
  if (deviceHash || phoneHash) {
    // logger.jwt(`JWT: Credentials with DeviceHash(${deviceHash}) PhoneHash(${phoneHash})`);
  }

  let success = false;
  // Check existing JWT Session
  // If Credentials are also present use them instead
  if (token && !deviceHash) {
    // logger.jwt(`JWT: Token: ${token}`);
    try {
      const jwtUser: any = jwt.verify(token, CONFIG.AUTH_JWT_SECRET);
      const userid = jwtUser.user;
      // Set request variables
      req.user = await UserModel.findOne({ _id: userid });
      if (req.user) {
        if (req.user.device) {
          req.device = await DeviceModel.findOne({ _id: req.user.device });
        }
        if (req.user.phone) {
          req.phone = await PhoneModel.findOne({ _id: req.user.phone });
        }
        // Set new timestamps
        req.user.markModified('updatedAt');
        await req.user.save();
        if (req.device) {
          req.device.markModified('updatedAt');
          await req.device.save();
        }
        if (req.phone) {
          req.phone.markModified('updatedAt');
          await req.phone.save();
        }
      }
      success = true;
      // logger.jwt(`JWT: Token valid: ${token}`);
    } catch (err) {
      logger.error(err);
      // Check for JWT Refresh Ability
      logger.jwt(`JWT: Token Error: ${err}`);
      const refreshToken =
        req.headers['x-refresh-token'] || (CONFIG.DEBUG ? req.cookies.debugRefreshToken : null);
      const newTokens = await refreshTokens(refreshToken);
      if (newTokens.token && newTokens.refreshToken) {
        headerToken({ res, token: newTokens.token, refreshToken: newTokens.refreshToken });
        // Set request variables
        req.user = newTokens.user;
        if (req.user) {
          if (req.user.device) {
            req.device = await DeviceModel.findOne({ _id: req.user.device });
          }
          if (req.user.phone) {
            req.phone = await PhoneModel.findOne({ _id: req.user.phone });
          }
          // Set new timestamps
          req.user.markModified('updatedAt');
          await req.user.save();
          if (req.device) {
            req.device.markModified('updatedAt');
            await req.device.save();
          }
          if (req.phone) {
            req.phone.markModified('updatedAt');
            await req.phone.save();
          }
        }
        success = true;
        // logger.jwt(`JWT: Token Refresh (t): ${newTokens.token}`);
        // logger.jwt(`JWT: Token Refresh (r): ${newTokens.refreshToken}`);
      }
    }
  }
  // Login
  if (!success) {
    let user: User | null = null;
    let device: Device | null = null;
    let phone: Phone | null = null;
    if (deviceHash) {
      // logger.jwt('JWT: Credentials present');
      // User
      device = await DeviceModel.findOne({
        deviceHash: crypto.createHash('sha256').update(deviceHash).digest('hex'),
      });
      phone = phoneHash
        ? await PhoneModel.findOne({
            phoneHash: crypto.createHash('sha256').update(phoneHash).digest('hex'),
          })
        : null;
      user = await UserModel.findOne({ device: device, phone: phone });
      if (!user) {
        // logger.jwt('JWT: Create new User');

        device = await DeviceModel.findOne({
          deviceHash: crypto.createHash('sha256').update(deviceHash).digest('hex'),
        });
        // Device
        if (!device) {
          device = new DeviceModel({
            deviceHash: crypto.createHash('sha256').update(deviceHash).digest('hex'),
          });
          await device.save().catch((e) => {
            console.log(e);
            throw new Error('Error: Save new Device');
          });
        }

        // Create user
        logger.debug('Create new User');
        user = new UserModel({ device, phone });
        await user.save();
      }
      // logger.jwt(`JWT: Token New for User: ${user._id}`);
      const [createToken, createRefreshToken] = await createTokens(user._id);
      headerToken({ res, token: createToken, refreshToken: createRefreshToken });
      // Set new timestamps
      user.markModified('updatedAt');
      await user.save();
      if (device) {
        device.markModified('updatedAt');
        await device.save();
      }
      if (phone) {
        phone.markModified('updatedAt');
        await phone.save();
      }
      // logger.jwt(`JWT: Token New (t): ${createToken}`);
      // logger.jwt(`JWT: Token New (r): ${createRefreshToken}`);
    }
    // Set request variables
    req.user = user;
    req.device = device;
    req.phone = phone;
  }
  next();
};
