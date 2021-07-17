export default `

  type Device {
    notificationSettings: NotificationSettings
  }

  type TokenResult {
    succeeded: Boolean
  }

  type CodeResult {
    reason: String
    allowNewUser: Boolean
    succeeded: Boolean!
    resendTime: Date
    expireTime: Date
  }

  type VerificationResult {
    reason: String
    succeeded: Boolean!
  }

  type NotificationSettings {
    enabled: Boolean
    newVote: Boolean @deprecated(reason: "<= 1.22 Notification Settings")
    newPreperation: Boolean @deprecated(reason: "<= 1.22 Notification Settings")
    conferenceWeekPushs: Boolean
    voteConferenceWeekPushs: Boolean
    voteTOP100Pushs: Boolean
    outcomePushs: Boolean
    disableUntil: Date
    procedures: [String]
    tags: [String]
  }

  type Query {
    notificationSettings: NotificationSettings
  }

  type Mutation {
    requestCode(newPhone: String!, oldPhoneHash: String): CodeResult!
    requestVerification(code: String!, newPhoneHash: String!, newUser: Boolean): VerificationResult!

    addToken(token: String!, os: String!): TokenResult!
    
    ${/* DEPRECATED newVote & newPreperation: <= 1.22 Notification Settings */ ''}
    updateNotificationSettings(
      enabled: Boolean,
      newVote: Boolean,
      newPreperation: Boolean,
      conferenceWeekPushs: Boolean,
      voteConferenceWeekPushs: Boolean,
      voteTOP100Pushs: Boolean,
      outcomePushs: Boolean,
      outcomePushsEnableOld: Boolean,
      disableUntil: Date, 
      procedures: [String], 
      tags: [String]
    ): NotificationSettings

    toggleNotification(procedureId: String!): Procedure
  }

  `;
