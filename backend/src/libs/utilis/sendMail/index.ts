import path from "path";
import nodemailer from "nodemailer";

export const getEmailTemplate = ({
  name,
  email,
  otp,
  template,
}: {
  name: string;
  email: string;
  otp: number;
  template: string;
}) => {
  const ejsFile = path.join(
    process.cwd(),
    "src",
    "libs",
    "utilis",
    "email-templates",
    `${template}.ejs`
  );

  if (!ejsFile) {
    throw new Error("EJS file not found");
  }

  const html = require("ejs").renderFile(ejsFile, { name, email, otp });

  return html;
};

export const sendEmail = async ({
  email,
  html,
}: {
  email: string;
  html: string;
}) => {
  const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "Email Verification",
    html,
  };

  await transporter.sendMail(mailOptions);
};
