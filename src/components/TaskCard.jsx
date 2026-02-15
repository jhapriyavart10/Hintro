import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Calendar, MessageSquare, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'

const priorityColors = {
  high: 'border-l-red-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-blue-500',
}

const TaskCard = ({ task, onClick, isFlashing }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-lg border-l-4 border-zinc-200 bg-white p-4 shadow-sm transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-md hover:border-zinc-300',
        'cursor-pointer',
        priorityColors[task.priority],
        isDragging && 'opacity-50 shadow-lg',
        isFlashing && 'animate-flash bg-yellow-50'
      )}
      onClick={() => onClick(task)}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-2 top-1/2 -translate-y-1/2 cursor-grab opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      >
        <div className="rounded bg-zinc-100 p-1">
          <GripVertical className="h-4 w-4 text-zinc-400" />
        </div>
      </div>

      {/* Task Content */}
      <div className="space-y-3">
        {/* Title */}
        <h3 className="font-medium text-zinc-900 leading-snug">
          {task.title}
        </h3>

        {/* Description (truncated) */}
        {task.description && (
          <p className="text-sm text-zinc-500 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {task.labels.map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Meta info */}
          <div className="flex items-center gap-3 text-zinc-400">
            {task.commentsCount > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{task.commentsCount}</span>
              </div>
            )}
            {task.attachmentsCount > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <Paperclip className="h-3.5 w-3.5" />
                <span>{task.attachmentsCount}</span>
              </div>
            )}
            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs">
                <Calendar className="h-3.5 w-3.5" />
                <span>{task.dueDate}</span>
              </div>
            )}
          </div>

          {/* Assignee */}
          {task.assignee && (
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-medium text-white">
                {task.assignee.avatar}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskCard
