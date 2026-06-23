import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-71801031b9fe4089ace9b695e5787d3f';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

const CATEGORY_LABELS: Record<string, string> = {
  tithe: 'Tithe',
  special_offering: 'Special Offering',
  rent: 'Rent',
  utilities: 'Utilities',
  salary: 'Salary',
  activity: 'Activity',
  maintenance: 'Maintenance',
  office_supplies: 'Office Supplies',
  other: 'Other',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { churchId, year, month } = body;

    if (!churchId) {
      return NextResponse.json({ error: 'churchId is required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, SERVICE_ROLE_KEY);

    // Fetch summary data
    const y = year || new Date().getFullYear();
    let startDate: string;
    let endDate: string;
    let periodLabel: string;

    if (month) {
      const m = parseInt(month);
      startDate = new Date(y, m - 1, 1).toISOString().split('T')[0];
      endDate = new Date(y, m, 0).toISOString().split('T')[0];
      periodLabel = new Date(y, m - 1).toLocaleString('en', { month: 'long', year: 'numeric' });
    } else {
      startDate = new Date(y, 0, 1).toISOString().split('T')[0];
      endDate = new Date(y, 11, 31).toISOString().split('T')[0];
      periodLabel = String(y);
    }

    const { data: entries } = await supabaseAdmin
      .from('church_transactions')
      .select('type, category, amount, transaction_date')
      .eq('church_id', churchId)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate);

    if (!entries || entries.length === 0) {
      return NextResponse.json({ success: true, report: 'No transaction data available for this period. Start by adding some entries in the Accounting page.' });
    }

    const totalIncome = entries.filter(e => e.type === 'income').reduce((s, e) => s + parseFloat(String(e.amount)), 0);
    const totalExpense = entries.filter(e => e.type === 'expense').reduce((s, e) => s + parseFloat(String(e.amount)), 0);

    const incomeByCategory: Record<string, number> = {};
    entries.filter(e => e.type === 'income').forEach(e => {
      const label = CATEGORY_LABELS[e.category] || e.category;
      incomeByCategory[label] = (incomeByCategory[label] || 0) + parseFloat(String(e.amount));
    });

    const expenseByCategory: Record<string, number> = {};
    entries.filter(e => e.type === 'expense').forEach(e => {
      const label = CATEGORY_LABELS[e.category] || e.category;
      expenseByCategory[label] = (expenseByCategory[label] || 0) + parseFloat(String(e.amount));
    });

    // Build prompt for DeepSeek
    const prompt = `Analyze this church's financial data for the period: ${periodLabel}

Total Income: $${totalIncome.toFixed(2)}
Total Expense: $${totalExpense.toFixed(2)}
Net: $${(totalIncome - totalExpense).toFixed(2)}

Income by Category: ${JSON.stringify(incomeByCategory)}
Expense by Category: ${JSON.stringify(expenseByCategory)}

Please provide:
1. A summary of the financial health
2. Key observations and trends
3. Budget recommendations
4. Stewardship suggestions based on biblical principles`;

    // Call DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + DEEPSEEK_API_KEY,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a church financial advisor. Provide practical, biblically-informed financial analysis and recommendations for churches.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('DeepSeek API error:', response.status, errText);
      return NextResponse.json({ error: 'AI report generation failed' }, { status: 500 });
    }

    const aiData = await response.json();
    const aiReport = aiData.choices?.[0]?.message?.content || 'Unable to generate report.';

    return NextResponse.json({ success: true, report: aiReport });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate report';
    console.error('Accounting report error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
