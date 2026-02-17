import express from 'express'
import prisma from '../db/prisma.js'
import { io } from '../server.js'

const router = express.Router()

// Create task
router.post('/', async (req, res) => {
  try {
    const { title, description, listId, position, priority, assigneeId, userId } = req.body // passed from frontend

    const task = await prisma.task.create({
      data: {
        title, description, listId, position: position ?? 0, priority: priority || 'medium',
        ...(assigneeId && { assigneeId }),
      },
      include: { assignee: true, labels: true }
    })

    // LOG ACTIVITY
    await prisma.activityLog.create({
      data: {
        action: 'created',
        entityType: 'TASK',
        entityId: task.id,
        details: `Created task "${title}"`,
        userId: userId || task.assigneeId, // Fallback for demo
        boardId: (await prisma.list.findUnique({where: {id: listId}})).boardId
      }
    })

    io.emit('task:created', { listId, task })
    res.status(201).json(task)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create task' })
  }
})

// Move task (Drag and Drop)
router.patch('/:id/move', async (req, res) => {
  try {
    const { listId, position, fromListId, userId } = req.body

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { listId, position },
      include: { assignee: true }
    })

    // LOG ACTIVITY
    if (fromListId !== listId) {
      const fromList = await prisma.list.findUnique({ where: { id: fromListId } })
      const toList = await prisma.list.findUnique({ where: { id: listId } })
      
      await prisma.activityLog.create({
        data: {
          action: 'moved',
          entityType: 'TASK',
          entityId: task.id,
          details: `Moved "${task.title}" from ${fromList.title} to ${toList.title}`,
          userId: userId, // Passed from frontend auth context
          boardId: toList.boardId
        }
      })
    }

    io.emit('task:moved', { task, fromListId, toListId: listId, animate: true })
    res.json(task)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to move task' })
  }
})

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
    })

    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    await prisma.task.delete({
      where: { id: req.params.id },
    })

    // Emit to all connected clients
    io.emit('task:deleted', { listId: task.listId, taskId: req.params.id })

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting task:', error)
    res.status(500).json({ error: 'Failed to delete task' })
  }
})

export default router
