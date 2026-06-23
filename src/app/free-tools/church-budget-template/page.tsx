'use client';
import { useState } from 'react';
import Link from 'next/link';

const INCOME_CATEGORIES = [
  'Tithes & Offerings',
  'Building Fund',
  'Missions Giving',
  'Special Events',
  'Facility Rental Income',
  'Grants & Donations',
  'Other Income',
];

const EXPENSE_CATEGORIES = [
  'Pastoral Staff Salary',
  'Administrative Staff',
  'Building Mortgage/Rent',
  'Utilities',
  'Ministry Programs',
  'Youth & Children Ministry',
  'Missions Support',
  'Worship & Music',
  'Office Supplies',
  'Insurance',
  'Maintenance & Repairs',
  'Community Outreach',
  'Technology & Media',
  'Other Expenses',
];

interface BudgetItem {
  category: string;
  amount: string;
}

export default function ChurchBudgetTemplatePage() {
  const [churchName, setChurchName] = useState('');
  const [budgetYear, setBudgetYear] = useState(new Date().getFullYear().toString());
  const [incomeItems, setIncomeItems] = useState<BudgetItem[]>(
    INCOME_CATEGORIES.map((c) => ({ category: c, amount: '' }))
  );
  const [expenseItems, setExpenseItems] = useState<BudgetItem[]>(
    EXPENSE_CATEGORIES.map((c) => ({ category: c, amount: '' }))
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [usageCount, setUsageCount] = useState(0);

  useState(() => {
    const count = parseInt((typeof window !== "undefined" ? localStorage : null)?.getItem('free_budget_count') || '0');
    const lastDate = (typeof window !== "undefined" ? localStorage : null)?.getItem('free_budget_date');
    const today = new Date().toDateString();
    if (lastDate === today) {
      setUsageCount(count);
    } else {
      (typeof window !== "undefined" ? localStorage : null)?.setItem('free_budget_count', '0');
      (typeof window !== "undefined" ? localStorage : null)?.setItem('free_budget_date', today);
      setUsageCount(0);
    }
  });

  function updateIncome(index: number, value: string) {
    const updated = [...incomeItems];
    updated[index] = { ...updated[index], amount: value };
    setIncomeItems(updated);
  }

  function updateExpense(index: number, value: string) {
    const updated = [...expenseItems];
    updated[index] = { ...updated[index], amount: value };
    setExpenseItems(updated);
  }

  const totalIncome = incomeItems.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
  const totalExpense = expenseItems.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
  const net = totalIncome - totalExpense;

  async function handleGenerate() {
    if (!churchName.trim()) {
      setError('Please enter your church name.');
      return;
    }
    if (usageCount >= 3) {
      setError('Daily limit reached (3/day). Sign up for unlimited access!');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const res = await fetch('/api/free-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          churchName,
          budgetYear,
          incomeItems: incomeItems.filter((i) => i.amount),
          expenseItems: expenseItems.filter((i) => i.amount),
          totalIncome,
          totalExpense,
          net,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.result);
        const newCount = usageCount + 1;
        setUsageCount(newCount);
        (typeof window !== "undefined" ? localStorage : null)?.setItem('free_budget_count', String(newCount));
        (typeof window !== "undefined" ? localStorage : null)?.setItem('free_budget_date', new Date().toDateString());
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  const remaining = 3 - usageCount;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      {/* Header */}
      <div style={{ background: '#1e3a5f', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '18px', fontWeight: '700' }}>
          ShepherdAI
        </Link>
        <Link href="/register" style={{ background: '#10b981', color: 'white', padding: '8px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
          Sign Up Free
        </Link>
      </div>

      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>💰</div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a5f', marginBottom: '8px', lineHeight: '1.2' }}>
            Free Church Budget Template
          </h1>
          <p style={{ fontSize: '16px', color: '#64748b', lineHeight: '1.5' }}>
            Fill in your church income & expenses, then generate a professional budget summary with AI analysis. No sign-up needed.
          </p>
          <div style={{ marginTop: '12px', fontSize: '13px', color: remaining > 0 ? '#10b981' : '#ef4444', fontWeight: '600' }}>
            {remaining > 0 ? `${remaining} free generations left today` : 'Daily limit reached'}
          </div>
        </div>

        {/* Form */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
          {/* Church Name & Year */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: '2', minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '6px' }}>
                Church Name *
              </label>
              <input
                type="text"
                value={churchName}
                onChange={(e) => setChurchName(e.target.value)}
                placeholder="e.g. Grace Community Church"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ flex: '1', minWidth: '120px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e3a5f', marginBottom: '6px' }}>
                Budget Year
              </label>
              <input
                type="text"
                value={budgetYear}
                onChange={(e) => setBudgetYear(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Income Section */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#10b981', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📈 Projected Income
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {incomeItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ flex: '1', fontSize: '14px', color: '#334155' }}>{item.category}</span>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>$</span>
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => updateIncome(i, e.target.value)}
                    placeholder="0"
                    style={{ width: '140px', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', textAlign: 'right', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>
            <div style={{ marginTop: '12px', padding: '12px 16px', background: '#f0fdf4', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '700', color: '#1e3a5f', fontSize: '15px' }}>Total Income</span>
              <span style={{ fontWeight: '700', color: '#10b981', fontSize: '17px' }}>${totalIncome.toLocaleString()}</span>
            </div>
          </div>

          {/* Expense Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#ef4444', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📉 Projected Expenses
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {expenseItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ flex: '1', fontSize: '14px', color: '#334155' }}>{item.category}</span>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>$</span>
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => updateExpense(i, e.target.value)}
                    placeholder="0"
                    style={{ width: '140px', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '15px', outline: 'none', textAlign: 'right', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>
            <div style={{ marginTop: '12px', padding: '12px 16px', background: '#fef2f2', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '700', color: '#1e3a5f', fontSize: '15px' }}>Total Expenses</span>
              <span style={{ fontWeight: '700', color: '#ef4444', fontSize: '17px' }}>${totalExpense.toLocaleString()}</span>
            </div>
          </div>

          {/* Net Summary */}
          <div style={{ padding: '16px', background: net >= 0 ? '#f0fdf4' : '#fef2f2', borderRadius: '10px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '700', color: '#1e3a5f', fontSize: '16px' }}>Net {net >= 0 ? 'Surplus' : 'Deficit'}</span>
            <span style={{ fontWeight: '800', color: net >= 0 ? '#10b981' : '#ef4444', fontSize: '20px' }}>${Math.abs(net).toLocaleString()}</span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || usageCount >= 3}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              border: 'none',
              background: loading || usageCount >= 3 ? '#94a3b8' : 'linear-gradient(135deg, #1e3a5f, #2d5a8e)',
              color: 'white',
              fontSize: '16px',
              fontWeight: '700',
              cursor: loading || usageCount >= 3 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Generating Budget Analysis...' : 'Generate Budget with AI Analysis'}
          </button>

          {error && (
            <div style={{ marginTop: '12px', padding: '12px 16px', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', fontSize: '14px' }}>
              {error}
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e3a5f' }}>Your Church Budget — {churchName}</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => navigator.clipboard.writeText(result)}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: '1.5px solid #e2e8f0', background: 'white', color: '#1e3a5f', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Copy
                </button>
                <button
                  onClick={handlePrint}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: '1.5px solid #e2e8f0', background: 'white', color: '#1e3a5f', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Print
                </button>
              </div>
            </div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '15px', color: '#334155' }}>
              {result}
            </div>
          </div>
        )}

        {/* Signup nudge after result */}
        {result && (
          <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '16px', padding: '28px', textAlign: 'center', color: 'white', marginBottom: '20px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✨</div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '6px' }}>
              Save this budget & get more AI tools
            </h2>
            <p style={{ fontSize: '14px', opacity: 0.95, marginBottom: '16px', lineHeight: '1.5' }}>
              Free accounts unlock: automated budget tracking, financial reports, expense categorization, and 10+ other AI ministry tools.
            </p>
            <Link
              href="/register"
              style={{ display: 'inline-block', padding: '12px 32px', borderRadius: '10px', background: 'white', color: '#059669', fontWeight: '700', fontSize: '16px', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            >
              Create Free Account →
            </Link>
            <div style={{ marginTop: '12px', fontSize: '12px', opacity: 0.8 }}>
              No credit card · Save all your work · Unlock 10+ AI tools
            </div>
          </div>
        )}

        {/* Limit reached nudge */}
        {usageCount >= 3 && !result && (
          <div style={{ background: '#fef3c7', borderRadius: '16px', padding: '28px', textAlign: 'center', marginBottom: '20px', border: '2px solid #f59e0b' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🚀</div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#92400e', marginBottom: '6px' }}>
              Daily limit reached — unlimited awaits!
            </h2>
            <p style={{ fontSize: '14px', color: '#92400e', marginBottom: '16px', lineHeight: '1.5' }}>
              Create a free account for unlimited budget reports plus 10+ other AI ministry tools.
            </p>
            <Link
              href="/register"
              style={{ display: 'inline-block', padding: '12px 32px', borderRadius: '10px', background: '#1e3a5f', color: 'white', fontWeight: '700', fontSize: '16px', textDecoration: 'none' }}
            >
              Sign Up Free →
            </Link>
          </div>
        )}

        {/* Bottom CTA - only after result */}
        {result && (
          <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #2d5a8e)', borderRadius: '16px', padding: '32px 28px', textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🤖</div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>
              Want AI to manage your entire church budget?
            </h2>
            <p style={{ fontSize: '15px', opacity: 0.9, marginBottom: '20px', lineHeight: '1.5' }}>
              ShepherdAI automates budget tracking, expense categorization, financial reports, and gives smart recommendations — all in one place.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/register"
                style={{ display: 'inline-block', padding: '12px 28px', borderRadius: '10px', background: '#10b981', color: 'white', fontWeight: '700', fontSize: '16px', textDecoration: 'none' }}
              >
                Try ShepherdAI Free →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
