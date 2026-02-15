import express from 'express'
import prisma from '../db/prisma.js'
import { io } from '../server.js'

const router = express.Router()

// Get all boards
router.get('/', async (req, res) => {
  try {
    const boards = await prisma.board.findMany({
      include: {
        lists: {
          include: {
            tasks: {
              orderBy: { position: 'asc' },
            },
          },
          orderBy: { position: 'asc' },
        },
        members: {
          include: {
            user: true,
          },
        },
      },
    })
    res.json(boards)
  } catch (error) {
    console.error('Error fetching boards:', error)
    res.status(500).json({ error: 'Failed to fetch boards' })
  }
})

// Get single board
router.get('/:id', async (req, res) => {
  try {
    const board = await prisma.board.findUnique({
      where: { id: req.params.id },
      include: {
        lists: {
          include: {
            tasks: {
              include: {
                assignee: true,
                labels: {
                  include: {
                    label: true,
                  },
                },
              },
              orderBy: { position: 'asc' },
            },
          },
          orderBy: { position: 'asc' },
        },
        members: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!board) {
      return res.status(404).json({ error: 'Board not found' })
    }

    res.json(board)
  } catch (error) {
    console.error('Error fetching board:', error)
    res.status(500).json({ error: 'Failed to fetch board' })
  }
})

// Create board
router.post('/', async (req, res) => {
  try {
    const { name, description, color } = req.body

    const board = await prisma.board.create({
      data: {
        name,
        description,
        color: color || 'bg-blue-500',
      },
      include: {
        lists: true,
      },
    })

    // Emit to all connected clients
    io.emit('board:created', board)

    res.status(201).json(board)
  } catch (error) {
    console.error('Error creating board:', error)
    res.status(500).json({ error: 'Failed to create board' })
  }
})

// Update board
router.patch('/:id', async (req, res) => {
  try {
    const { name, description, color } = req.body

    const board = await prisma.board.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
      },
    })

    // Emit to all connected clients
    io.emit('board:updated', board)

    res.json(board)
  } catch (error) {
    console.error('Error updating board:', error)
    res.status(500).json({ error: 'Failed to update board' })
  }
})

// Delete board
router.delete('/:id', async (req, res) => {
  try {
    await prisma.board.delete({
      where: { id: req.params.id },
    })

    // Emit to all connected clients
    io.emit('board:deleted', { id: req.params.id })

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting board:', error)
    res.status(500).json({ error: 'Failed to delete board' })
  }
})

export default router
