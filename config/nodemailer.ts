import nodemailer, { type Transporter } from "nodemailer";

type MailCredentials = {
  user: string;
  pass: string;
};

let transporter: Transporter | null = null;

function getMailCredentials(): MailCredentials {
  const user = process.env.GOOGLE_APP_EMAIL?.trim();
  const pass = process.env.GOOGLE_APP_PASS?.trim();

  if (!user || !pass) {
    throw new Error(
      "Missing Gmail app credentials. Set GOOGLE_APP_EMAIL and GOOGLE_APP_PASS before sending mail.",
    );
  }

  return { user, pass };
}

export function getMailInbox() {
  return getMailCredentials().user;
}

export function getMailTransporter() {
  if (transporter) {
    return transporter;
  }

  const { user, pass } = getMailCredentials();

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}
