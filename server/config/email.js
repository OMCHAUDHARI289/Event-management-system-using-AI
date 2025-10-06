const nodemailer = require('nodemailer');
require('dotenv').config(); // make sure .env is loaded

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // your Gmail address
    pass: process.env.EMAIL_PASS   // App Password, NOT your Gmail password
  }
});

// Verify connection configuration
transporter.verify((err, success) => {
  if (err) console.error('SMTP connection error:', err);
  else console.log('SMTP is ready to send emails');
});

/**
 * Send email helper
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} content - email content (HTML or plain text)
 * @param {boolean} isHtml - true if content is HTML
 */
const sendEmail = async (to, subject, content, isHtml = false) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      ...(isHtml ? { html: content } : { text: content })
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Could not send email');
  }
};

module.exports = sendEmail;
