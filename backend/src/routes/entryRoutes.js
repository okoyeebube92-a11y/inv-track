import express from 'express'
import { addEntries, listEntryRecords, patchEntry, removeEntry } from '../controllers/entryController.js'

const router = express.Router()

router.get('/ping', (_req, res) => {
  res.json({ ok: true })
})

router.get('/', listEntryRecords)
router.post('/', addEntries)
router.put('/:id', patchEntry)
router.delete('/:id', removeEntry)

export default router