import React, { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Plus, Search, Loader2 } from 'lucide-react'
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
  const {boardId} = useParams()
  const [activeTask, setActiveTask] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [isAddingList, setIsAddingList] = useState(false)
  const [newListTitle, setNewListTitle] = useState('')
  const [flashingTasks, setFlashingTasks] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState('') // New Search State

  const {
    getActiveBoard,
    fetchBoard, // Import fetch action
    isLoading, // Import loading state
    activeBoard: activeBoardId,
    addList,
    addTask,
    deleteList,
    moveTask,
    reorderTask,
    updateTask,
  } = useBoardStore()

  useEffect(() => {
    if (boardId) {
      fetchBoard(boardId) // Use the real ID
    }
  }, [boardId, fetchBoard])

  const rawBoard = getActiveBoard()

  // Client-side Search Filtering
  const board = useMemo(() => {
    if (!rawBoard) return null;
    if (!searchQuery.trim()) return rawBoard;

    const lowerQuery = searchQuery.toLowerCase();
    return {
      ...rawBoard,
      lists: rawBoard.lists.map(list => ({
        ...list,
        tasks: list.tasks.filter(task => 
          task.title.toLowerCase().includes(lowerQuery) || 
          task.description?.toLowerCase().includes(lowerQuery)
        )
      }))
    };
  }, [rawBoard, searchQuery]);


  // Socket.io integration
  const socket = useSocket({
    'task:moved': (data) => {
      if (data.animate) {
        setFlashingTasks(prev => new Set(prev).add(data.task.id))
        setTimeout(() => {
          setFlashingTasks(prev => {
            const next = new Set(prev)
            next.delete(data.task.id)
            return next
          })
        }, 1000)
      }
      toast.info('Task moved', { description: data.task.title })
    },
    'task:created': () => toast.info('New task created'),
    'task:updated': () => toast.info('Task updated'),
    'list:created': () => toast.info('New list created'),
    'user:joined': (data) => toast.success(`${data.user.name} joined`),
    'user:left': (data) => toast.info(`${data.user.name} left`),
  })

  // Join board on socket
  useEffect(() => {
    if (activeBoardId) {
      socket.joinBoard(activeBoardId, {
        name: 'John Doe', 
        avatar: 'JD',
      })
    }
    return () => {
      if (activeBoardId) socket.leaveBoard(activeBoardId)
    }
  }, [activeBoardId])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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
    if (!over) { setActiveTask(null); return; }

    const activeTaskId = active.id
    const overId = over.id

    const sourceList = board.lists.find((list) => list.tasks.some((task) => task.id === activeTaskId))
    const targetList = board.lists.find((list) => list.id === overId || list.tasks.some((task) => task.id === overId))

    if (!sourceList || !targetList) { setActiveTask(null); return; }

    const sourceListId = sourceList.id
    const targetListId = targetList.id
    const overTask = targetList.tasks.find((task) => task.id === overId)
    const newPosition = overTask ? overTask.position : targetList.tasks.length

    if (sourceListId !== targetListId) {
      moveTask(activeBoardId, activeTaskId, sourceListId, targetListId, newPosition)
      toast.success('Task moved')
      try {
        await api.moveTask(activeTaskId, { listId: targetListId, position: newPosition, fromListId: sourceListId })
      } catch (error) {
        moveTask(activeBoardId, activeTaskId, targetListId, sourceListId, activeTask.position)
        toast.error('Failed to move task')
      }
    } else {
      reorderTask(activeBoardId, sourceListId, activeTaskId, newPosition)
      try {
        await api.updateTask(activeTaskId, { position: newPosition })
      } catch (error) {
        toast.error('Failed to update position')
      }
    }
    setActiveTask(null)
  }

  const handleDragCancel = () => setActiveTask(null)

  const handleAddList = async () => {
    if (newListTitle.trim()) {
      const tempId = `list-${Date.now()}`
      addList(activeBoardId, { id: tempId, title: newListTitle, boardId: activeBoardId, position: board.lists.length })
      setNewListTitle('')
      setIsAddingList(false)
      
      try {
        await api.createList({ title: newListTitle, boardId: activeBoardId, position: board.lists.length })
      } catch (error) {
        deleteList(activeBoardId, tempId)
        toast.error('Failed to create list')
      }
    }
  }

  const handleAddTask = async (listId, task) => {
    addTask(activeBoardId, listId, task)
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
    deleteList(activeBoardId, listId)
    try { await api.deleteList(listId) } catch (error) { toast.error('Failed to delete list') }
  }

  const handleUpdateTask = async (listId, taskId, updates) => {
    updateTask(activeBoardId, listId, taskId, updates)
    try { await api.updateTask(taskId, updates) } catch (error) { toast.error('Failed to update task') }
  }

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          <p className="text-sm font-medium text-zinc-500">Loading Board...</p>
        </div>
      </div>
    )
  }

  if (!board) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-zinc-50">
        <p className="text-zinc-500">No board selected.</p>
        <Button onClick={() => fetchBoard('product-roadmap')}>Retry Connection</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
        {/* Board Header with Search */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-white">
            <h1 className="text-xl font-semibold text-zinc-900">{board.name}</h1>
            <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-400" />
                <Input 
                    placeholder="Search tasks..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-9 bg-zinc-50 border-zinc-200 focus-visible:ring-zinc-900"
                />
            </div>
        </div>

      {/* Board Canvas */}
      <div className="flex-1 overflow-x-auto p-6 bg-zinc-50/50">
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div className="flex h-full gap-6">
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

            {/* Add List Column */}
            <div className="flex w-80 flex-shrink-0 flex-col">
                {isAddingList ? (
                <div className="w-full rounded-xl border border-zinc-200 bg-white p-3 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                    <Input
                    placeholder="Enter list title..."
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddList()
                        if (e.key === 'Escape') setIsAddingList(false)
                    }}
                    autoFocus
                    className="mb-3 border-zinc-200 focus-visible:ring-zinc-900"
                    />
                    <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddList} className="bg-zinc-900 text-white hover:bg-zinc-800">
                        Add List
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                        setIsAddingList(false)
                        setNewListTitle('')
                        }}
                        className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                    >
                        Cancel
                    </Button>
                    </div>
                </div>
                ) : (
                <Button
                    variant="ghost"
                    onClick={() => setIsAddingList(true)}
                    className="w-full justify-start rounded-xl border border-dashed border-zinc-300 bg-transparent py-6 text-zinc-500 hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add another list
                </Button>
                )}
            </div>
            </div>

            <DragOverlay>
            {activeTask ? (
                <div className="rotate-2 cursor-grabbing shadow-2xl scale-105">
                <TaskCard task={activeTask} onClick={() => {}} />
                </div>
            ) : null}
            </DragOverlay>
        </DndContext>
      </div>

      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          members={board.members}  
          boardId={activeBoardId}
          onUpdate={(updates) => {
            handleUpdateTask(selectedTask.listId, selectedTask.id, updates)
            setSelectedTask({ ...selectedTask, ...updates })
          }}
        />
      )}
    </div>
  )
}

export default Board