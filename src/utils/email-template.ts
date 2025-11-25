interface EmailTemplate {
  subject: string;
  html: string;
}

type WelcomeTemplateFn = (name: string) => EmailTemplate;
type ResetPasswordTemplateFn = (
  name: string,
  resetLink: string
) => EmailTemplate;

interface EmailTemplates {
  welcome: WelcomeTemplateFn;
  resetPassword: ResetPasswordTemplateFn;
}

export const emailTemplates: EmailTemplates = {
  welcome: (name) => ({
    subject: "Welcome to our platform!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome ${name}!</h1>
        <p>Thank you for joining our platform. We're excited to have you on board!</p>
        <p>Best regards,<br>The Team</p>
      </div>
    `,
  }),

  resetPassword: (name, resetLink) => ({
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset</h1>
        <p>Hello ${name},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  }),
};
