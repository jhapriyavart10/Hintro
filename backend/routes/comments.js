import express from 'express'
import prisma from '../db/prisma.js'
import { io } from '../server.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Get comments for a task
router.get('/:taskId', authenticateToken, async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { taskId: req.params.taskId },
      include: { user: true },
      orderBy: { createdAt: 'asc' }
    })
    res.json(comments)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' })
  }
})

// Add a comment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content, taskId } = req.body
    const userId = req.user.userId

    const comment = await prisma.comment.create({
      data: { content, taskId, userId },
      include: { user: true }
    })

    // Log Activity
    const task = await prisma.task.findUnique({ 
        where: { id: taskId },
        include: { list: true } 
    })
    
    await prisma.activityLog.create({
      data: {
        action: 'commented',
        entityType: 'TASK',
        entityId: taskId,
        details: `Commented on "${task.title}"`,
        userId: userId,
        boardId: task.list.boardId
      }
    })

    io.emit('comment:created', comment)
    res.status(201).json(comment)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to post comment' })
  }
})

export default router