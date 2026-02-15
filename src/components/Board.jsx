import React, { useState, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import List from './List'
import TaskCard from './TaskCard'
import TaskModal from './TaskModal'
import { Button } from './ui/button'
import { Input } from './ui/input'
import useBoardStore from '@/store/useBoardStore'
import { useSocket } from '@/hooks/useSocket'
import api from '@/services/api'
import { toast } from 'sonner'

const Board = () => {
  const [activeTask, setActiveTask] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [isAddingList, setIsAddingList] = useState(false)
  const [newListTitle, setNewListTitle] = useState('')
  const [flashingTasks, setFlashingTasks] = useState(new Set())

  const {
    getActiveBoard,
    activeBoard: activeBoardId,
    addList,
    addTask,
    deleteList,
    moveTask,
    reorderTask,
    updateTask,
  } = useBoardStore()

  const board = getActiveBoard()

  // Socket.io integration with real-time event handlers
  const socket = useSocket({
    'task:moved': (data) => {
      if (data.animate) {
        // Flash the moved task with yellow background
        setFlashingTasks(prev => new Set(prev).add(data.task.id))
        setTimeout(() => {
          setFlashingTasks(prev => {
            const next = new Set(prev)
            next.delete(data.task.id)
            return next
          })
        }, 1000)
      }
      toast.info('Task moved by another user', {
        description: data.task.title,
      })
    },
    'task:created': (data) => {
      toast.info('New task created by another user')
    },
    'task:updated': (data) => {
      toast.info('Task updated by another user')
    },
    'list:created': (data) => {
      toast.info('New list created')
    },
    'user:joined': (data) => {
      toast.success(`${data.user.name} joined the board`)
    },
    'user:left': (data) => {
      toast.info(`${data.user.name} left the board`)
    },
  })

  // Join board on mount
  useEffect(() => {
    if (activeBoardId) {
      socket.joinBoard(activeBoardId, {
        name: 'John Doe', // TODO: Get from auth context
        avatar: 'JD',
      })
    }

    return () => {
      if (activeBoardId) {
        socket.leaveBoard(activeBoardId)
      }
    }
  }, [activeBoardId])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event) => {
    const { active } = event
    const task = board.lists
      .flatMap((list) => list.tasks)
      .find((t) => t.id === active.id)
    setActiveTask(task)
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (!over) {
      setActiveTask(null)
      return
    }

    const activeTaskId = active.id
    const overId = over.id

    // Find the source list
    const sourceList = board.lists.find((list) =>
      list.tasks.some((task) => task.id === activeTaskId)
    )

    // Check if we're dropping on a list or a task
    const targetList = board.lists.find(
      (list) => list.id === overId || list.tasks.some((task) => task.id === overId)
    )

    if (!sourceList || !targetList) {
      setActiveTask(null)
      return
    }

    const targetListId = targetList.id
    const sourceListId = sourceList.id

    // Calculate new position
    const overTask = targetList.tasks.find((task) => task.id === overId)
    const newPosition = overTask ? overTask.position : targetList.tasks.length

    // Optimistic update - UI updates immediately
    if (sourceListId !== targetListId) {
      moveTask(activeBoardId, activeTaskId, sourceListId, targetListId, newPosition)
      toast.success('Task moved', {
        description: `Moved to ${targetList.title}`,
      })

      // Send to backend (async - non-blocking)
      try {
        await api.moveTask(activeTaskId, {
          listId: targetListId,
          position: newPosition,
          fromListId: sourceListId,
        })
      } catch (error) {
        // Revert on error
        moveTask(activeBoardId, activeTaskId, targetListId, sourceListId, activeTask.position)
        toast.error('Failed to move task', {
          description: 'Changes have been reverted',
        })
      }
    } else {
      reorderTask(activeBoardId, sourceListId, activeTaskId, newPosition)

      // Send to backend
      try {
        await api.updateTask(activeTaskId, { position: newPosition })
      } catch (error) {
        toast.error('Failed to update task position')
      }
    }

    setActiveTask(null)
  }

  const handleDragCancel = () => {
    setActiveTask(null)
  }

  const handleAddList = async () => {
    if (newListTitle.trim()) {
      const tempId = `list-${Date.now()}`
      
      // Optimistic update
      addList(activeBoardId, {
        id: tempId,
        title: newListTitle,
        boardId: activeBoardId,
        position: board.lists.length,
      })
      
      setNewListTitle('')
      setIsAddingList(false)
      toast.success('List created')

      // Send to backend
      try {
        await api.createList({
          title: newListTitle,
          boardId: activeBoardId,
          position: board.lists.length,
        })
      } catch (error) {
        // Revert on error
        deleteList(activeBoardId, tempId)
        toast.error('Failed to create list')
      }
    }
  }

  const handleAddTask = async (listId, task) => {
    // Optimistic update
    addTask(activeBoardId, listId, task)
    toast.success('Task created')

    // Send to backend
    try {
      await api.createTask({
        title: task.title,
        description: task.description,
        listId,
        position: task.position,
        priority: task.priority,
      })
    } catch (error) {
      toast.error('Failed to create task')
    }
  }

  const handleDeleteList = async (listId) => {
    const list = board.lists.find((l) => l.id === listId)
    if (list && list.tasks.length > 0) {
      toast.error('Cannot delete list with tasks')
      return
    }

    // Optimistic update
    deleteList(activeBoardId, listId)
    toast.success('List deleted')

    // Send to backend
    try {
      await api.deleteList(listId)
    } catch (error) {
      toast.error('Failed to delete list')
    }
  }

  const handleUpdateTask = async (listId, taskId, updates) => {
    // Optimistic update
    updateTask(activeBoardId, listId, taskId, updates)
    toast.success('Task updated')

    // Send to backend
    try {
      await api.updateTask(taskId, updates)
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  if (!board) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-zinc-500">Board not found</p>
      </div>
    )
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex h-full gap-4 overflow-x-auto pb-4">
          {/* Lists */}
          {board.lists.map((list) => (
            <List
              key={list.id}
              list={list}
              onTaskClick={setSelectedTask}
              onAddTask={handleAddTask}
              onDeleteList={handleDeleteList}
              flashingTasks={flashingTasks}
            />
          ))}

          {/* Add List */}
          <div className="flex w-80 flex-shrink-0">
            {isAddingList ? (
              <div className="w-full rounded-lg border border-zinc-200 bg-white p-3">
                <Input
                  placeholder="List title..."
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddList()
                    if (e.key === 'Escape') setIsAddingList(false)
                  }}
                  autoFocus
                  className="mb-2"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddList}>
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsAddingList(false)
                      setNewListTitle('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsAddingList(true)}
                className="w-full justify-start bg-zinc-50/50 hover:bg-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add list
              </Button>
            )}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <div className="rotate-3 opacity-90">
              <TaskCard task={activeTask} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updates) => {
            handleUpdateTask(selectedTask.listId, selectedTask.id, updates)
            setSelectedTask({ ...selectedTask, ...updates })
          }}
        />
      )}
    </>
  )
}

export default Board
