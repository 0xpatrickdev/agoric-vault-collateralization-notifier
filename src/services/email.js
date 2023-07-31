import sgMail from "@sendgrid/mail";
import { getEnvVars } from "../utils/getEnvVar.js";

/**
 * @param {string} email email of user
 * @param {string} token verification token
 */
export async function sendVerifyEmail(email, token) {
  try {
    const [API_KEY, FROM_EMAIL, CALLBACK_URL] = getEnvVars([
      "SENDGRID_API_KEY",
      "SENDGRID_FROM_EMAIL",
      "SENDGRID_CALLBACK_URL",
    ]);
    sgMail.setApiKey(API_KEY);
    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: "Inter Vault Alterts: Email Verification",
      text: `Click the link to verify your email: ${CALLBACK_URL}?token=${token}. Please note this link will expire in 30 minutes.`,
    };
    await sgMail.send(msg);
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
}

/**
 * @param {string} email email of user
 * @param {string} subject subject line of the email
 * @param {string} text body of the email
 */
export async function sendEmail(email, subject, text) {
  try {
    const [API_KEY, FROM_EMAIL] = getEnvVars([
      "SENDGRID_API_KEY",
      "SENDGRID_FROM_EMAIL",
    ]);
    sgMail.setApiKey(API_KEY);
    await sgMail.send({
      to: email,
      from: FROM_EMAIL,
      subject,
      text,
    });
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
}
