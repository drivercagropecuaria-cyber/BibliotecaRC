import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and anonymous key are required');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions for common operations
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Supabase connection error:', err);
    return { success: false, error: err };
  }
}
