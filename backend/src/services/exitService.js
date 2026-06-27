export const listExits = async (supabase) => {
  const { data, error } = await supabase
    .from('exits')
    .select('*')
    .order('date', { ascending: false })

  if (error) throw error
  return data
}

export const createExits = async (supabase, exits) => {
  const { data, error } = await supabase
    .from('exits')
    .insert(exits)
    .select()

  if (error) throw error
  return data
}

export const updateExit = async (supabase, id, updates) => {
  const { data, error } = await supabase
    .from('exits')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data?.[0] ?? null
}

export const deleteExit = async (supabase, id) => {
  const { error } = await supabase
    .from('exits')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}
