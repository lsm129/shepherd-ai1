import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hsunvuixqesjcoohbrmp.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdW52dWl4cWVzamNvb2hicm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwNTc3NCwiZXhwIjoyMDk1NzgxNzc0fQ.jF0_6lVYm5DN88s9A6sQ6jqepy_tjHgXHUEjia1l3r8';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Check if partners table exists
const { data, error } = await supabase.from('partners').select('id').limit(1);
if (error && error.code === '42P01') {
  console.log('partners table does not exist - needs to be created via SQL editor');
} else if (error) {
  console.log('partners table check error:', error.message);
} else {
  console.log('partners table already exists');
}
