import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

// sends an email via brevo smtp
export const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
  await transporter.sendMail({
    from: `"${SENDER_EMAIL}"`,
    to,
    subject,
    html,
  });
};
