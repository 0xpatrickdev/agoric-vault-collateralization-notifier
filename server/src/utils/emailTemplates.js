import { getEnvVars } from "../utils/getEnvVar.js";

/** @param {string} token auth token */
export const getVerifyEmailTemplate = (token) => {
  const [CALLBACK_URL] = getEnvVars(["EMAIL_CALLBACK_URL"]);
  return {
    subject: "Inter Vault Alerts: Email Verification",
    text: `Click the link to verify your email: ${CALLBACK_URL}?token=${token}. Please note this link will expire in 30 minutes.`,
  };
};
