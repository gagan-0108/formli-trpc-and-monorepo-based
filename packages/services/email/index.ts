import { logger } from "@repo/logger";

function newResponseNotificationHTML(formTitle: string, responseCount: number, respondentEmail?: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>New Response - ${formTitle}</title></head>
<body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#09090b;padding:40px 20px;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background-color:#0f0f12;border:1px solid rgba(255,255,255,0.06);border-radius:16px;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px;">
<h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">📬 New Response</h1>
<p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">${formTitle}</p></td></tr>
<tr><td style="padding:32px 40px;">
<p style="margin:0 0 16px;color:#d4d4d8;font-size:15px;line-height:1.6;">You have a new response on <strong style="color:#fafafa;">"${formTitle}"</strong>.</p>
${respondentEmail ? `<p style="margin:0 0 16px;color:#d4d4d8;font-size:14px;"><strong style="color:#a1a1aa;">Respondent:</strong> ${respondentEmail}</p>` : ''}
<p style="margin:0 0 24px;color:#71717a;font-size:13px;">Total responses: <strong style="color:#a5b4fc;">${responseCount}</strong></p>
<a href="#" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:12px 28px;border-radius:100px;font-size:14px;font-weight:600;">View Responses →</a>
</td></tr>
<tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);">
<p style="margin:0;color:#52525b;font-size:12px;">Sent by Formli</p></td></tr>
</table></td></tr></table></body></html>`;
}

function submissionConfirmationHTML(formTitle: string, thankYouMessage?: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Thank you - ${formTitle}</title></head>
<body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#09090b;padding:40px 20px;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background-color:#0f0f12;border:1px solid rgba(255,255,255,0.06);border-radius:16px;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px;text-align:center;">
<div style="font-size:40px;margin-bottom:8px;">✅</div>
<h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">Response Received!</h1></td></tr>
<tr><td style="padding:32px 40px;text-align:center;">
<p style="margin:0 0 16px;color:#d4d4d8;font-size:15px;line-height:1.6;">Thank you for responding to <strong style="color:#fafafa;">"${formTitle}"</strong>.</p>
${thankYouMessage ? `<p style="margin:0 0 24px;color:#a1a1aa;font-size:14px;line-height:1.6;">${thankYouMessage}</p>` : ''}
<p style="margin:0;color:#52525b;font-size:13px;">Your response has been safely recorded.</p></td></tr>
<tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
<p style="margin:0;color:#52525b;font-size:12px;">Powered by <a href="#" style="color:#6366f1;text-decoration:none;">Formli</a></p></td></tr>
</table></td></tr></table></body></html>`;
}

export class EmailService {
  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const isDev = process.env.NODE_ENV !== "production";
    if (isDev) {
      logger.info(`📧 [EMAIL SIMULATED]`);
      logger.info(`   To: ${to}`);
      logger.info(`   Subject: ${subject}`);
      logger.info(`   Body: (HTML email - ${html.length} chars)`);
      return;
    }
    logger.warn(`Email sending not configured for production. Would have sent to: ${to}`);
  }

  async notifyNewResponse(creatorEmail: string, formTitle: string, responseCount: number, respondentEmail?: string): Promise<void> {
    try {
      const subject = `New response on "${formTitle}" (#${responseCount})`;
      const html = newResponseNotificationHTML(formTitle, responseCount, respondentEmail);
      await this.sendEmail(creatorEmail, subject, html);
    } catch (err) {
      logger.error("Failed to send new response notification email", { err });
    }
  }

  async sendSubmissionConfirmation(respondentEmail: string, formTitle: string, thankYouMessage?: string): Promise<void> {
    try {
      const subject = `Thank you for your response — ${formTitle}`;
      const html = submissionConfirmationHTML(formTitle, thankYouMessage);
      await this.sendEmail(respondentEmail, subject, html);
    } catch (err) {
      logger.error("Failed to send submission confirmation email", { err });
    }
  }
}

export const emailService = new EmailService();
