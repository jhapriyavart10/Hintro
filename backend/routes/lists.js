import express from 'express'
import prisma from '../db/prisma.js'
import { io } from '../server.js'

const router = express.Router()

// Create list
router.post('/', async (req, res) => {
  try {
    const { title, boardId, position } = req.body

    const list = await prisma.list.create({
      data: {
        title,
        boardId,
        position: position ?? 0,
      },
      include: {
        tasks: true,
      },
    })

    // Emit to all connected clients
    io.emit('list:created', { boardId, list })

    res.status(201).json(list)
  } catch (error) {
    console.error('Error creating list:', error)
    res.status(500).json({ error: 'Failed to create list' })
  }
})

// Update list
router.patch('/:id', async (req, res) => {
  try {
    const { title, position } = req.body

    const list = await prisma.list.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(position !== undefined && { position }),
      },
    })

    // Emit to all connected clients
    io.emit('list:updated', list)

    res.json(list)
  } catch (error) {
    console.error('Error updating list:', error)
    res.status(500).json({ error: 'Failed to update list' })
  }
})

// Delete list
router.delete('/:id', async (req, res) => {
  try {
    const list = await prisma.list.findUnique({
      where: { id: req.params.id },
      include: { tasks: true },
    })

    if (!list) {
      return res.status(404).json({ error: 'List not found' })
    }

    if (list.tasks.length > 0) {
      return res.status(400).json({ error: 'Cannot delete list with tasks' })
    }

    await prisma.list.delete({
      where: { id: req.params.id },
    })

    // Emit to all connected clients
    io.emit('list:deleted', { boardId: list.boardId, listId: req.params.id })

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting list:', error)
    res.status(500).json({ error: 'Failed to delete list' })
  }
})

export default router
