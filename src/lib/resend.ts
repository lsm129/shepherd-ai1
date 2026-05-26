import { Resend } from 'resend';

// 创建Resend客户端
export const resend = new Resend(process.env.RESEND_API_KEY);

// 检查是否已配置Resend
export const isResendConfigured = () => {
  return process.env.RESEND_API_KEY !== '' && 
         process.env.RESEND_API_KEY !== 'your-resend-api-key';
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
    from: from || 'ShepherdAI <noreply@shepherdai.com>',
    to: [to],
    subject,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// 发送邮件序列
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
  const results = [];

  for (const email of emails) {
    // 添加签名
    const fullBody = `
      <p>Hi ${recipientName},</p>
      <p>${email.body}</p>
      <p>God bless,<br/>${fromName || 'Your Church'}</p>
    `;

    const data = await sendEmail({
      to: recipientEmail,
      subject: email.subject,
      html: fullBody,
      from: fromEmail ? `${fromName || 'Church'} <${fromEmail}>` : undefined,
    });

    results.push({ week: email.week, messageId: data?.id });

    // 每封邮件间隔5秒，避免被标记为垃圾邮件
    if (emails.indexOf(email) < emails.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  return results;
}

// 发送每周通讯
export async function sendNewsletter({
  content,
  subject,
  recipients,
  fromName,
  fromEmail,
}: {
  content: string;
  subject: string;
  recipients: string[];
  fromName?: string;
  fromEmail?: string;
}) {
  const html = content.replace(/\n/g, '<br/>');

  const results = [];

  for (const recipient of recipients) {
    const data = await sendEmail({
      to: recipient,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1e3a5f; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">${fromName || 'Our Church'}</h1>
            <p style="margin: 10px 0 0 0;">Weekly Newsletter</p>
          </div>
          <div style="padding: 20px;">
            ${html}
          </div>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p>Sent with ShepherdAI</p>
          </div>
        </div>
      `,
      from: fromEmail ? `${fromName || 'Church'} <${fromEmail}>` : undefined,
    });

    results.push({ recipient, messageId: data?.id });

    // 每封邮件间隔3秒
    if (recipients.indexOf(recipient) < recipients.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  return results;
}
