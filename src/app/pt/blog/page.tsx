// src/app/pt/blog/page.tsx — Blog listing in Portuguese (reads from Supabase)
import Link from 'next/link';
import BlogNav from '@/components/BlogNav';
import { getPublishedPosts } from '@/lib/blog';

export const metadata = {
  title: { absolute: 'Blog ShepherdAI | Dicas de Gestão de Igrejas com IA' },
  description: 'Dicas práticas, guias e insights para pastores que usam IA para otimizar a gestão da igreja.',
  openGraph: {
    title: 'Blog ShepherdAI - Dicas de Gestão de Igrejas com IA',
    description: 'Dicas práticas para pastores usarem IA e economizar tempo.',
    url: 'https://www.shepherdaitech.com/pt/blog',
    locale: 'pt_BR',
  },
};

export const dynamic = 'force-dynamic';

export default async function PtBlogPage() {
  const posts = await getPublishedPosts('pt-br');

  if (posts.length === 0) {
    return (
      <>
        <BlogNav />
        <div className="min-h-screen bg-gray-50" style={{ paddingTop: '72px' }}>
          <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h1 className="text-4xl font-bold mb-4">Blog ShepherdAI</h1>
              <p className="text-xl text-blue-100">
                Dicas práticas, guias e insights para pastores que querem economizar tempo e servir melhor com IA.
              </p>
            </div>
          </div>
          <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">
            <p className="text-lg">Nenhum artigo ainda. Volte em breve!</p>
            <Link href="/blog" className="text-blue-600 hover:underline mt-4 inline-block">
              Ver blog em inglês &rarr;
            </Link>
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
            <h1 className="text-4xl font-bold mb-4">Blog ShepherdAI</h1>
            <p className="text-xl text-blue-100">
              Dicas práticas, guias e insights para pastores que querem economizar tempo e servir melhor com IA.
            </p>
            <div className="mt-4">
              <Link href="/blog" className="text-blue-200 hover:text-white text-sm underline">
                View English Blog &rarr;
              </Link>
            </div>
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
                      {post.published_at ? new Date(post.published_at).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                    </span>
                    {post.featured && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">Destaque</span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    <Link href={`/pt/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
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
                    <Link href={`/pt/blog/${post.slug}`} className="text-blue-600 font-medium hover:text-blue-800 transition-colors">
                      Ler mais &rarr;
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 bg-blue-50 rounded-xl p-8 text-center border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Pronto para Automatizar sua Igreja?</h3>
            <p className="text-gray-600 mb-6">Junte-se a igrejas no mundo todo usando IA para economizar horas toda semana.</p>
            <a href="https://www.shepherdaitech.com/register" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Teste ShepherdAI Grátis
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
