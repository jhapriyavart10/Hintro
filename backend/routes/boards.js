import express from 'express'
import prisma from '../db/prisma.js'
import { io } from '../server.js'
import { authenticateToken } from '../middleware/auth.js' // Import middleware

const router = express.Router()

// Get ALL boards for the logged-in user (Protected)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const boards = await prisma.board.findMany({
      where: {
        members: {
          some: {
            userId: req.user.userId // Only fetch boards where user is a member
          }
        }
      },
      include: {
        members: { include: { user: true } },
        lists: { include: { tasks: true } }
      }
    })
    res.json(boards)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch boards' })
  }
})

// Create Board (Protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, color } = req.body
    const userId = req.user.userId

    const board = await prisma.board.create({
      data: {
        name,
        description,
        color: color || 'bg-blue-500',
        members: {
          create: {
            userId: userId, // Link to the creator
            role: 'owner'
          }
        },
        // Create default lists
        lists: {
          createMany: {
            data: [
              { title: 'To Do', position: 0 },
              { title: 'In Progress', position: 1 },
              { title: 'Done', position: 2 }
            ]
          }
        }
      },
      include: {
        members: true,
        lists: true
      }
    })

    // Emit to creator (optional, or just return response)
    io.emit('board:created', board)

    res.status(201).json(board)
  } catch (error) {
    console.error('Error creating board:', error)
    res.status(500).json({ error: 'Failed to create board' })
  }
})

// Get Single Board (Protected)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const board = await prisma.board.findFirst({
      where: {
        id: req.params.id,
        members: { some: { userId: req.user.userId } } // Security check
      },
      include: {
        lists: {
          include: {
            tasks: {
              include: { assignee: true, labels: { include: { label: true } } },
              orderBy: { position: 'asc' }
            }
          },
          orderBy: { position: 'asc' }
        },
        members: { include: { user: true } }
      }
    })

    if (!board) return res.status(404).json({ error: 'Board not found or access denied' })
    res.json(board)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch board' })
  }
})

export default router