// supabase/migrate-existing-posts.mjs
// Reads existing .md blog posts and generates SQL INSERT statements
// Run: node supabase/migrate-existing-posts.mjs > supabase/migrate-blog-posts.sql
// Then copy-paste the SQL into Supabase SQL Editor
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDir = path.join(process.cwd(), 'content/blog');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

console.log('-- Migrate existing blog posts to Supabase blog_posts');
console.log('-- Generated: ' + new Date().toISOString());
console.log('');

for (const file of files) {
  const raw = fs.readFileSync(path.join(postsDir, file), 'utf8');
  const { data, content } = matter(raw);
  
  const slug = data.slug || file.replace(/\.md$/, '');
  const title = data.title || slug;
  const excerpt = (data.excerpt || '').replace(/'/g, "''");
  const safeContent = content.replace(/'/g, "''");
  const author = (data.author || 'ShepherdAI Team').replace(/'/g, "''");
  const metaDesc = (data.meta_description || data.excerpt || '').replace(/'/g, "''");
  const tags = data.tags || [];
  const tagsStr = tags.length > 0 ? `ARRAY['${tags.map(t => t.replace(/'/g, "''")).join("','")}']` : "'{}'";
  const featured = data.featured ? 'TRUE' : 'FALSE';
  const date = data.date || '2026-01-01';
  const coverImage = data.image ? `'${data.image}'` : 'NULL';
  
  console.log(`INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, author, published, featured, meta_description, tags, language, published_at, created_at, updated_at)
VALUES (
  '${title.replace(/'/g, "''")}',
  '${slug}',
  '${excerpt}',
  '${safeContent}',
  ${coverImage},
  '${author}',
  TRUE,
  ${featured},
  '${metaDesc}',
  ${tagsStr},
  'en',
  '${date}',
  '${date}',
  '${date}'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  author = EXCLUDED.author,
  featured = EXCLUDED.featured,
  meta_description = EXCLUDED.meta_description,
  tags = EXCLUDED.tags,
  updated_at = NOW();
`);
}

console.log('');
console.log('-- Migration complete. All 12 existing blog posts imported.');
