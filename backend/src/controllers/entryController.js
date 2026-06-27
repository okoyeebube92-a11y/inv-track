import { createEntries, deleteEntry, listEntries, updateEntry } from '../services/entryService.js'

const sanitizeUpdates = (updates) => {
  const { id, user_id, created_at, ...safeUpdates } = updates || {}
  return safeUpdates
}

export const listEntryRecords = async (req, res) => {
  try {
    const data = await listEntries(req.supabase)
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const addEntries = async (req, res) => {
  try {
    const entries = req.body

    if (!Array.isArray(entries)) {
      return res.status(400).json({
        success: false,
        message: 'Entries must be an array'
      })
    }

    const rows = entries.map(({ id, user_id, created_at, ...entry }) => ({
      ...entry,
      user_id: req.user.id,
    }))
    const savedEntries = await createEntries(req.supabase, rows)

    res.status(201).json({
      success: true,
      data: savedEntries
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const patchEntry = async (req, res) => {
  try {
    const updated = await updateEntry(req.supabase, req.params.id, sanitizeUpdates(req.body))
    res.json({ success: true, data: updated })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const removeEntry = async (req, res) => {
  try {
    await deleteEntry(req.supabase, req.params.id)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
