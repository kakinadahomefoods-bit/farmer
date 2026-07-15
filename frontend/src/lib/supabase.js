import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hnilmlhyqcgsbfbguuuz.supabase.co'
const supabaseAnonKey = 'sb_publishable_iznuqvw0qAnFc4tbwGZahQ_DLwYr4O2'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
