// Brevo (formerly Sendinblue) Email API Integration
// Free plan: 300 emails/day = 9,000/month

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_BASE = 'https://api.brevo.com/v3';

export function isBrevoConfigured(): boolean {
  return !!BREVO_API_KEY && BREVO_API_KEY !== '' && BREVO_API_KEY.startsWith('xkeysib-');
}

export interface SendEmailParams {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  from?: { email: string; name?: string };
  scheduledAt?: string;
}

export async function sendBrevoEmail(params: SendEmailParams): Promise<{ messageId: string } | null> {
  if (!isBrevoConfigured()) {
    throw new Error('Brevo API key not configured');
  }

  const response = await fetch(`${BREVO_API_BASE}/smtp/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': BREVO_API_KEY!,
    },
    body: JSON.stringify({
      sender: params.from || { name: 'ShepherdAI', email: 'hello@shepherdaitech.com' },
      to: params.to,
      subject: params.subject,
      htmlContent: params.htmlContent,
      scheduledAt: params.scheduledAt || undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Brevo API error:', response.status, error);
    throw new Error(`Brevo email failed: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return { messageId: data.messageId || '' };
}

// Send an email sequence: Week 1 immediately, Week 2+ scheduled via Brevo
export async function sendEmailSequence(params: {
  emails: Array<{ week: number; subject: string; body: string }>;
  recipientEmail: string;
  recipientName: string;
  fromName?: string;
  startDate?: string;
}): Promise<Array<{ week: number; messageId: string | null; scheduledFor: string; status: string }>> {
  const results: Array<{ week: number; messageId: string | null; scheduledFor: string; status: string }> = [];
  const startDate = params.startDate ? new Date(params.startDate) : new Date();

  for (const email of params.emails) {
    const scheduledDate = new Date(startDate);
    scheduledDate.setDate(scheduledDate.getDate() + (email.week - 1) * 7);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <p style="font-size: 16px;">Hi ${params.recipientName},</p>
        <p style="font-size: 16px; line-height: 1.6;">${email.body}</p>
        <p style="font-size: 16px;">God bless,<br/>${params.fromName || 'Your Church'}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="font-size: 12px; color: #999;">Sent with ShepherdAI</p>
      </div>
    `;

    const isFirstEmail = email.week === 1;
    // Brevo requires scheduledAt to be in the future, at least 5 minutes from now
    const scheduledAt = isFirstEmail ? undefined : scheduledDate.toISOString();

    try {
      const result = await sendBrevoEmail({
        to: [{ email: params.recipientEmail, name: params.recipientName }],
        subject: email.subject,
        htmlContent,
        from: { name: params.fromName || 'ShepherdAI', email: 'hello@shepherdaitech.com' },
        scheduledAt,
      });

      results.push({
        week: email.week,
        messageId: result?.messageId || null,
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

    if (params.emails.indexOf(email) < params.emails.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return results;
}

// Send newsletter to multiple recipients
export async function sendNewsletter(params: {
  subject: string;
  htmlContent: string;
  recipients: string[];
  fromName?: string;
}): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const recipient of params.recipients) {
    try {
      await sendBrevoEmail({
        to: [{ email: recipient }],
        subject: params.subject,
        htmlContent: params.htmlContent,
        from: { name: params.fromName || 'ShepherdAI', email: 'hello@shepherdaitech.com' },
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
