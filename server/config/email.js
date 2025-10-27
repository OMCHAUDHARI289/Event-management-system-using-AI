// config/email.js
const SibApiV3Sdk = require("@sendinblue/client");
require("dotenv").config();

const brevo = new SibApiV3Sdk.TransactionalEmailsApi();
brevo.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

const sendEmail = async (to, subject, html, isHtml = true) => {
  try {
    const response = await brevo.sendTransacEmail({
      sender: {
        name: "ICEM Events",
        email: process.env.BREVO_SENDER,
      },
      to: [{ email: to }],
      subject,
      [isHtml ? "htmlContent" : "textContent"]: html,
    });

    console.log(`✅ Email sent successfully to ${to}`);
    return response;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message || error);
    throw new Error("Could not send email");
  }
};

module.exports = { sendEmail };
