const nodemailer = require("nodemailer");

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error(
      "Missing EMAIL_USER or EMAIL_PASS in environment variables"
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async (
  to,
  subject,
  text,
  html
) => {
  const transporter = createTransporter();

  let info;

  try {
    info =
      await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error("sendEmail failed:", {
      to,
      subject,
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      message: error.message,
    });

    throw error;
  }

  if (
    info.rejected &&
    info.rejected.length > 0
  ) {
    const error = new Error(
      `Email was rejected by recipient server: ${info.rejected.join(", ")}`
    );

    error.code =
      "EMAIL_REJECTED";
    error.rejected =
      info.rejected;

    throw error;
  }

  console.log("sendEmail success:", {
    to,
    subject,
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
  });

  return info;
};

module.exports = sendEmail;
