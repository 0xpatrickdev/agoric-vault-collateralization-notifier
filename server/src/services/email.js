import axios from "axios";
import { getEnvVars } from "../utils/getEnvVar.js";

/**
 * @param {object} args
 * @param {string} args.email email of user
 * @param {string} args.subject subject line of the email
 * @param {string} [args.text] body of the email
 * @param {string} [args.html] body of the email
 * @returns {Promise<{id: string, message: string}>}
 */
export async function sendEmail({ email, subject, text, html }) {
  try {
    const [EMAIL_API_KEY, EMAIL_DOMAIN, EMAIL_FROM] = getEnvVars([
      "EMAIL_API_KEY",
      "EMAIL_DOMAIN",
      "EMAIL_FROM",
    ]);

    const url = `https://api.mailgun.net/v3/${EMAIL_DOMAIN}/messages`;

    const response = await axios.post(
      url,
      {
        from: EMAIL_FROM,
        to: [email],
        subject,
        text,
        html,
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${EMAIL_API_KEY}`).toString(
            "base64"
          )}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (response.status !== 200) {
      throw new Error(`Mailgun error: ${response.statusText}`);
    }
    return response.data;
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
}
