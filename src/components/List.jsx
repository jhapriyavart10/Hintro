import React, { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { MoreHorizontal, Plus, Trash2 } from 'lucide-react'
import TaskCard from './TaskCard'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Textarea } from './ui/textarea'

const List = ({ list, onTaskClick, onAddTask, onDeleteList, flashingTasks }) => {
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')

  const { setNodeRef } = useDroppable({
    id: list.id,
  })

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(list.id, {
        id: `task-${Date.now()}`,
        title: newTaskTitle,
        description: newTaskDescription,
        listId: list.id,
        position: list.tasks.length,
        priority: 'medium',
        labels: [],
      })
      setNewTaskTitle('')
      setNewTaskDescription('')
      setIsAddingTask(false)
    }
  }

  return (
    <div className="flex w-80 flex-shrink-0 flex-col rounded-lg bg-zinc-50/80 border border-zinc-200">
      {/* List Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-zinc-900 text-sm">
            {list.title}
          </h3>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-600">
            {list.tasks.length}
          </span>
        </div>
        <button
          onClick={() => onDeleteList(list.id)}
          className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Task List */}
      <div
        ref={setNodeRef}
        className="flex-1 space-y-2 overflow-y-auto p-3 min-h-[200px]"
      >
        <SortableContext
          items={list.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {list.tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onClick={onTaskClick}
              isFlashing={flashingTasks?.has(task.id)}
            />
          ))}
        </SortableContext>

        {list.tasks.length === 0 && !isAddingTask && (
          <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 text-sm text-zinc-400">
            Drop tasks here
          </div>
        )}
      </div>

      {/* Add Task */}
      <div className="border-t border-zinc-200 p-3">
        {isAddingTask ? (
          <div className="space-y-2">
            <Input
              placeholder="Task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTask()
                if (e.key === 'Escape') setIsAddingTask(false)
              }}
              autoFocus
              className="h-8 text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddTask} className="h-7 text-xs">
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAddingTask(false)
                  setNewTaskTitle('')
                }}
                className="h-7 text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingTask(true)}
            className="w-full justify-start text-zinc-600 hover:text-zinc-900"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add task
          </Button>
        )}
      </div>
    </div>
  )
}

export default List
