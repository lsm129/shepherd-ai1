import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = 'https://hsunvuixqesjcoohbrmp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDU3NzQsImV4cCI6MjA5NTc4MTc3NH0.zVcLkOGAf4OWQck1_JNkq03Sjp0maZ5eIv4eYh0Nl2I';
const DEEPSEEK_API_KEY = 'sk-71801031b9fe4089ace9b695e5787d3f';

interface BudgetItem {
  category: string;
  amount: string;
}

export async function POST(req: NextRequest) {
  try {
    const { churchName, budgetYear, incomeItems, expenseItems, totalIncome, totalExpense, net } = await req.json();

    if (!churchName) {
      return NextResponse.json({ error: 'Church name is required' }, { status: 400 });
    }

    const safeIncome = Array.isArray(incomeItems) ? incomeItems : [];
    const safeExpense = Array.isArray(expenseItems) ? expenseItems : [];
    const incomeLines = safeIncome
      .filter((i: BudgetItem) => i.amount)
      .map((i: BudgetItem) => `  ${i.category}: $${Number(i.amount).toLocaleString()}`)
      .join('\n');
    const expenseLines = safeExpense
      .filter((i: BudgetItem) => i.amount)
      .map((i: BudgetItem) => `  ${i.category}: $${Number(i.amount).toLocaleString()}`)
      .join('\n');

    const prompt = `You are a professional church financial advisor. Create a well-formatted, print-ready church budget summary for the following data:

Church Name: ${churchName}
Budget Year: ${budgetYear || new Date().getFullYear()}

PROJECTED INCOME:
${incomeLines || '  (No income items entered)'}
Total Income: $${Number(totalIncome || 0).toLocaleString()}

PROJECTED EXPENSES:
${expenseLines || '  (No expense items entered)'}
Total Expenses: $${Number(totalExpense || 0).toLocaleString()}

Net: $${Number(net || 0).toLocaleString()} (${Number(net) >= 0 ? 'Surplus' : 'Deficit'})

Requirements:
- Format this as a professional, printable church budget document
- Include a clear header with church name and year
- Show income and expense sections with subtotals
- Include a net summary at the bottom
- Add a brief "Budget Health Assessment" (2-3 sentences of encouraging, practical advice based on the numbers)
- If there's a deficit, suggest 2-3 specific areas to review
- If there's a surplus, suggest 2-3 wise allocation ideas
- Use clean formatting with section dividers
- Do not use emoji
- Keep the tone warm and pastoral, not corporate
- Format for easy reading and printing`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1200,
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('DeepSeek error:', err);
      return NextResponse.json({ error: 'Failed to generate budget' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Track usage in Supabase
    try {
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      await fetch(`${SUPABASE_URL}/rest/v1/free_tool_usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          tool_type: 'budget',
          ip_address: ip,
          created_at: new Date().toISOString(),
        }),
      });
    } catch {}

    return NextResponse.json({ result: content });
  } catch (error) {
    console.error('Free budget error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
