'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const pathname = usePathname();

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi! I'm Grace, your ShepherdAI assistant. How can I help you today? 😊" },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    async function checkAuth() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) return;
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsLoggedIn(true);
          setUserId(session.user.id);
          const { data } = await supabase.from('referrals').select('referral_code').eq('referrer_id', session.user.id).single();
          if (data) {
            setReferralCode(data.referral_code);
          }
          const { count } = await supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('referrer_id', session.user.id).eq('status', 'completed');
          setReferralCount(count || 0);
        }
      } catch (e) {}
    }
    checkAuth();
  }, [pathname]);

  // Auto-focus chat input when opened
  useEffect(() => {
    if (chatOpen && chatInputRef.current) {
      chatInputRef.current.focus();
    }
  }, [chatOpen]);

  // Auto-scroll chat messages
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  if (!mounted) return <>{children}</>;

  const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/register';
  const referralLink = referralCode ? `${window.location.origin}?ref=${referralCode}` : '';

  // Referral floating button is shown when logged in on dashboard pages
  const showReferralButton = isLoggedIn && !isPublicPage && !showReferral;
  // Chat button positioning depends on whether referral button is visible
  const chatBtnBottom = showReferralButton ? '96px' : '24px';

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  }

  async function handleChatSend() {
    const trimmed = chatInput.trim();
    if (!trimmed || chatLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      const apiMessages = updatedMessages.map((m) => ({ role: m.role, content: m.content }));
      const body: { messages: { role: string; content: string }[]; userId?: string } = { messages: apiMessages };
      if (userId) body.userId = userId;

      const response = await fetch('/api/chat/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (data.success && data.message) {
        setChatMessages([...updatedMessages, { role: 'assistant', content: data.message }]);
      } else {
        setChatMessages([...updatedMessages, { role: 'assistant', content: data.error || 'Sorry, something went wrong. Please try again.' }]);
      }
    } catch {
      setChatMessages([...updatedMessages, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again in a moment." }]);
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <>
      {/* Top Navigation Bar */}
      {isLoggedIn && !isPublicPage && (
        <nav style={{
          background: 'white',
          borderBottom: '1px solid var(--border)',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" fill="#1e3a5f"/>
                <path d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8Z" fill="white"/>
                <path d="M16 22V26M12 24H20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a5f' }}>ShepherdAI</span>
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setShowReferral(true)}
              style={{
                background: 'linear-gradient(135deg, #f5a623 0%, #f7c948 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              🎁 Refer &amp; Earn
            </button>
          </div>
        </nav>
      )}

      {/* Page Content */}
      <div style={isLoggedIn && !isPublicPage ? { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' } : {}}>
        {children}
      </div>

      {/* Floating Referral Button */}
      {showReferralButton && (
        <button
          onClick={() => setShowReferral(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #f5a623 0%, #f7c948 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(245, 166, 35, 0.4)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          🎁
        </button>
      )}

      {/* Support Chat Window */}
      {chatOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: showReferralButton ? '96px' : '24px',
            right: '24px',
            width: '360px',
            height: '500px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 12px 48px rgba(0,0,0,0.2)',
            zIndex: 1500,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: 'calc(100vh - 80px)',
          }}
        >
          {/* Chat Header */}
          <div style={{
            background: '#1e3a5f',
            color: 'white',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '16px', fontWeight: '600' }}>💬 ShepherdAI Support</span>
            <button
              onClick={() => setChatOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '22px',
                cursor: 'pointer',
                lineHeight: 1,
                padding: '0 4px',
                opacity: 0.8,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
            >
              ✕
            </button>
          </div>

          {/* Chat Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user' ? '#1e3a5f' : '#f1f5f9',
                  color: msg.role === 'user' ? 'white' : '#1a202c',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  wordBreak: 'break-word',
                }}
              >
                {msg.content}
              </div>
            ))}
            {chatLoading && (
              <div style={{
                alignSelf: 'flex-start',
                maxWidth: '80%',
                padding: '10px 14px',
                borderRadius: '16px 16px 16px 4px',
                background: '#f1f5f9',
                color: '#64748b',
                fontSize: '14px',
                fontStyle: 'italic',
              }}>
                ...
              </div>
            )}
            <div ref={chatMessagesEndRef} />
          </div>

          {/* Chat Input */}
          <div style={{
            display: 'flex',
            padding: '12px',
            borderTop: '1px solid #e2e8f0',
            flexShrink: 0,
          }}>
            <input
              ref={chatInputRef}
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleChatSend();
                }
              }}
              placeholder="Type your message..."
              disabled={chatLoading}
              style={{
                flex: 1,
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '14px',
                outline: 'none',
                marginRight: '8px',
              }}
            />
            <button
              onClick={handleChatSend}
              disabled={chatLoading || !chatInput.trim()}
              style={{
                background: chatLoading || !chatInput.trim() ? '#94a3b8' : '#1e3a5f',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 18px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: chatLoading || !chatInput.trim() ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Support Chat Floating Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        style={{
          position: 'fixed',
          bottom: chatBtnBottom,
          right: '24px',
          background: '#1e3a5f',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(30,58,95,0.4)',
          zIndex: 1400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        💬
      </button>

      {/* Referral Modal */}
      {showReferral && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowReferral(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '40px',
              maxWidth: '480px',
              width: '90%',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎁</div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#1e3a5f' }}>Refer a Friend</h2>
            <p style={{ color: '#666', marginBottom: '8px' }}>Share your link. When they sign up, you both get <strong>1 month free</strong>!</p>
            
            {referralCount > 0 && (
              <div style={{ background: '#f0fdf4', border: '1px solid #22c55e', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#166534', fontSize: '14px' }}>
                ✅ You have {referralCount} successful referral{referralCount > 1 ? 's' : ''}!
              </div>
            )}

            {referralCode ? (
              <div style={{ marginTop: '20px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '14px', color: '#333', outline: 'none' }}
                  />
                  <button
                    onClick={handleCopy}
                    style={{
                      background: copied ? '#22c55e' : '#1e3a5f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ background: '#1877f2', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}
                  >
                    Facebook
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out ShepherdAI - AI-powered church management! ')}&url=${encodeURIComponent(referralLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ background: '#1da1f2', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}
                  >
                    Twitter/X
                  </a>
                  <a
                    href={`mailto:?subject=${encodeURIComponent('Check out ShepherdAI')}&body=${encodeURIComponent("I've been using ShepherdAI for church management and thought you might like it! Sign up with my link: " + referralLink)}`}
                    style={{ background: '#1e3a5f', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}
                  >
                    Email
                  </a>
                </div>
              </div>
            ) : (
              <p style={{ color: '#666', marginTop: '16px', fontSize: '14px' }}>Your referral code is being generated. Please refresh the page.</p>
            )}

            <button
              onClick={() => setShowReferral(false)}
              style={{ marginTop: '24px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '14px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
