export const listEntries = async (supabase) => {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('date', { ascending: false })

  if (error) throw error
  return data
}

export const createEntries = async (supabase, entries) => {
  const { data, error } = await supabase
    .from('entries')
    .insert(entries)
    .select()

  if (error) throw error
  return data
}

export const updateEntry = async (supabase, id, updates) => {
  const { data, error } = await supabase
    .from('entries')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data?.[0] ?? null
}

export const deleteEntry = async (supabase, id) => {
  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}
