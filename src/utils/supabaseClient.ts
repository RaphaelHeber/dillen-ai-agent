import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Your project\'s URL and Key are required to create a Supabase client! Check your Supabase project\'s API settings to find these values.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);