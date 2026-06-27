// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function getSupabaseBrowserConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

  return { url, anonKey };
}

export function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseBrowserConfig();
  return Boolean(url && anonKey);
}

export function createClient() {
  const { url, anonKey } = getSupabaseBrowserConfig();

  if (!url || !anonKey) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then restart the frontend.');
  }

  return createBrowserClient(url, anonKey);
}
