// src/app/api/blog/[slug]/route.ts
// GET /api/blog/[slug] — Get a single published blog post by slug
import { NextRequest, NextResponse } from 'next/server';
import { getPostBySlug } from '@/lib/blog';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const language = searchParams.get('language') || undefined;

    const post = await getPostBySlug(slug, language as 'en' | 'pt-br' | undefined);
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('GET /api/blog/[slug] error:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}
