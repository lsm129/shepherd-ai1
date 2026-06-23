// Resend configuration with fallback for Vercel stale env vars
// If RESEND_API_KEY is not set or is a placeholder, use the correct key

const CORRECT_RESEND_KEY = 're_6HuefXJV_iaP8YXYhRFLs9RBLvTkjjX91';

function getResendApiKey(): string {
  const envKey = process.env.RESEND_API_KEY;
  if (!envKey || envKey === '' || envKey === 'your-resend-api-key') {
    return CORRECT_RESEND_KEY;
  }
  return envKey;
}

export const resendApiKey = getResendApiKey();
