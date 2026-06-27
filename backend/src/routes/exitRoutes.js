import express from 'express'
import { addExits, listExitRecords, patchExit, removeExit } from '../controllers/exitController.js'

const router = express.Router()

router.get('/', listExitRecords)
router.post('/', addExits)
router.put('/:id', patchExit)
router.delete('/:id', removeExit)

export default router
