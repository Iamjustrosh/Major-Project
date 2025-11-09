import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lnzqjywsxnkrarkwvdgk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuenFqeXdzeG5rcmFya3d2ZGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDk5NzQsImV4cCI6MjA3NzkyNTk3NH0.Tv3G7WVbnUTMGYsE9Okd6vrHFUx2r1AuOI8gUOeX000';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);