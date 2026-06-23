'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

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

interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  incomeByCategory: Record<string, number>;
  expenseByCategory: Record<string, number>;
  monthlyBreakdown: Array<{ month: string; income: number; expense: number }>;
  comparison: {
    prevTotalIncome: number;
    prevTotalExpense: number;
    incomeChange: string | null;
    expenseChange: string | null;
  };
  entryCount: number;
}

export default function ChurchReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [plan, setPlan] = useState('free');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [reportMode, setReportMode] = useState<'monthly' | 'annual'>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [aiReport, setAiReport] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    async function init() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        if (!supabaseUrl || !supabaseAnonKey) return;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push('/login'); return; }
        setUserId(session.user.id);
        const r = await fetch('/api/subscription?userId=' + session.user.id);
        const d = await r.json();
        if (d.plan) setPlan(d.plan);
      } catch (e) {}
    }
    init();
  }, [router]);

  useEffect(() => {
    if (userId && plan !== 'free' && plan !== 'starter') {
      fetchSummary();
    } else {
      setLoading(false);
    }
  }, [userId, plan, reportMode, selectedYear, selectedMonth]);

  async function fetchSummary() {
    setLoading(true);
    try {
      let url = '/api/accounting/summary?churchId=' + userId + '&year=' + selectedYear;
      if (reportMode === 'monthly') {
        url += '&month=' + selectedMonth;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
      }
    } catch (e) {}
    setLoading(false);
  }

  async function generateAiReport() {
    setAiLoading(true);
    setAiError('');
    setAiReport('');
    try {
      const body: Record<string, unknown> = { churchId: userId, year: selectedYear };
      if (reportMode === 'monthly') {
        body.month = selectedMonth;
      }
      const res = await fetch('/api/accounting/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setAiReport(data.report);
      } else {
        setAiError(data.error || 'Failed to generate report');
      }
    } catch (e) {
      setAiError('Network error');
    }
    setAiLoading(false);
  }

  function handlePrint() {
    window.print();
  }

  if (!mounted) return null;

  // Plan gate
  if (plan === 'free' || plan === 'starter') {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ width: '100%', maxWidth: '420px', padding: '24px' }}>
          <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>Financial Reports</h1>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              This feature requires the <strong style={{ color: '#1e3a5f' }}>Pro</strong> plan or higher.
            </p>
            <Link href="/settings" style={{ display: 'inline-block', background: '#1e3a5f', color: 'white', padding: '12px 32px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>
              Upgrade Now
            </Link>
            <div style={{ marginTop: '16px' }}>
              <Link href="/dashboard" style={{ color: '#666', fontSize: '14px' }}>← Back to Dashboard</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const maxBarValue = summary ? Math.max(...summary.monthlyBreakdown.map(m => Math.max(m.income, m.expense)), 1) : 1;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e3a5f' }}>📊 Financial Reports</h1>
          <p style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>Auto-generated insights for your church finances</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/church-accounting" style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #1e3a5f', color: '#1e3a5f', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }}>
            💰 Accounting
          </Link>
          <button onClick={handlePrint} style={{ padding: '10px 20px', background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
            🖨️ Print / PDF
          </button>
        </div>
      </div>

      {/* Mode Selector & Filters */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
          <button
            onClick={() => setReportMode('monthly')}
            style={{ padding: '8px 20px', border: 'none', background: reportMode === 'monthly' ? '#1e3a5f' : 'transparent', color: reportMode === 'monthly' ? 'white' : '#333', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
          >
            Monthly
          </button>
          <button
            onClick={() => setReportMode('annual')}
            style={{ padding: '8px 20px', border: 'none', background: reportMode === 'annual' ? '#1e3a5f' : 'transparent', color: reportMode === 'annual' ? 'white' : '#333', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
          >
            Annual
          </button>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
        >
          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        {reportMode === 'monthly' && (
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
          >
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>Loading report data...</div>
      ) : !summary ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
          <p style={{ color: '#666' }}>No data available. Add transactions in the <Link href="/church-accounting" style={{ color: '#1e3a5f', fontWeight: '600' }}>Accounting</Link> page first.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="card" style={{ textAlign: 'center', borderLeft: '4px solid #22c55e' }}>
              <div style={{ fontSize: '12px', color: '#666', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Income</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e', marginTop: '4px' }}>${summary.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              {summary.comparison.incomeChange !== null && (
                <div style={{ fontSize: '12px', color: parseFloat(summary.comparison.incomeChange) >= 0 ? '#22c55e' : '#ef4444', marginTop: '4px' }}>
                  {parseFloat(summary.comparison.incomeChange) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(summary.comparison.incomeChange))}% vs prev period
                </div>
              )}
            </div>
            <div className="card" style={{ textAlign: 'center', borderLeft: '4px solid #ef4444' }}>
              <div style={{ fontSize: '12px', color: '#666', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Expenses</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444', marginTop: '4px' }}>${summary.totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              {summary.comparison.expenseChange !== null && (
                <div style={{ fontSize: '12px', color: parseFloat(summary.comparison.expenseChange) >= 0 ? '#ef4444' : '#22c55e', marginTop: '4px' }}>
                  {parseFloat(summary.comparison.expenseChange) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(summary.comparison.expenseChange))}% vs prev period
                </div>
              )}
            </div>
            <div className="card" style={{ textAlign: 'center', borderLeft: '4px solid #1e3a5f' }}>
              <div style={{ fontSize: '12px', color: '#666', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Net Balance</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: summary.netBalance >= 0 ? '#1e3a5f' : '#ef4444', marginTop: '4px' }}>${summary.netBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="card" style={{ textAlign: 'center', borderLeft: '4px solid #64748b' }}>
              <div style={{ fontSize: '12px', color: '#666', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Transactions</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a5f', marginTop: '4px' }}>{summary.entryCount}</div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {/* Income by Category */}
            <div className="card">
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#22c55e' }}>📈 Income by Category</h4>
              {Object.keys(summary.incomeByCategory).length === 0 ? (
                <p style={{ color: '#999', fontSize: '14px' }}>No income data</p>
              ) : (
                Object.entries(summary.incomeByCategory).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => {
                  const pct = summary.totalIncome > 0 ? (amount / summary.totalIncome * 100) : 0;
                  return (
                    <div key={cat} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '600', color: '#333' }}>{CATEGORY_LABELS[cat] || cat}</span>
                        <span style={{ color: '#666' }}>${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({pct.toFixed(1)}%)</span>
                      </div>
                      <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: pct + '%', background: '#22c55e', borderRadius: '4px', transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {/* Expense by Category */}
            <div className="card">
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#ef4444' }}>📉 Expenses by Category</h4>
              {Object.keys(summary.expenseByCategory).length === 0 ? (
                <p style={{ color: '#999', fontSize: '14px' }}>No expense data</p>
              ) : (
                Object.entries(summary.expenseByCategory).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => {
                  const pct = summary.totalExpense > 0 ? (amount / summary.totalExpense * 100) : 0;
                  return (
                    <div key={cat} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '600', color: '#333' }}>{CATEGORY_LABELS[cat] || cat}</span>
                        <span style={{ color: '#666' }}>${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({pct.toFixed(1)}%)</span>
                      </div>
                      <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: pct + '%', background: '#ef4444', borderRadius: '4px', transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Monthly Trend (Annual only) */}
          {reportMode === 'annual' && (
            <div className="card" style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#1e3a5f' }}>📊 Monthly Trend</h4>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '200px', paddingTop: '20px' }}>
                {summary.monthlyBreakdown.map((m, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <div style={{ display: 'flex', gap: '1px', alignItems: 'flex-end', height: '160px' }}>
                      <div
                        style={{
                          width: '14px',
                          height: Math.max((m.income / maxBarValue) * 140, m.income > 0 ? 4 : 0) + 'px',
                          background: '#22c55e',
                          borderRadius: '2px 2px 0 0',
                          transition: 'height 0.3s',
                        }}
                        title={'Income: $' + m.income.toFixed(2)}
                      />
                      <div
                        style={{
                          width: '14px',
                          height: Math.max((m.expense / maxBarValue) * 140, m.expense > 0 ? 4 : 0) + 'px',
                          background: '#ef4444',
                          borderRadius: '2px 2px 0 0',
                          transition: 'height 0.3s',
                        }}
                        title={'Expense: $' + m.expense.toFixed(2)}
                      />
                    </div>
                    <div style={{ fontSize: '10px', color: '#666', fontWeight: '600' }}>{m.month}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '12px', fontSize: '12px', color: '#666' }}>
                <span><span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#22c55e', borderRadius: '2px', verticalAlign: 'middle', marginRight: '4px' }} /> Income</span>
                <span><span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px', verticalAlign: 'middle', marginRight: '4px' }} /> Expense</span>
              </div>
            </div>
          )}

          {/* AI Report Section */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e3a5f' }}>🤖 AI Financial Insights</h4>
              <button
                onClick={generateAiReport}
                disabled={aiLoading || summary.entryCount === 0}
                style={{ padding: '8px 20px', background: aiLoading || summary.entryCount === 0 ? '#94a3b8' : '#1e3a5f', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: aiLoading || summary.entryCount === 0 ? 'not-allowed' : 'pointer', fontSize: '13px' }}
              >
                {aiLoading ? 'Generating...' : 'Generate AI Report'}
              </button>
            </div>
            {aiError && (
              <div style={{ background: '#fef2f2', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px', color: '#ef4444', fontSize: '14px', marginBottom: '12px' }}>
                {aiError}
              </div>
            )}
            {aiReport ? (
              <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '20px', fontSize: '14px', lineHeight: '1.8', color: '#333', whiteSpace: 'pre-wrap' }}>
                {aiReport}
              </div>
            ) : !aiLoading ? (
              <p style={{ color: '#999', fontSize: '14px' }}>Click &quot;Generate AI Report&quot; to get AI-powered financial insights and recommendations for your church.</p>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🤖</div>
                Analyzing your financial data...
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
