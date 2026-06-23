// src/app/pt/blog/[slug]/page.tsx — Single blog post in Portuguese
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlogNav from '@/components/BlogNav';
import { getPostBySlug, getPublishedPosts } from '@/lib/blog';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug, 'pt-br');
  if (!post) return { title: 'Artigo não encontrado' };
  return {
    title: `${post.title} - Blog ShepherdAI`,
    description: post.meta_description || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://www.shepherdaitech.com/pt/blog/${slug}`,
      type: 'article' as const,
      locale: 'pt_BR',
      images: [
        {
          url: post.cover_image || 'https://www.shepherdaitech.com/og-image.png',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: post.title,
      description: post.excerpt,
      images: [post.cover_image || 'https://www.shepherdaitech.com/og-image.png'],
    },
  };
}

export default async function PtBlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug, 'pt-br');
  
  if (!post) notFound();

  const otherPosts = (await getPublishedPosts('pt-br'))
    .filter(p => p.slug !== slug)
    .slice(0, 2);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta_description || post.excerpt,
    image: post.cover_image || 'https://www.shepherdaitech.com/og-image.png',
    author: { '@type': 'Person', name: post.author },
    datePublished: post.published_at || post.created_at,
    url: `https://www.shepherdaitech.com/pt/blog/${slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'ShepherdAI',
      url: 'https://www.shepherdaitech.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.shepherdaitech.com/og-image.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.shepherdaitech.com/pt/blog/${slug}`,
    },
    keywords: (post.tags || []).join(', '),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Início',
        item: 'https://www.shepherdaitech.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://www.shepherdaitech.com/pt/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
      },
    ],
  };

  const dateStr = post.published_at
    ? new Date(post.published_at).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <BlogNav />
      <div className="min-h-screen bg-gray-50" style={{ paddingTop: '72px' }}>
        <div className="max-w-3xl mx-auto px-4 pt-8">
          <Link href="/pt/blog" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
            &larr; Voltar ao Blog
          </Link>
        </div>

        <article className="max-w-3xl mx-auto px-4 py-8">
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-blue-600 font-medium">{dateStr}</span>
              <span className="text-sm text-gray-400">|</span>
              <span className="text-sm text-gray-500">{post.author}</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h1>
            <div className="flex gap-2 flex-wrap">
              {(post.tags || []).map((tag: string) => (
                <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">#{tag}</span>
              ))}
            </div>
          </header>

          <div 
            className="prose prose-lg prose-blue max-w-none bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-12 bg-blue-50 rounded-xl p-8 text-center border border-blue-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Teste ShepherdAI Grátis — 20 Gerações/Mês</h3>
            <p className="text-gray-600 mb-2">Gere devocionais, esboços de sermões, e-mails de acompanhamento e muito mais — tudo personalizado para sua igreja.</p>
            <p className="text-sm text-gray-500 mb-4">&check; Sem cartão de crédito &nbsp; &check; 20 gerações gratuitas por mês &nbsp; &check; Configuração em 60 segundos</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a href="https://www.shepherdaitech.com/register" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Começar Grátis &rarr;
              </a>
              <a href="https://www.shepherdaitech.com/daily-devotional" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-medium border border-blue-200 hover:bg-blue-50 transition-colors">
                Gerar Devocional
              </a>
            </div>
          </div>

          {otherPosts.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Mais do Blog</h3>
              <div className="grid gap-6 md:grid-cols-2">
                {otherPosts.map(p => (
                  <Link key={p.id} href={`/pt/blog/${p.slug}`} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <span className="text-sm text-blue-600 font-medium">
                      {p.published_at ? new Date(p.published_at).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                    </span>
                    <h4 className="text-lg font-bold text-gray-900 mt-2 mb-2">{p.title}</h4>
                    <p className="text-gray-600 text-sm line-clamp-2">{p.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </>
  );
}
