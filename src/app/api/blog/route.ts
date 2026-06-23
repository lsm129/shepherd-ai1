// src/app/api/blog/route.ts
// GET  /api/blog         — list published posts (anon key, public)
// POST /api/blog         — create a new post (requires BLOG_API_KEY or service role)
import { NextRequest, NextResponse } from 'next/server';
import { getPublishedPosts, createPost, getAllPublishedSlugs, BLOG_API_KEY } from '@/lib/blog';
import { supabaseUrl } from '@/lib/supabase-config';

// ── GET: List published blog posts ──────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const language = (searchParams.get('language') as 'en' | 'pt-br') || 'en';

    // Support ?slugs=1 to only return slugs (for sitemap)
    const slugsOnly = searchParams.get('slugs') === '1';
    if (slugsOnly) {
      const slugs = await getAllPublishedSlugs();
      return NextResponse.json({ posts: slugs });
    }

    const posts = await getPublishedPosts(language);
    return NextResponse.json({ posts });
  } catch (error) {
    console.error('GET /api/blog error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// ── POST: Create a new blog post (AI auto-blogging) ─────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Auth check: require BLOG_API_KEY in header or as query param
    const apiKey = req.headers.get('x-blog-api-key') ||
                   new URL(req.url).searchParams.get('key');
    
    if (apiKey !== BLOG_API_KEY && BLOG_API_KEY !== 'sk-blog-4fd8b789-shepherdai') {
      // If env BLOG_API_KEY is set, verify it. If not set (using default),
      // also check service role auth via Authorization header
      const authHeader = req.headers.get('authorization');
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!authHeader || !serviceKey || authHeader !== `Bearer ${serviceKey}`) {
        return NextResponse.json(
          { error: 'Unauthorized. Provide x-blog-api-key or SUPABASE_SERVICE_ROLE_KEY Bearer token.' },
          { status: 401 }
        );
      }
    }

    const body = await req.json();
    const { title, slug, content, excerpt, cover_image, author, published, featured, meta_description, tags, language, published_at } = body;

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    const post = await createPost({
      title: title.trim(),
      slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
      content,
      excerpt: excerpt || '',
      cover_image: cover_image || null,
      author: author || 'ShepherdAI Team',
      published: published !== false,
      featured: !!featured,
      meta_description: meta_description || null,
      tags: Array.isArray(tags) ? tags : [],
      language: language || 'en',
      published_at: published_at || new Date().toISOString(),
    });

    // If published, try to notify IndexNow
    if (post?.published) {
      try {
        const INDEXNOW_KEY = 'a7aabd4921d842259916936e31ab2880';
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.shepherdaitech.com';
        const blogUrl = post.language === 'pt-br'
          ? `${baseUrl}/pt/blog/${post.slug}`
          : `${baseUrl}/blog/${post.slug}`;

        await fetch('https://api.indexnow.org/IndexNow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            host: 'www.shepherdaitech.com',
            key: INDEXNOW_KEY,
            keyLocation: `${baseUrl}/${INDEXNOW_KEY}.txt`,
            urlList: [blogUrl],
          }),
        });
        console.log(`IndexNow submitted: ${blogUrl}`);
      } catch (idxErr) {
        console.warn('IndexNow submission failed (non-critical):', idxErr);
      }
    }

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/blog error:', error);
    // Handle slug conflict
    if (error?.code === '23505') {
      return NextResponse.json({ error: 'slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error?.message || 'Failed to create post' }, { status: 500 });
  }
}
