const emailConfig = require('../config/email');

class EmailService {
  constructor() {
    this.transporter = emailConfig.getTransporter();
    this.from = emailConfig.from;
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        html,
        text,
      });
      console.log(`✉️  Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Email send failed to ${to}:`, error.message);
      throw new Error(`Email delivery failed: ${error.message}`);
    }
  }

  // ─── Verification Email ───────────────────────────────────────────────────
  async sendVerificationEmail(user, verificationUrl) {
    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: 'Segoe UI', sans-serif; background: #f4f6ff; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(99,102,241,0.1);">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">🤝 SkillBridge</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 16px;">Local Skill Exchange Platform</p>
          </div>
          <div style="padding: 40px 32px;">
            <h2 style="color: #1e1b4b; font-size: 22px; margin: 0 0 16px;">Verify your email address</h2>
            <p style="color: #64748b; line-height: 1.7; margin: 0 0 24px;">
              Hi <strong>${user.name}</strong>,<br/>
              Welcome to SkillBridge! Click below to verify your email and start exchanging skills with your community.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verificationUrl}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; display: inline-block;">
                ✅ Verify Email
              </a>
            </div>
            <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 0;">
              Link expires in 24 hours. If you didn't create an account, ignore this email.
            </p>
          </div>
          <div style="background: #f8fafc; padding: 20px 32px; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2024 SkillBridge. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.sendEmail({
      to: user.email,
      subject: '✅ Verify your SkillBridge email',
      html,
      text: `Verify your email: ${verificationUrl}`,
    });
  }

  // ─── Password Reset Email ─────────────────────────────────────────────────
  async sendPasswordResetEmail(user, resetUrl) {
    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: 'Segoe UI', sans-serif; background: #f4f6ff; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(99,102,241,0.1);">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 SkillBridge</h1>
          </div>
          <div style="padding: 40px 32px;">
            <h2 style="color: #1e1b4b; font-size: 22px; margin: 0 0 16px;">Reset your password</h2>
            <p style="color: #64748b; line-height: 1.7; margin: 0 0 24px;">
              Hi <strong>${user.name}</strong>,<br/>
              We received a request to reset your password. Click below to set a new one.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; display: inline-block;">
                🔑 Reset Password
              </a>
            </div>
            <p style="color: #94a3b8; font-size: 13px; text-align: center;">
              This link expires in 1 hour. If you didn't request this, ignore this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.sendEmail({
      to: user.email,
      subject: '🔐 Reset your SkillBridge password',
      html,
      text: `Reset your password: ${resetUrl}`,
    });
  }

  // ─── Exchange Request Notification ────────────────────────────────────────
  async sendExchangeRequestEmail(receiver, sender, exchangeDetails) {
    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: 'Segoe UI', sans-serif; background: #f4f6ff; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0;">🤝 New Exchange Request</h1>
          </div>
          <div style="padding: 32px;">
            <p style="color: #334155; font-size: 16px; line-height: 1.7;">
              Hi <strong>${receiver.name}</strong>,<br/>
              <strong>${sender.name}</strong> wants to exchange skills with you!
            </p>
            <div style="background: #f0f9ff; border-left: 4px solid #6366f1; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #334155;">
                <strong>They offer:</strong> ${exchangeDetails.skillOffered}<br/>
                <strong>They want:</strong> ${exchangeDetails.skillWanted}
              </p>
              ${exchangeDetails.message ? `<p style="margin: 12px 0 0; color: #64748b; font-style: italic;">"${exchangeDetails.message}"</p>` : ''}
            </div>
            <p style="color: #64748b;">Log in to SkillBridge to accept or decline this request.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.sendEmail({
      to: receiver.email,
      subject: `🤝 ${sender.name} wants to exchange skills with you!`,
      html,
      text: `${sender.name} sent you a skill exchange request.`,
    });
  }

  // ─── Session Reminder ────────────────────────────────────────────────────
  async sendSessionReminder(user, session) {
    const sessionDate = new Date(session.scheduledAt).toLocaleString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: 'Segoe UI', sans-serif; background: #f4f6ff; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0;">⏰ Session Reminder</h1>
          </div>
          <div style="padding: 32px;">
            <p style="color: #334155; line-height: 1.7;">
              Hi <strong>${user.name}</strong>,<br/>
              Your session "<strong>${session.title}</strong>" starts in 1 hour!
            </p>
            <div style="background: #f0f9ff; border-left: 4px solid #6366f1; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #334155;">
                📅 <strong>Date:</strong> ${sessionDate}<br/>
                ⏱️ <strong>Duration:</strong> ${session.duration} minutes<br/>
                💻 <strong>Type:</strong> ${session.type}
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.sendEmail({
      to: user.email,
      subject: `⏰ Reminder: ${session.title} starts in 1 hour`,
      html,
      text: `Your session "${session.title}" starts at ${sessionDate}.`,
    });
  }
}

module.exports = new EmailService();
