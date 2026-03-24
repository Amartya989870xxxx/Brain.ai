import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Standard client for frontend use
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Note: DO NOT export a service role client here if it will be imported in client components.
