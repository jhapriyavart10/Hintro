import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import {
  Calendar,
  Tag,
  User,
  MessageSquare,
  Paperclip,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-blue-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-red-500' },
]

const TaskModal = ({ task, isOpen, onClose, onUpdate }) => {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [priority, setPriority] = useState(task.priority || 'medium')

  const handleSave = () => {
    onUpdate({
      title,
      description,
      priority,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              onUpdate({ title: e.target.value })
            }}
            className="border-0 p-0 text-xl font-semibold focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </DialogHeader>

        <div className="grid gap-6">
          {/* Main Content & Sidebar Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-4 md:col-span-2">
              {/* Description */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <MessageSquare className="h-4 w-4" />
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleSave}
                  placeholder="Add a more detailed description..."
                  className="min-h-[120px] resize-none"
                />
              </div>

              <Separator />

              {/* Labels */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <Tag className="h-4 w-4" />
                  Labels
                </label>
                <div className="flex flex-wrap gap-2">
                  {task.labels?.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700"
                    >
                      {label}
                    </span>
                  ))}
                  <Button variant="outline" size="sm">
                    + Add label
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Comments */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <MessageSquare className="h-4 w-4" />
                  Comments
                </label>
                <div className="space-y-3">
                  {/* Comment input */}
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-medium text-white">
                      JD
                    </div>
                    <Input placeholder="Write a comment..." className="flex-1" />
                  </div>

                  {/* Comments will be shown here */}
                  <p className="text-sm text-zinc-500">No comments yet</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Priority */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Priority
                </label>
                <div className="space-y-1">
                  {priorityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setPriority(option.value)
                        onUpdate({ priority: option.value })
                      }}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
                        priority === option.value
                          ? 'border-zinc-900 bg-zinc-50'
                          : 'border-zinc-200 hover:border-zinc-300'
                      )}
                    >
                      <div className={cn('h-3 w-3 rounded-full', option.color)} />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Assignee */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <User className="h-4 w-4" />
                  Assignee
                </label>
                {task.assignee ? (
                  <div className="flex items-center gap-2 rounded-md border border-zinc-200 p-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-medium text-white">
                      {task.assignee.avatar}
                    </div>
                    <span className="text-sm text-zinc-900">
                      {task.assignee.name}
                    </span>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="w-full">
                    Assign
                  </Button>
                )}
              </div>

              <Separator />

              {/* Due Date */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <Calendar className="h-4 w-4" />
                  Due Date
                </label>
                <Button variant="outline" size="sm" className="w-full">
                  {task.dueDate || 'Set due date'}
                </Button>
              </div>

              <Separator />

              {/* Attachments */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <Paperclip className="h-4 w-4" />
                  Attachments
                </label>
                <Button variant="outline" size="sm" className="w-full">
                  Add attachment
                </Button>
              </div>

              <Separator />

              {/* Actions */}
              <div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    // TODO: Delete task
                    onClose()
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Task
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TaskModal
