import nodemailer from "nodemailer";
import { env } from "../utils/env";
import { logger } from "../utils/logger";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: env.EMAIL_SECURE === "true",
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
} as SMTPTransport.Options);

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    logger.error("Email configuration error:", error);
  } else {
    logger.success("Email server is ready to take our messages");
  }
});

export default transporter;
