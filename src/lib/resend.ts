import { Resend } from 'resend';

// Resend Email API Integration
// Free plan: 3,000 emails/month
// Domain: shepherdaitech.com (Verified)

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export const resend = new Resend(RESEND_API_KEY);

// 检查是否已配置Resend
export const isResendConfigured = () => {
  return !!RESEND_API_KEY && RESEND_API_KEY !== '' && RESEND_API_KEY !== 'your-resend-api-key' && RESEND_API_KEY.startsWith('re_');
};

// 发送邮件
export async function sendEmail({
  to,
  subject,
  html,
  from,
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  if (!isResendConfigured()) {
    throw new Error('Resend API key not configured');
  }

  const { data, error } = await resend.emails.send({
    from: from || 'ShepherdAI <hello@shepherdaitech.com>',
    to: [to],
    subject,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// 发送邮件序列（用于访客跟进等场景）
export async function sendEmailSequence({
  emails,
  recipientEmail,
  recipientName,
  fromName,
  fromEmail,
}: {
  emails: Array<{ subject: string; body: string; week: number }>;
  recipientEmail: string;
  recipientName: string;
  fromName?: string;
  fromEmail?: string;
}) {
  const results: Array<{ week: number; messageId: string | null; scheduledFor: string; status: string }> = [];

  for (const email of emails) {
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + (email.week - 1) * 7);

    const fullBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <p style="font-size: 16px;">Hi ${recipientName},</p>
        <p style="font-size: 16px; line-height: 1.6;">${email.body}</p>
        <p style="font-size: 16px;">God bless,<br/>${fromName || 'Your Church'}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="font-size: 12px; color: #999;">Sent with ShepherdAI</p>
      </div>
    `;

    const isFirstEmail = email.week === 1;

    try {
      const data = await sendEmail({
        to: recipientEmail,
        subject: email.subject,
        html: fullBody,
        from: fromEmail ? `${fromName || 'Church'} <${fromEmail}>` : `${fromName || 'ShepherdAI'} <hello@shepherdaitech.com>`,
      });

      results.push({
        week: email.week,
        messageId: data?.id || null,
        scheduledFor: scheduledDate.toISOString(),
        status: isFirstEmail ? 'sent' : 'scheduled',
      });
    } catch (err) {
      console.error(`Failed to send week ${email.week} email:`, err);
      results.push({
        week: email.week,
        messageId: null,
        scheduledFor: scheduledDate.toISOString(),
        status: 'failed',
      });
    }

    // 每封邮件间隔500ms
    if (emails.indexOf(email) < emails.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return results;
}

// 发送每周通讯/群发
export async function sendNewsletter({
  subject,
  htmlContent,
  recipients,
  fromName,
  fromEmail,
}: {
  subject: string;
  htmlContent: string;
  recipients: string[];
  fromName?: string;
  fromEmail?: string;
}) {
  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    try {
      await sendEmail({
        to: recipient,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1e3a5f; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">${fromName || 'Our Church'}</h1>
              <p style="margin: 10px 0 0 0;">Weekly Newsletter</p>
            </div>
            <div style="padding: 20px;">
              ${htmlContent}
            </div>
            <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
              <p>Sent with ShepherdAI</p>
            </div>
          </div>
        `,
        from: fromEmail ? `${fromName || 'Church'} <${fromEmail}>` : `${fromName || 'ShepherdAI'} <hello@shepherdaitech.com>`,
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send newsletter to ${recipient}:`, err);
      failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return { sent, failed };
}
