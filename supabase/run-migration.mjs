#!/usr/bin/env node
// supabase/run-migration.mjs
// Run the SQL migration via Supabase Dashboard API
// Usage: node supabase/run-migration.mjs
//
// Requires SUPABASE_ACCESS_TOKEN env var (generate at https://supabase.com/dashboard/account/tokens)
// If you don't have one, just copy-paste supabase/blog-migration.sql into:
//   https://supabase.com/dashboard/project/hsunvuixqesjcoohbrmp/sql/new

import fs from 'fs';
import path from 'path';

const REF = 'hsunvuixqesjcoohbrmp';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.log('⚠ No SUPABASE_ACCESS_TOKEN found.');
  console.log('');
  console.log('Option 1: Set the token and re-run:');
  console.log('  export SUPABASE_ACCESS_TOKEN=sbp_xxxx');
  console.log('  node supabase/run-migration.mjs');
  console.log('');
  console.log('Option 2: Open Supabase SQL Editor and paste the SQL:');
  console.log('  https://supabase.com/dashboard/project/hsunvuixqesjcoohbrmp/sql/new');
  console.log('  Then copy-paste everything from supabase/blog-migration.sql');
  console.log('');
  process.exit(0);
}

const sql = fs.readFileSync(path.join(process.cwd(), 'supabase/blog-migration.sql'), 'utf8');

console.log('Running migration...');
const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/query`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
  },
  body: JSON.stringify({ query: sql }),
});

const result = await res.text();
console.log('Status:', res.status);
console.log('Response:', result.substring(0, 1000));
