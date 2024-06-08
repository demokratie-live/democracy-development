/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
import { rule, shield } from 'graphql-shield';
import CONFIG from '../../config';
import { logger } from '../../services/logger';

// User & Device is existent in Database
const isLoggedin = rule({ cache: 'no_cache' })(async (parent, args, { user, device }) => {
  logger.graphql('isLoggedin', { user, device });
  if (!user || !device) {
    logger.warn('Permission denied: You need to login with your Device');
    return false;
  }
  return true;
});

const isVerified = rule({ cache: 'no_cache' })(async (parent, args, { user, phone }) => {
  if (!user || (CONFIG.SMS_VERIFICATION && (!user.isVerified() || !phone))) {
    logger.warn('Permission denied: isVerified = false');
    return false;
  }
  return true;
});

export const permissions = shield(
  {
    Query: {
      // procedures: isLoggedin,
      // activityIndex: isLoggedin,
      notificationSettings: isLoggedin,
      notifiedProcedures: isLoggedin,
      votes: isLoggedin,
      votedProcedures: isVerified,
    },
    Mutation: {
      increaseActivity: isVerified,
      vote: isVerified,
      requestCode: isLoggedin,
      requestVerification: isLoggedin,
      addToken: isLoggedin,
      updateNotificationSettings: isLoggedin,
      toggleNotification: isLoggedin,
      finishSearch: isLoggedin,
      // createResolver: isLoggedin,
    },
  },
  {
    debug: true,
  },
);
