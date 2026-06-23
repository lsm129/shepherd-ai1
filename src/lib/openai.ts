export function isOpenAIConfigured() {
  return process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key';
}
