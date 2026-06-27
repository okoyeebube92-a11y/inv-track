import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const publishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !publishableKey) {
  throw new Error('Missing Supabase env vars. Set SUPABASE_URL and a publishable/anon key in backend/.env.')
}

export const createUserSupabaseClient = (accessToken) => {
  return createClient(supabaseUrl, publishableKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  })
}

export const supabaseAdmin = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey)
  : null
