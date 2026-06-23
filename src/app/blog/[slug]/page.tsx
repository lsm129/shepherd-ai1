// src/app/blog/[slug]/page.tsx — Single blog post (reads from Supabase)
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlogNav from '@/components/BlogNav';
import { getPostBySlug, getPublishedPosts } from '@/lib/blog';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Post Not Found' };
  return {
    title: `${post.title} - ShepherdAI Blog`,
    description: post.meta_description || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://www.shepherdaitech.com/blog/${slug}`,
      type: 'article' as const,
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

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  
  if (!post) notFound();

  const otherPosts = (await getPublishedPosts('en'))
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
    url: `https://www.shepherdaitech.com/blog/${slug}`,
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
      '@id': `https://www.shepherdaitech.com/blog/${slug}`,
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
        name: 'Home',
        item: 'https://www.shepherdaitech.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://www.shepherdaitech.com/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
      },
    ],
  };

  const dateStr = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
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
          <Link href="/blog" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
            &larr; Back to Blog
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">Try ShepherdAI Free — 20 Generations/Month</h3>
            <p className="text-gray-600 mb-2">Generate devotionals, sermon outlines, visitor follow-up emails, and more — all personalized to your church.</p>
            <p className="text-sm text-gray-500 mb-4">&check; No credit card required &nbsp; &check; 20 free AI generations every month &nbsp; &check; Setup in 60 seconds</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a href="https://www.shepherdaitech.com/register" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Get Started Free &rarr;
              </a>
              <a href="https://www.shepherdaitech.com/daily-devotional" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-medium border border-blue-200 hover:bg-blue-50 transition-colors">
                Try Devotional Generator
              </a>
            </div>
          </div>

          {otherPosts.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">More from the Blog</h3>
              <div className="grid gap-6 md:grid-cols-2">
                {otherPosts.map(p => (
                  <Link key={p.id} href={`/blog/${p.slug}`} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <span className="text-sm text-blue-600 font-medium">
                      {p.published_at ? new Date(p.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
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
