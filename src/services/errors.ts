
export declare interface ServiceError {
  code: number;
  message: String;
}

export const ErrorCodes = {
  LOAD_ACCOUNT_ERROR: 1,
  BAD_PASSWORD: 2,
  UNKNOWN_ACCOUNT_EMAIL: 3,
  EMAIL_ALREADY_REGISTERED: 4,
  UNKNOWN_NETWORK_ERROR: 5,
  SENT_CONFIRMATION_EMAIL_FAILED: 6,
  CONFIRM_EMAIL_FAILED: 7,
  SAVE_ACCOUNT_ERROR: 8
}
