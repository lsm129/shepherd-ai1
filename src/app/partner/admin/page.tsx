'use client';

import { useState, useEffect } from 'react';

interface Partner {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  paypal_email: string;
  churches_served: number | null;
  services_description: string | null;
  referral_code: string;
  status: string;
  created_at: string;
}

const ADMIN_SECRET = 'shepherdai_partner_admin_2026';
const API_BASE = 'https://www.shepherdaitech.com/api/partner/admin';

export default function PartnerAdminPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}?secret=${ADMIN_SECRET}`);
      const data = await res.json();
      setPartners(data.partners || []);
    } catch (e) {
      console.error(e);
      setMessage('Failed to load partners');
    }
    setLoading(false);
  };

  const approvePartner = async (id: string) => {
    setActionLoading(id);
    setMessage('');
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partner_id: id, secret: ADMIN_SECRET }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ ${data.message}`);
        loadPartners();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (e) {
      setMessage('❌ Failed to approve');
    }
    setActionLoading(null);
  };

  const rejectPartner = async (id: string, name: string) => {
    if (!confirm(`Reject ${name}? This will delete their application and send a rejection email.`)) return;
    setActionLoading(id);
    setMessage('');
    try {
      const res = await fetch(API_BASE, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partner_id: id, secret: ADMIN_SECRET }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ ${name} rejected`);
        loadPartners();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (e) {
      setMessage('❌ Failed to reject');
    }
    setActionLoading(null);
  };

  const pending = partners.filter(p => p.status === 'pending');
  const active = partners.filter(p => p.status === 'active');
  const suspended = partners.filter(p => p.status === 'suspended');

  const cardStyle: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
  };

  const badgeStyle = (status: string): React.CSSProperties => ({
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    background: status === 'active' ? '#dcfce7' : status === 'pending' ? '#fef3c7' : '#fee2e2',
    color: status === 'active' ? '#166534' : status === 'pending' ? '#92400e' : '#991b1b',
  });

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#1e3a5f', marginBottom: '8px' }}>Partner Admin</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>Review and manage partner applications</p>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={{ flex: 1, background: '#fef3c7', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#92400e' }}>{pending.length}</div>
          <div style={{ fontSize: '13px', color: '#92400e' }}>Pending</div>
        </div>
        <div style={{ flex: 1, background: '#dcfce7', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#166534' }}>{active.length}</div>
          <div style={{ fontSize: '13px', color: '#166534' }}>Active</div>
        </div>
        <div style={{ flex: 1, background: '#fee2e2', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#991b1b' }}>{suspended.length}</div>
          <div style={{ fontSize: '13px', color: '#991b1b' }}>Suspended</div>
        </div>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', background: message.startsWith('✅') ? '#f0fdf4' : '#fef2f2', border: '1px solid ' + (message.startsWith('✅') ? '#86efac' : '#fca5a5'), borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
          {message}
        </div>
      )}

      <button onClick={loadPartners} style={{ marginBottom: '16px', padding: '8px 16px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
        🔄 Refresh
      </button>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Loading...</div>
      ) : (
        <>
          {/* Pending */}
          {pending.length > 0 && (
            <>
              <h2 style={{ color: '#92400e', fontSize: '18px', marginBottom: '12px' }}>⏳ Pending Review ({pending.length})</h2>
              {pending.map(p => (
                <div key={p.id} style={{ ...cardStyle, borderColor: '#f59e0b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <strong style={{ fontSize: '16px' }}>{p.name}</strong>
                      <span style={badgeStyle(p.status)}>Pending</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>{new Date(p.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px', color: '#555', marginBottom: '16px' }}>
                    <div>📧 {p.email}</div>
                    <div>🏢 {p.company}</div>
                    <div>📱 {p.phone}</div>
                    <div>💰 Payment: {p.paypal_email}</div>
                    <div>⛪ Churches served: {p.churches_served || 'N/A'}</div>
                    <div>🔑 Code: <strong>{p.referral_code}</strong></div>
                  </div>
                  {p.services_description && (
                    <div style={{ fontSize: '13px', color: '#777', marginBottom: '12px', background: '#f9f9f9', padding: '8px 12px', borderRadius: '6px' }}>
                      {p.services_description}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => approvePartner(p.id)}
                      disabled={actionLoading === p.id}
                      style={{ padding: '8px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
                    >
                      {actionLoading === p.id ? '⏳' : '✅ Approve'}
                    </button>
                    <button
                      onClick={() => rejectPartner(p.id, p.name)}
                      disabled={actionLoading === p.id}
                      style={{ padding: '8px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Active */}
          {active.length > 0 && (
            <>
              <h2 style={{ color: '#166534', fontSize: '18px', marginBottom: '12px', marginTop: '32px' }}>✅ Active Partners ({active.length})</h2>
              {active.map(p => (
                <div key={p.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{p.name}</strong> — {p.company} <span style={badgeStyle('active')}>Active</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      Code: <strong>{p.referral_code}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {partners.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No partner applications yet</div>
          )}
        </>
      )}
    </div>
  );
}
