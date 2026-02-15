import express from 'express'
import prisma from '../db/prisma.js'
import { io } from '../server.js'

const router = express.Router()

// Create task
router.post('/', async (req, res) => {
  try {
    const { title, description, listId, position, priority, assigneeId } = req.body

    const task = await prisma.task.create({
      data: {
        title,
        description,
        listId,
        position: position ?? 0,
        priority: priority || 'medium',
        ...(assigneeId && { assigneeId }),
      },
      include: {
        assignee: true,
        labels: {
          include: {
            label: true,
          },
        },
      },
    })

    // Emit to all connected clients
    io.emit('task:created', { listId, task })

    res.status(201).json(task)
  } catch (error) {
    console.error('Error creating task:', error)
    res.status(500).json({ error: 'Failed to create task' })
  }
})

// Update task
router.patch('/:id', async (req, res) => {
  try {
    const { title, description, priority, position, assigneeId, dueDate } = req.body

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(priority && { priority }),
        ...(position !== undefined && { position }),
        ...(assigneeId !== undefined && { assigneeId }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
      include: {
        assignee: true,
        labels: {
          include: {
            label: true,
          },
        },
      },
    })

    // Emit to all connected clients
    io.emit('task:updated', task)

    res.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    res.status(500).json({ error: 'Failed to update task' })
  }
})

// Move task to different list
router.patch('/:id/move', async (req, res) => {
  try {
    const { listId, position } = req.body

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        listId,
        position,
      },
      include: {
        assignee: true,
        labels: {
          include: {
            label: true,
          },
        },
      },
    })

    // Emit to all connected clients with animation hint
    io.emit('task:moved', { 
      task, 
      fromListId: req.body.fromListId,
      toListId: listId,
      animate: true 
    })

    res.json(task)
  } catch (error) {
    console.error('Error moving task:', error)
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
