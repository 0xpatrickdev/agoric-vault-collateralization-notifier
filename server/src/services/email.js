import axios from "axios";
import { getEnvVars } from "../utils/getEnvVar.js";
/**
 * @param {string} email email of user
 * @param {string} token verification token
 */
export async function sendVerifyEmail(email, token) {
  try {
    const [EMAIL_API_KEY, EMAIL_DOMAIN, EMAIL_FROM, CALLBACK_URL] = getEnvVars([
      "EMAIL_API_KEY",
      "EMAIL_DOMAIN",
      "EMAIL_FROM",
      "EMAIL_CALLBACK_URL",
    ]);

    const url = `https://api.mailgun.net/v3/${EMAIL_DOMAIN}/messages`;

    const response = await axios.post(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${EMAIL_API_KEY}`).toString(
          "base64"
        )}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        from: EMAIL_FROM,
        to: email,
        subject: "Inter Vault Alerts: Email Verification",
        text: `Click the link to verify your email: ${CALLBACK_URL}?token=${token}. Please note this link will expire in 30 minutes.`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Mailgun error: ${response.statusText}`);
    }
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
    const [EMAIL_API_KEY, EMAIL_DOMAIN, EMAIL_FROM] = getEnvVars([
      "EMAIL_API_KEY",
      "EMAIL_DOMAIN",
      "EMAIL_FROM",
    ]);

    const url = `https://api.mailgun.net/v3/${EMAIL_DOMAIN}/messages`;

    const response = await axios.post(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${EMAIL_API_KEY}`).toString(
          "base64"
        )}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        from: EMAIL_FROM,
        to: email,
        subject,
        text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Mailgun error: ${response.statusText}`);
    }
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
}
