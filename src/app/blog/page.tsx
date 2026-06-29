// src/app/blog/page.tsx — Blog list page (English, reads from Supabase)
import Link from 'next/link';
import BlogNav from '@/components/BlogNav';
import { getPublishedPosts } from '@/lib/blog';

export const metadata = {
  title: { absolute: 'ShepherdAI Blog | AI-Powered Church Management Tips & Guides' },
  description: 'Practical tips, guides, and insights for pastors using AI to streamline church management. Learn how to automate newsletters, visitor follow-up, and more.',
  openGraph: {
    title: 'ShepherdAI Blog - AI Church Management Tips & Guides',
    description: 'Practical tips and guides for pastors using AI to save time and serve better.',
    url: 'https://www.shepherdaitech.com/blog',
  },
};

export const dynamic = 'force-dynamic'; // Always fetch fresh data

export default async function BlogPage() {
  const posts = await getPublishedPosts('en');

  if (posts.length === 0) {
    return (
      <>
        <BlogNav />
        <div className="min-h-screen bg-gray-50" style={{ paddingTop: '72px' }}>
          <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h1 className="text-4xl font-bold mb-4">ShepherdAI Blog</h1>
              <p className="text-xl text-blue-100">
                Practical tips, guides, and insights for pastors who want to save time and serve better with AI.
              </p>
            </div>
          </div>
          <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">
            <p className="text-lg">No blog posts yet. Check back soon!</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <BlogNav />
      <div className="min-h-screen bg-gray-50" style={{ paddingTop: '72px' }}>
        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">ShepherdAI Blog</h1>
            <p className="text-xl text-blue-100">
              Practical tips, guides, and insights for pastors who want to save time and serve better with AI.
            </p>
          </div>
        </div>

        {/* Posts */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="space-y-8">
            {posts.map(post => (
              <article key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm text-blue-600 font-medium">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                    </span>
                    {post.featured && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">Featured</span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                      {(post.tags || []).slice(0, 3).map(tag => (
                        <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">#{tag}</span>
                      ))}
                    </div>
                    <Link href={`/blog/${post.slug}`} className="text-blue-600 font-medium hover:text-blue-800 transition-colors">
                      Read more &rarr;
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* 🌎 PT Blog Banner */}
          <div className="mt-16 bg-emerald-50 rounded-xl p-8 text-center border border-emerald-100">
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌎</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">🇧🇷 Leia nossos artigos em Português!</h3>
            <p className="text-gray-600 mb-4">Conteúdo exclusivo para igrejas brasileiras — dicas de gestão, liderança pastoral, e muito mais.</p>
            <a href="https://www.shepherdaitech.com/pt/blog" className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
              🇧🇷 Blog em Português &rarr;
            </a>
            <div className="mt-3 text-sm text-gray-500">
              Junte-se a centenas de pastores brasileiros usando IA na sua igreja!
            </div>
          </div>
          {/* CTA */}
          <div className="mt-16 bg-blue-50 rounded-xl p-8 text-center border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Automate Your Church?</h3>
            <p className="text-gray-600 mb-6">Join churches worldwide using AI to save hours every week.</p>
            <a href="https://www.shepherdaitech.com/register" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Try ShepherdAI Free
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
