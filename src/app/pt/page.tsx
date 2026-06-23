'use client';
import Link from "next/link";
import { useState, useEffect } from 'react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-config';

const PLAN_ORDER = ['free', 'starter', 'pro', 'growth'];

const allFeatures = [
  { icon: '📖', title: 'Preparação de Sermões', desc: 'Das escrituras ao sermão em minutos — esboços, estudos de palavras, referências cruzadas, ilustrações e aplicações. Tudo gerado por IA para sua tradição.', color: '#1a56db', href: '/sermon-prep', minPlan: 'free', forRole: 'pastor' as const },
  { icon: '📧', title: 'Acompanhamento de Visitantes', desc: 'IA escreve 6 e-mails personalizados por visitante com base em seu perfil. Pastor visualiza, edita e envia automaticamente.', color: '#1e3a5f', href: '/visitor-followup', minPlan: 'free', forRole: 'pastor' as const },
  { icon: '🙏', title: 'Gestão de Pedidos de Oração', desc: 'Respostas geradas por IA com versículos bíblicos para pedidos de oração. Revise e responda às orações dos congregados.', color: '#8b5cf6', href: '/prayer-requests', minPlan: 'free', forRole: 'pastor' as const },
  { icon: '📢', title: 'Avisos da Igreja', desc: 'Crie avisos de igreja elegantes para cultos, eventos e ocasiões especiais em segundos.', color: '#f59e0b', href: '/church-announcement', minPlan: 'free', forRole: 'pastor' as const },
  { icon: '📱', title: 'Sermão para Redes Sociais', desc: 'Transforme suas notas de sermão em várias postagens envolventes para Facebook, Instagram, Twitter — tudo de uma vez.', color: '#ec4899', href: '/sermon-social', minPlan: 'starter', forRole: 'pastor' as const },
  { icon: '📖', title: 'Devocional Diário', desc: 'Versículos bíblicos, meditações, aplicação prática e oração final — gerados frescos a cada dia. Entrega por e-mail incluída.', color: '#10b981', href: '/daily-devotional', minPlan: 'free', forRole: 'both' as const },
  { icon: '📰', title: 'Informativo Semanal', desc: 'Transforme os destaques da sua semana em informativos profissionais que sua congregação vai realmente ler.', color: '#4a90a4', href: '/weekly-newsletter', minPlan: 'starter', forRole: 'pastor' as const },
  { icon: '📋', title: 'Mercado de Modelos', desc: 'Compartilhe seu dom, abençoe milhares. Navegue e use modelos de sermões de pastores do mundo todo.', color: '#22c55e', href: '/templates', minPlan: 'starter', forRole: 'pastor' as const },
  { icon: '⚡', title: 'Conteúdo em Lote', desc: 'Um sermão → 50 postagens. Um tema → um mês de devocionais. Escale seu conteúdo ministerial.', color: '#6366f1', href: '/batch-content', minPlan: 'pro', forRole: 'pastor' as const },
  { icon: '🏥', title: 'Relatório de Saúde Ministerial', desc: 'Veja como sua igreja está e receba recomendações personalizadas para crescer.', color: '#ef4444', href: '/diagnosis', minPlan: 'free', forRole: 'pastor' as const },
  { icon: '🌍', title: 'Base de Conhecimento Comunitária', desc: 'Compartilhe sabedoria e aprenda com líderes ministeriais ao redor do mundo. Pergunte, obtenha respostas.', color: '#0ea5e9', href: '/community', minPlan: 'free', forRole: 'both' as const },
  { icon: '🧠', title: 'IA que Aprende seu Estilo', desc: 'A ShepherdAI aprende seu estilo, tom e preferências ao longo do tempo. Quanto mais você usa, melhor ela fica.', color: '#f97316', href: '/settings', minPlan: 'free', forRole: 'pastor' as const },
  { icon: '🎯', title: 'Plano Pastoral Personalizado', desc: 'Quando membros se juntam, a IA analisa seu perfil e gera um plano de cuidado pastoral personalizado instantaneamente.', color: '#14b8a6', href: '/member/profile', minPlan: 'free', forRole: 'pastor' as const },
  { icon: '🤝', title: 'Comunidade de Oração', desc: 'Congregados se apoiam com curtidas e respostas em pedidos de oração. Construa uma comunidade que ora e se importa.', color: '#a855f7', href: '/church-community', minPlan: 'free', forRole: 'congregant' as const },
  { icon: '⭐', title: 'Engajamento de Congregados', desc: 'Pontos, medalhas e devocionais diários mantêm sua congregação ativa e crescendo. Recompense a participação automaticamente.', color: '#eab308', href: '/points-center', minPlan: 'free', forRole: 'congregant' as const },
  { icon: '🔍', title: 'Descoberta de Igrejas', desc: 'Novos membros encontram e se juntam à sua igreja online. IA os conecta à congregação certa com base em localização e denominação.', color: '#06b6d4', href: '/find-church', minPlan: 'free', forRole: 'congregant' as const },
  { icon: '🕊️', title: 'Planejador de Culto Dominical', desc: 'IA cria planos completos de culto — chamada à adoração, hinos, leituras, sermão, bênção. Adaptado à sua tradição e estação.', color: '#7c3aed', href: '/sunday-worship-planner', minPlan: 'starter', forRole: 'pastor' as const },
  { icon: '📰', title: 'Informativo Mensal da Igreja', desc: 'IA escreve um informativo mensal completo — mensagem do pastor, destaques, eventos, ministérios, foco de oração.', color: '#0891b2', href: '/monthly-newsletter', minPlan: 'starter', forRole: 'pastor' as const },
  { icon: '👥', title: 'Gestão de Membros', desc: 'Diretório completo, planos de cuidado pastoral, controle de frequência, grupos pequenos, escala de voluntários.', color: '#3b82f6', href: '/membership-management', minPlan: 'free', forRole: 'pastor' as const },
  { icon: '💰', title: 'Gestão de Doações', desc: 'Controle dízimos e ofertas, gere extratos de contribuição, campanhas de promessa e análise de tendências.', color: '#16a34a', href: '/donation-management', minPlan: 'free', forRole: 'pastor' as const },
  { icon: '⛪', title: 'Para Organizações Religiosas', desc: 'Construído para igrejas com suporte a 13+ denominações, IA centrada nas Escrituras e fluxos específicos para igrejas.', color: '#7c3aed', href: '/for-churches', minPlan: 'free', forRole: 'both' as const },
];

