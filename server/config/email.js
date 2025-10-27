// config/email.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, content, isHtml = true) => {
  try {
    const data = await resend.emails.send({
      from: 'ICEM Events <noreply@icem.com>', // Change to your domain or any name
      to,
      subject,
      [isHtml ? 'html' : 'text']: content,
    });

    console.log('✅ Email sent:', data);
    return data;
  } catch (error) {
    console.error('❌ Resend Email error:', error);
    throw new Error('Could not send email');
  }
};
