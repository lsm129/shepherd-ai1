import { NextRequest, NextResponse } from 'next/server';

const DATABASE_URL = process.env.DATABASE_URL || '';

export async function POST(request: NextRequest) {
  try {
    const { Client } = require('pg');
    const client = new Client(DATABASE_URL);
    await client.connect();
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS sermon_preps (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id),
        title TEXT,
        scripture TEXT,
        theme TEXT,
        tradition TEXT,
        sermon_data JSONB,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    
    await client.query(`ALTER TABLE sermon_preps ENABLE ROW LEVEL SECURITY;`);
    
    await client.query(`
      DO $$ BEGIN
        CREATE POLICY sermon_preps_user_policy ON sermon_preps FOR ALL USING (user_id = auth.uid());
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await client.end();
    return NextResponse.json({ success: true, message: 'sermon_preps table created' });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
