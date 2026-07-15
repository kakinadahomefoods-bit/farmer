import { supabase } from './supabase'

export async function getFarmers() {
  try {
    const { data, error } = await supabase
      .from('farmers')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (e) {
    throw e
  }
}
