// Shared utility: record an AI generation consumption (1 use = 1 quota deduction)
// Called when user approves/uses AI-generated content

export async function consumeGeneration(userId: string, toolType: string, inputSummary?: string): Promise<boolean> {
  try {
    const res = await fetch('/api/ai-consume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, toolType, inputSummary: inputSummary || '' }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function rejectGeneration(userId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/ai-consume', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
