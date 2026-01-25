import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anon) {
  console.warn(
    "Supabase environment variables are missing. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
  )
}

export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anon || "placeholder",
  {
    auth: { persistSession: true, detectSessionInUrl: true },
  }
)

