import { testCronTime } from '@democracy-deutschland/democracy-common';

export default {
  CRON_START_ON_INIT: process.env.CRON_START_ON_INIT === 'true',
  CRON_PROCEDURES: testCronTime(process.env.CRON_PROCEDURES)
    ? process.env.CRON_PROCEDURES
    : undefined,
  CRON_NAMED_POLLS: testCronTime(process.env.CRON_NAMED_POLLS)
    ? process.env.CRON_NAMED_POLLS
    : undefined,
  CRON_DEPUTY_PROFILES: testCronTime(process.env.CRON_DEPUTY_PROFILES)
    ? process.env.CRON_DEPUTY_PROFILES
    : undefined,
  CRON_SHEDULE_BIO_RESYNC: testCronTime(process.env.CRON_SHEDULE_BIO_RESYNC)
    ? process.env.CRON_SHEDULE_BIO_RESYNC
    : undefined,
  CRON_SEND_QUED_PUSHS: testCronTime(process.env.CRON_SEND_QUED_PUSHS)
    ? process.env.CRON_SEND_QUED_PUSHS
    : undefined,
  CRON_SEND_QUED_PUSHS_LIMIT: process.env.CRON_SEND_QUED_PUSHS_LIMIT
    ? parseInt(process.env.CRON_SEND_QUED_PUSHS_LIMIT)
    : 0,
  CRON_QUE_PUSHS_CONFERENCE_WEEK: testCronTime(process.env.CRON_QUE_PUSHS_CONFERENCE_WEEK)
    ? process.env.CRON_QUE_PUSHS_CONFERENCE_WEEK
    : undefined,
  CRON_QUE_PUSHS_VOTE_TOP100: testCronTime(process.env.CRON_QUE_PUSHS_VOTE_TOP100)
    ? process.env.CRON_QUE_PUSHS_VOTE_TOP100
    : undefined,
  CRON_QUE_PUSHS_VOTE_CONFERENCE_WEEK: testCronTime(process.env.CRON_QUE_PUSHS_VOTE_CONFERENCE_WEEK)
    ? process.env.CRON_QUE_PUSHS_VOTE_CONFERENCE_WEEK
    : undefined,
};
