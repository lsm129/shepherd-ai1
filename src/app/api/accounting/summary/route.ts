import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const churchId = searchParams.get('churchId');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!churchId) {
      return NextResponse.json({ error: 'churchId is required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, SERVICE_ROLE_KEY);

    // Build date range
    let startDate: string;
    let endDate: string;
    const y = year ? parseInt(year) : new Date().getFullYear();

    if (month) {
      const m = parseInt(month);
      startDate = new Date(y, m - 1, 1).toISOString().split('T')[0];
      endDate = new Date(y, m, 0).toISOString().split('T')[0];
    } else {
      startDate = new Date(y, 0, 1).toISOString().split('T')[0];
      endDate = new Date(y, 11, 31).toISOString().split('T')[0];
    }

    // Fetch entries for the period
    const { data: entries, error } = await supabaseAdmin
      .from('church_transactions')
      .select('type, category, amount, transaction_date')
      .eq('church_id', churchId)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate);

    if (error) {
      console.error('Summary fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 });
    }

    // Calculate summaries
    const totalIncome = (entries || []).filter(e => e.type === 'income').reduce((sum, e) => sum + parseFloat(String(e.amount)), 0);
    const totalExpense = (entries || []).filter(e => e.type === 'expense').reduce((sum, e) => sum + parseFloat(String(e.amount)), 0);
    const netBalance = totalIncome - totalExpense;

    // Category breakdown for income
    const incomeByCategory: Record<string, number> = {};
    (entries || []).filter(e => e.type === 'income').forEach(e => {
      incomeByCategory[e.category] = (incomeByCategory[e.category] || 0) + parseFloat(String(e.amount));
    });

    // Category breakdown for expenses
    const expenseByCategory: Record<string, number> = {};
    (entries || []).filter(e => e.type === 'expense').forEach(e => {
      expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + parseFloat(String(e.amount));
    });

    // Monthly breakdown (for annual view)
    const monthlyBreakdown: Array<{month: string, income: number, expense: number}> = [];
    for (let m = 0; m < 12; m++) {
      const monthStr = (m + 1).toString().padStart(2, '0');
      const monthLabel = new Date(y, m).toLocaleString('en', { month: 'short' });
      const monthEntries = (entries || []).filter(e => {
        const d = new Date(e.transaction_date);
        return d.getMonth() === m;
      });
      const mIncome = monthEntries.filter(e => e.type === 'income').reduce((s, e) => s + parseFloat(String(e.amount)), 0);
      const mExpense = monthEntries.filter(e => e.type === 'expense').reduce((s, e) => s + parseFloat(String(e.amount)), 0);
      monthlyBreakdown.push({ month: monthLabel, income: mIncome, expense: mExpense });
    }

    // Previous period comparison (same period last year or previous month)
    let prevStartDate: string;
    let prevEndDate: string;
    if (month) {
      const m = parseInt(month);
      if (m === 1) {
        prevStartDate = new Date(y - 1, 11, 1).toISOString().split('T')[0];
        prevEndDate = new Date(y - 1, 11, 31).toISOString().split('T')[0];
      } else {
        prevStartDate = new Date(y, m - 2, 1).toISOString().split('T')[0];
        prevEndDate = new Date(y, m - 1, 0).toISOString().split('T')[0];
      }
    } else {
      prevStartDate = new Date(y - 1, 0, 1).toISOString().split('T')[0];
      prevEndDate = new Date(y - 1, 11, 31).toISOString().split('T')[0];
    }

    const { data: prevEntries } = await supabaseAdmin
      .from('church_transactions')
      .select('type, amount')
      .eq('church_id', churchId)
      .gte('transaction_date', prevStartDate)
      .lte('transaction_date', prevEndDate);

    const prevTotalIncome = (prevEntries || []).filter(e => e.type === 'income').reduce((sum, e) => sum + parseFloat(String(e.amount)), 0);
    const prevTotalExpense = (prevEntries || []).filter(e => e.type === 'expense').reduce((sum, e) => sum + parseFloat(String(e.amount)), 0);

    // YoY / MoM change percentages
    const incomeChange = prevTotalIncome > 0 ? ((totalIncome - prevTotalIncome) / prevTotalIncome * 100).toFixed(1) : null;
    const expenseChange = prevTotalExpense > 0 ? ((totalExpense - prevTotalExpense) / prevTotalExpense * 100).toFixed(1) : null;

    return NextResponse.json({
      success: true,
      summary: {
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpense: Math.round(totalExpense * 100) / 100,
        netBalance: Math.round(netBalance * 100) / 100,
        incomeByCategory,
        expenseByCategory,
        monthlyBreakdown,
        comparison: {
          prevTotalIncome: Math.round(prevTotalIncome * 100) / 100,
          prevTotalExpense: Math.round(prevTotalExpense * 100) / 100,
          incomeChange,
          expenseChange,
        },
        entryCount: (entries || []).length,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get summary';
    console.error('Accounting summary error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
