'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

const INCOME_CATEGORIES = [
  { value: 'tithe', label: 'Tithe' },
  { value: 'special_offering', label: 'Special Offering' },
  { value: 'other', label: 'Other Income' },
];

const EXPENSE_CATEGORIES = [
  { value: 'rent', label: 'Rent' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'salary', label: 'Salary' },
  { value: 'activity', label: 'Activity' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'office_supplies', label: 'Office Supplies' },
  { value: 'other', label: 'Other Expense' },
];

const PAYMENT_METHODS = ['Cash', 'Check', 'Bank Transfer', 'Online', 'Other'];

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

interface Transaction {
  id: string;
  type: string;
  category: string;
  amount: number;
  description: string | null;
  transaction_date: string;
  payment_method: string | null;
  created_at: string;
}

export default function ChurchAccountingPage() {
  const [mounted, setMounted] = useState(false);
  const [plan, setPlan] = useState('free');
  const [userId, setUserId] = useState('');
  const [entries, setEntries] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState(() => {
    const now = new Date();
    return now.getFullYear() + '-' + (now.getMonth() + 1).toString().padStart(2, '0');
  });
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formType, setFormType] = useState<'income' | 'expense'>('income');
  const [formCategory, setFormCategory] = useState('tithe');
  const [formAmount, setFormAmount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formPayment, setFormPayment] = useState('Cash');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Summary
  const [summary, setSummary] = useState<{totalIncome: number, totalExpense: number, netBalance: number} | null>(null);

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
        // Get plan
        const r = await fetch('/api/subscription?userId=' + session.user.id);
        const d = await r.json();
        if (d.plan) setPlan(d.plan);
      } catch (e) {}
    }
    init();
  }, [router]);

  useEffect(() => {
    if (userId && plan !== 'free' && plan !== 'starter') {
      fetchEntries();
    } else {
      setLoading(false);
    }
  }, [userId, plan, filterMonth]);

  async function fetchEntries() {
    setLoading(true);
    try {
      const [yearStr, monthStr] = filterMonth.split('-');
      const res = await fetch('/api/accounting/entries?churchId=' + userId + '&year=' + yearStr + '&month=' + monthStr);
      const data = await res.json();
      if (data.success) {
        setEntries(data.entries);
      }
      // Also fetch summary
      const sumRes = await fetch('/api/accounting/summary?churchId=' + userId + '&year=' + yearStr + '&month=' + monthStr);
      const sumData = await sumRes.json();
      if (sumData.success) {
        setSummary(sumData.summary);
      }
    } catch (e) {}
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formAmount || parseFloat(formAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/accounting/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          churchId: userId,
          type: formType,
          category: formCategory,
          amount: parseFloat(formAmount),
          description: formDescription,
          transactionDate: formDate,
          paymentMethod: formPayment,
          createdBy: userId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setFormAmount('');
        setFormDescription('');
        setFormDate(new Date().toISOString().split('T')[0]);
        fetchEntries();
      } else if (data.upgradeRequired) {
        setError(data.error);
      } else {
        setError(data.error || 'Failed to add entry');
      }
    } catch (e) {
      setError('Network error');
    }
    setSubmitting(false);
  }

  if (!mounted) return null;

  // Plan gate
  if (plan === 'free' || plan === 'starter') {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ width: '100%', maxWidth: '420px', padding: '24px' }}>
          <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>Church Accounting</h1>
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

  const categories = formType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e3a5f' }}>💰 Church Accounting</h1>
          <p style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>Track income and expenses for your church</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/church-reports" style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #1e3a5f', color: '#1e3a5f', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }}>
            📊 Reports
          </Link>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ padding: '10px 20px', background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
          >
            + Add Entry
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="card" style={{ textAlign: 'center', borderLeft: '4px solid #22c55e' }}>
            <div style={{ fontSize: '12px', color: '#666', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Income</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e', marginTop: '4px' }}>${summary.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="card" style={{ textAlign: 'center', borderLeft: '4px solid #ef4444' }}>
            <div style={{ fontSize: '12px', color: '#666', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Expenses</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444', marginTop: '4px' }}>${summary.totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="card" style={{ textAlign: 'center', borderLeft: '4px solid ' + (summary.netBalance >= 0 ? '#1e3a5f' : '#ef4444') }}>
            <div style={{ fontSize: '12px', color: '#666', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Net Balance</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: summary.netBalance >= 0 ? '#1e3a5f' : '#ef4444', marginTop: '4px' }}>${summary.netBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      )}

      {/* Month Filter */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <label style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>Filter by Month:</label>
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
        />
      </div>

      {/* Add Entry Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Add Transaction</h3>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#ef4444', fontSize: '14px' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {/* Type */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#333' }}>Type *</label>
                <select
                  value={formType}
                  onChange={(e) => { setFormType(e.target.value as 'income' | 'expense'); setFormCategory(e.target.value === 'income' ? 'tithe' : 'rent'); }}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              {/* Category */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#333' }}>Category *</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}
                >
                  {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              {/* Amount */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#333' }}>Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="0.00"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}
                  required
                />
              </div>
              {/* Date */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#333' }}>Date *</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}
                  required
                />
              </div>
              {/* Payment Method */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#333' }}>Payment Method</label>
                <select
                  value={formPayment}
                  onChange={(e) => setFormPayment(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}
                >
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              {/* Description */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px', color: '#333' }}>Description</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Optional note..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{ padding: '10px 24px', background: submitting ? '#94a3b8' : '#1e3a5f', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '14px' }}
              >
                {submitting ? 'Saving...' : 'Save Entry'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(''); }}
                style={{ padding: '10px 24px', background: '#f5f5f5', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', color: '#666' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Entries List */}
      <div className="card">
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Transactions</h3>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading...</div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
            <p>No transactions for this period yet.</p>
            <button onClick={() => setShowForm(true)} style={{ marginTop: '12px', padding: '10px 20px', background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
              Add Your First Entry
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: '600', color: '#333' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: '600', color: '#333' }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: '600', color: '#333' }}>Category</th>
                  <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: '600', color: '#333' }}>Amount</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: '600', color: '#333' }}>Payment</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: '600', color: '#333' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 8px', color: '#333' }}>{new Date(entry.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: entry.type === 'income' ? '#dcfce7' : '#fee2e2', color: entry.type === 'income' ? '#166534' : '#991b1b' }}>
                        {entry.type === 'income' ? '↑ Income' : '↓ Expense'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', color: '#333' }}>{CATEGORY_LABELS[entry.category] || entry.category}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600', color: entry.type === 'income' ? '#22c55e' : '#ef4444' }}>
                      {entry.type === 'income' ? '+' : '-'}${parseFloat(String(entry.amount)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#666' }}>{entry.payment_method || '—'}</td>
                    <td style={{ padding: '10px 8px', color: '#666', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.description || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
