import { createExits, deleteExit, listExits, updateExit } from '../services/exitService.js'

const sanitizeUpdates = (updates) => {
  const { id, user_id, created_at, ...safeUpdates } = updates || {}
  return safeUpdates
}

export const listExitRecords = async (req, res) => {
  try {
    const data = await listExits(req.supabase)
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const addExits = async (req, res) => {
  try {
    const exits = req.body

    if (!Array.isArray(exits)) {
      return res.status(400).json({ success: false, message: 'Exits must be an array' })
    }

    const rows = exits.map(({ id, user_id, created_at, ...exit }) => ({
      ...exit,
      user_id: req.user.id,
    }))
    const saved = await createExits(req.supabase, rows)
    res.status(201).json({ success: true, data: saved })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const patchExit = async (req, res) => {
  try {
    const updated = await updateExit(req.supabase, req.params.id, sanitizeUpdates(req.body))
    res.json({ success: true, data: updated })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const removeExit = async (req, res) => {
  try {
    await deleteExit(req.supabase, req.params.id)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
