export const USER_ID_MISSING_MSG = "UserId missing in request";

/**
 * A type for what the data will look like, when it is received from the Users table
 */
export type tUserAccount = {
  Id: number;
  Username: string;
  Password: string;
  Date_created: string;
};

export function is_email_valid(email: string): boolean {
  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
