import nodemailer from "nodemailer";

const buildTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

export const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = buildTransporter();

  if (!transporter) {
    console.log(`Email skipped: ${subject} -> ${to}`);
    return { skipped: true };
  }

  return transporter.sendMail({
    from: process.env.SMTP_FROM || "RideLoop <no-reply@rideloop.local>",
    to,
    subject,
    html,
    text
  });
};