export default function HomePT() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPlan, setUserPlan] = useState('free');
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [foundingSpotsLeft, setFoundingSpotsLeft] = useState<number>(10);
  const [userRole, setUserRole] = useState<string>('pastor');
  const [featureTab, setFeatureTab] = useState<'pastor' | 'congregant'>('pastor');
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [recentPosts, setRecentPosts] = useState<{title: string; slug: string; excerpt: string; published_at: string}[]>([]);

  async function handleUpgrade(planId: string) {
    if (!userId) return;
    setUpgrading(planId);
    try {
      const r = await fetch('/api/creem/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, userId, userEmail: userEmail || undefined, billingCycle })
      });
      const d = await r.json();
      if (d.checkoutUrl) {
        window.location.href = d.checkoutUrl;
      } else {
        alert(d.error || 'Erro ao iniciar checkout');
        setUpgrading(null);
      }
    } catch (e) {
      alert('Erro de rede, tente novamente');
      setUpgrading(null);
    }
  }

  useEffect(() => {
    async function checkAuth() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        if (!supabaseUrl || !supabaseAnonKey) return;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
        if (session) {
          try {
            const r = await fetch('/api/subscription?userId=' + session.user.id);
            const d = await r.json();
            if (d.plan) setUserPlan(d.plan);
          setUserId(session.user.id);
          setUserEmail(session.user.email || '');
          } catch (e) {}
          const meta = session.user.user_metadata || {};
          const role = meta.role || 'pastor';
          setUserRole(role);
          setFeatureTab(role === 'congregant' ? 'congregant' : 'pastor');
        }
      } catch (e) {}
    }
    checkAuth();

    async function fetchFoundingSpots() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        if (!supabaseUrl || !supabaseAnonKey) return;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { count } = await supabase.from('founding_church_applications').select('*', { count: 'exact', head: true });
        const taken = count || 0;
        setFoundingSpotsLeft(Math.max(0, 10 - taken));
      } catch (e) {}
    }
    fetchFoundingSpots();
    
    async function fetchRecentPosts() {
      try {
        const r = await fetch('/api/blog');
        const d = await r.json();
        if (d.posts && d.posts.length > 0) {
          setRecentPosts(d.posts.slice(0, 3));
        }
      } catch {}
    }
    fetchRecentPosts();
  }, []);

  const heroSlides = [
    {
      badge: 'Ferramentas Ministeriais com IA',
      title1: 'Faça Ministério,',
      titleHighlight: 'Não Burocracia',
      title2: '— Comece Grátis',
      desc: "Você não foi chamado para gerenciar planilhas. Nossa IA cuida do acompanhamento de visitantes, conteúdo de sermões, informativos e respostas de oração — para que você foque na sua congregação. Plano gratuito, sem cartão de crédito.",
      btnText: isLoggedIn ? 'Ir para o Painel' : 'Comece Grátis — Sem Cartão',
      btn2Text: 'Ver Todos os Recursos',
      btnHref: isLoggedIn ? (userRole === 'congregant' ? '/member/dashboard' : '/dashboard') : '/register',
      btn2Href: '#features',
      bg: 'linear-gradient(180deg, #f8fafc 0%, white 100%)',
    },
    {
      badge: '📝 Últimas do Nosso Blog',
      title1: recentPosts[0]?.title?.substring(0,30) || 'IA para Igrejas:',
      titleHighlight: 'Novos Artigos',
      title2: '',
      desc: recentPosts[0]?.excerpt?.substring(0,120) || 'Da preparação de sermões ao acompanhamento de visitantes, a IA já está mudando como as igrejas operam.',
      btnText: 'Ler Artigo →',
      btn2Text: 'Ver Todos os Artigos',
      btnHref: recentPosts[0] ? '/blog/' + recentPosts[0].slug : '/blog/ai-for-churches-complete-guide',
      btn2Href: '/blog',
      bg: 'linear-gradient(180deg, #eff6ff 0%, white 100%)',
    },
    {
      badge: '🌍 Sabedoria Comunitária',
      title1: 'Aprenda com Líderes',
      titleHighlight: 'Ministeriais do Mundo',
      title2: '',
      desc: 'Compartilhe sabedoria, faça perguntas e cresça junto com pastores e líderes de todo o mundo.',
      btnText: 'Junte-se à Comunidade →',
      btn2Text: 'Ver Todos os Recursos',
      btnHref: '/community',
      btn2Href: '#features',
      bg: 'linear-gradient(180deg, #f0fdf4 0%, white 100%)',
    },
    {
      badge: '🆕 Novo Recurso',
      title1: 'Planejador de',
      titleHighlight: 'Culto Dominical',
      title2: '— Disponível Agora!',
      desc: 'IA cria planos completos de culto: chamada à adoração, hinos, leituras, sermão, bênção. Adaptado à sua tradição e estação litúrgica.',
      btnText: 'Experimente Agora →',
      btn2Text: 'Ver Todos os Recursos',
      btnHref: '/sunday-worship-planner',
      btn2Href: '#features',
      bg: 'linear-gradient(180deg, #faf5ff 0%, white 100%)',
    },
  ];

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setHeroSlideIndex(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const mobileMenuLinks = [
    { label: 'Recursos', href: '#features' },
    { label: 'Preços', href: '#pricing' },
    { label: 'Para Igrejas', href: '/for-churches' },
    { label: 'Blog', href: '/pt/blog' },
    { label: 'Roteiro', href: '/roadmap' },
    { label: 'Entrar', href: '/login', highlight: false },
    { label: 'Comece Grátis', href: '/register', highlight: true },
  ];

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'ShepherdAI',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          offers: { '@type': 'AggregateOffer', lowPrice: '0', highPrice: '79', priceCurrency: 'USD', offerCount: '4' },
          description: 'Plataforma de gestão eclesial com IA que ajuda pastores a economizar 8+ horas por semana com acompanhamento automatizado de visitantes, sermão para redes sociais, gestão de oração, devocionais e informativos.',
          url: 'https://www.shepherdaitech.com/pt',
          image: 'https://www.shepherdaitech.com/og-image.png',
        }) }}
      />

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)', zIndex: 100 }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
          <Link href="/pt" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#1e3a5f"/><path d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8ZM16 12C17.105 12 18 12.895 18 14C18 15.105 17.105 16 16 16C14.895 16 14 15.105 14 14C14 12.895 14.895 12 16 12Z" fill="white"/><path d="M16 22V26M12 24H20" stroke="white" strokeWidth="2" strokeLinecap="round"></path></svg>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>ShepherdAI</span>
          </Link>
          <div className="nav-desktop-links" style={{ alignItems: 'center', gap: '24px' }}>
            <a href="#features" className="nav-link">Recursos</a>
            <a href="#pricing" className="nav-link">Preços</a>
            <Link href="/for-churches" className="nav-link">Para Igrejas</Link>
            <Link href="/pt/blog" className="nav-link">Blog</Link>
            <Link href="/roadmap" className="nav-link">Roteiro</Link>
            <LanguageSwitcher />
            {isLoggedIn ? (
              <>
                <Link href={userRole === 'congregant' ? "/member/dashboard" : "/dashboard"} className="btn-primary">Painel</Link>
                <button onClick={async () => {
                  const { createClient } = await import('@supabase/supabase-js');
                  const supabase = createClient((supabaseUrl), (supabaseAnonKey));
                  await supabase.auth.signOut();
                  window.location.reload();
                }} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#666' }}>Sair</button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost">Entrar</Link>
                <Link href="/register" className="btn-primary">Comece Grátis</Link>
              </>
            )}
          </div>
          <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menu"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', flexShrink: 0 }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M4 7H24M4 14H24M4 21H24" stroke="#1e3a5f" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} />
          <div className="mobile-menu-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a5f' }}>Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Fechar menu"
                style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#64748b', lineHeight: 1 }}>✕</button>
            </div>
            {mobileMenuLinks.map((link, i) => (
              <Link key={i} href={link.href} className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}
                style={link.highlight ? { background: '#1e3a5f', color: 'white', textAlign: 'center', marginTop: '8px', fontWeight: '700' } : {}}>
                {link.label}
              </Link>
            ))}
            <div style={{ padding: '4px 16px', marginTop: '8px' }}>
              <LanguageSwitcher />
            </div>
          </div>
        </>
      )}

      <div style={{ background: 'linear-gradient(90deg, #f5a623 0%, #f7c948 50%, #f5a623 100%)', padding: '8px 0', position: 'fixed', top: '72px', left: 0, right: 0, zIndex: 99, boxShadow: '0 2px 8px rgba(245,166,35,0.3)' }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a5f' }}>⛪ Igreja Fundadora</span>
          <span style={{ fontSize: '16px', fontWeight: '900', color: '#dc2626' }}>Restam {foundingSpotsLeft} vagas!</span>
          <span style={{ fontSize: '18px', fontWeight: '900', color: '#15803d' }}>GRÁTIS por 1 Ano!</span>
          <Link href="/founding-church" style={{ background: '#1e3a5f', color: 'white', padding: '6px 16px', borderRadius: '6px', fontWeight: '700', textDecoration: 'none', fontSize: '14px', whiteSpace: 'nowrap' }}>Garanta Já →</Link>
        </div>
      </div>

      <section style={{ paddingTop: isLoggedIn ? '130px' : '210px', paddingBottom: '120px', background: 'linear-gradient(180deg, #f8fafc 0%, white 100%)' }}>
        <div className="page-container" style={{ textAlign: 'center', position: 'relative' }}>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', transition: 'transform 0.5s ease', transform: `translateX(-${heroSlideIndex * 100}%)` }}>
              {heroSlides.map((slide, i) => (
                <div key={i} style={{ minWidth: '100%' }}>
                  <div className="badge badge-primary" style={{ marginBottom: '24px', fontSize: '14px', padding: '8px 20px' }}>{slide.badge}</div>
                  {i === heroSlideIndex ? (
                    <h1 style={{ fontSize: '56px', fontWeight: 'bold', color: 'var(--primary)', lineHeight: '1.2', marginBottom: '24px', maxWidth: '800px', margin: '0 auto 24px' }}>
                      {slide.title1}<br />{slide.titleHighlight && <span style={{ color: 'var(--secondary)' }}>{slide.titleHighlight}</span>}{slide.title2 && <span style={{ color: 'var(--primary)' }}>{slide.title2}</span>}
                    </h1>
                  ) : (
                    <h2 style={{ fontSize: '56px', fontWeight: 'bold', color: 'var(--primary)', lineHeight: '1.2', marginBottom: '24px', maxWidth: '800px', margin: '0 auto 24px' }}>
                      {slide.title1}<br />{slide.titleHighlight && <span style={{ color: 'var(--secondary)' }}>{slide.titleHighlight}</span>}{slide.title2 && <span style={{ color: 'var(--primary)' }}>{slide.title2}</span>}
                    </h2>
                  )}
                  <p style={{ fontSize: '20px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6' }}>
                    {slide.desc}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Link href={slide.btnHref} style={{ display: 'inline-block', fontSize: '20px', padding: '18px 40px', borderRadius: '14px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: '800', textDecoration: 'none', boxShadow: '0 4px 20px rgba(16,185,129,0.4)', transition: 'transform 0.2s, box-shadow 0.2s', border: 'none', cursor: 'pointer' }}>{slide.btnText}</Link>
                      <a href={slide.btn2Href} className="btn-secondary" style={{ fontSize: '18px', padding: '18px 32px' }}>{slide.btn2Text}</a>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)', fontSize: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <span>✅ Plano gratuito para sempre</span>
                      <span>🔒 Sem cartão de crédito</span>
                      <span>⚡ Configuração em 2 minutos</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => setHeroSlideIndex(prev => (prev - 1 + heroSlides.length) % heroSlides.length)}
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: '1px solid #e2e8f0', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>‹</button>
          <button onClick={() => setHeroSlideIndex(prev => (prev + 1) % heroSlides.length)}
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: '1px solid #e2e8f0', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', fontSize: '22px', fontWeight: 'bold', color: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>›</button>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '28px' }}>
            {heroSlides.map((_, i) => (
              <button key={i} onClick={() => setHeroSlideIndex(i)} style={{
                width: heroSlideIndex === i ? '28px' : '10px', height: '10px', borderRadius: '5px',
                background: heroSlideIndex === i ? '#1e3a5f' : '#d1d5db', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0,
              }} />
            ))}
          </div>
          <div style={{ marginTop: '32px', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', borderRadius: '16px', padding: '24px 32px', maxWidth: '620px', width: '100%', textAlign: 'center', boxShadow: '0 8px 32px rgba(5,150,105,0.3)', marginLeft: 'auto', marginRight: 'auto' }}>
            <p style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '6px' }}>🙏 Membro da Igreja?</p>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.9)', marginBottom: '16px' }}>Ore junto, cresça diariamente, encontre comunidade</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/daily-devotional" style={{ background: 'white', color: '#059669', padding: '10px 24px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '15px' }}>📖 Devocional Diário</Link>
              <Link href="/community" style={{ background: 'white', color: '#059669', padding: '10px 24px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '15px' }}>🙏 Comunidade de Oração</Link>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '48px 0', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="page-container" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '28px' }}>Confiado por pastores e líderes de igrejas</p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '60px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#1e3a5f', lineHeight: '1.2' }}>500+</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Gerações de IA<br />Entregues</div>
            </div>
            <div style={{ width: '1px', height: '48px', background: '#e2e8f0' }} />
            <div style={{ textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#1e3a5f', lineHeight: '1.2' }}>11</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Pastores<br />Registrados</div>
            </div>
            <div style={{ width: '1px', height: '48px', background: '#e2e8f0' }} />
            <div style={{ textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#1e3a5f', lineHeight: '1.2' }}>11</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Ferramentas<br />Disponíveis</div>
            </div>
            <div style={{ width: '1px', height: '48px', background: '#e2e8f0' }} />
            <div style={{ textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#1e3a5f', lineHeight: '1.2' }}>69%</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Usam o Gerador<br />de Devocionais</div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '100px 0', background: 'white' }}>
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '16px' }}>Tudo que Você Precisa para Servir Melhor</h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>Ferramentas de IA projetadas para pastores e congregações</p>
            <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '12px', padding: '4px', marginTop: '24px', gap: '4px' }}>
              <button onClick={() => setFeatureTab('pastor')} style={{ padding: '10px 28px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600', transition: 'all 0.2s', background: featureTab === 'pastor' ? '#1e3a5f' : 'transparent', color: featureTab === 'pastor' ? 'white' : '#64748b' }}>⛪ Pastor</button>
              <button onClick={() => setFeatureTab('congregant')} style={{ padding: '10px 28px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600', transition: 'all 0.2s', background: featureTab === 'congregant' ? '#10b981' : 'transparent', color: featureTab === 'congregant' ? 'white' : '#64748b' }}>🙏 Membro</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {allFeatures.filter(f => f.forRole === featureTab || f.forRole === 'both').map((f, i) => (
              <Link key={i} href={f.href} style={{ textDecoration: 'none' }}>
                <div className="dashboard-card" style={{ textAlign: 'left', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                  <div style={{ width: '48px', height: '48px', background: f.color + '15', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '24px' }}>{f.icon}</div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '14px' }}>{f.desc}</p>
                  <div style={{ color: f.color, fontWeight: '600', fontSize: '14px', marginTop: '12px' }}>Saiba Mais →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" style={{ padding: '100px 0', background: '#f8fafc' }}>
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '16px' }}>Preços Simples e Transparentes</h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>Comece grátis, atualize quando estiver pronto</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <div className="pricing-card">
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>Grátis</h3>
              <div style={{ fontSize: '44px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>$0<span style={{ fontSize: '16px', fontWeight: 'normal' }}>/mês</span></div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>Teste grátis por 7 dias, depois 20 gerações de IA/mês</p>
              <Link href="/register" className="btn-primary" style={{ width: '100%' }}>Comece Grátis</Link>
            </div>
            <div className="pricing-card">
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>Starter</h3>
              <div style={{ fontSize: '44px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>{billingCycle === 'annual' ? '$190' : '$19'}<span style={{ fontSize: '16px', fontWeight: 'normal' }}>{billingCycle === 'annual' ? '/ano' : '/mês'}</span></div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>Para pastores individuais</p>
              <Link href="/register" className="btn-primary" style={{ width: '100%' }}>Comece Teste Grátis</Link>
            </div>
            <div className="pricing-card">
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>Pro</h3>
              <div style={{ fontSize: '44px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>{billingCycle === 'annual' ? '$390' : '$39'}<span style={{ fontSize: '16px', fontWeight: 'normal' }}>{billingCycle === 'annual' ? '/ano' : '/mês'}</span></div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>IA que aprende seu estilo + time</p>
              <Link href="/register" className="btn-primary" style={{ width: '100%' }}>Comece Teste Grátis</Link>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ background: '#1e3a5f', color: 'white', padding: '48px 0' }}>
        <div className="page-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '32px', marginBottom: '32px' }}>
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>ShepherdAI</h4>
              <p style={{ fontSize: '14px', color: '#94a3b8' }}>Gestão eclesial com IA para pastores e congregações.</p>
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Recursos</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Funcionalidades</a>
                <Link href="/blog" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Blog</Link>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Empresa</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link href="/about" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Sobre</Link>
                <Link href="/contact" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Contato</Link>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Legal</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link href="/privacy" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Privacidade</Link>
                <Link href="/terms" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Termos</Link>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #334155', paddingTop: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
            © 2026 ShepherdAI. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
