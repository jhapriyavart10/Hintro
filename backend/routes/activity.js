import express from 'express'
import prisma from '../db/prisma.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Get Activity Logs (Paginated)
router.get('/:boardId', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (page - 1) * limit
    const boardId = req.params.boardId

    const logs = await prisma.activityLog.findMany({
      where: { boardId },
      include: { user: true, task: true },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(skip)
    })

    const total = await prisma.activityLog.count({ where: { boardId } })

    res.json({
      data: logs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch activity' })
  }
})

export default router