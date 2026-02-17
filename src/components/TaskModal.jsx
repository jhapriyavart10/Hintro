import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader } from './ui/dialog'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { Calendar, Tag, User, MessageSquare, Trash2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/services/api'
import { toast } from 'sonner'
import useBoardStore from '@/store/useBoardStore'

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-blue-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-red-500' },
]

const TaskModal = ({ task, isOpen, onClose }) => {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [priority, setPriority] = useState(task.priority || 'medium')
  const { deleteTask, updateTask, activeBoard } = useBoardStore()

  const handleSave = async (updates) => {
    // Optimistic Update
    updateTask(activeBoard, task.listId, task.id, updates)
    try {
      await api.patch(`/tasks/${task.id}`, updates)
    } catch (error) {
      toast.error('Failed to save')
    }
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(activeBoard, task.listId, task.id)
      onClose()
      try {
        await api.delete(`/tasks/${task.id}`)
        toast.success('Task deleted')
      } catch (error) {
        toast.error('Failed to delete')
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => handleSave({ title })}
            className="border-0 p-0 text-xl font-semibold focus-visible:ring-0"
          />
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Column */}
          <div className="space-y-4 md:col-span-2">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                <MessageSquare className="h-4 w-4" /> Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => handleSave({ description })}
                className="min-h-[120px] resize-none"
                placeholder="Add details..."
              />
            </div>
            
            {/* Simple Comments Section Placeholder */}
            <Separator />
            <div className="opacity-50 pointer-events-none">
                <label className="mb-2 block text-sm font-medium">Comments (Coming Soon)</label>
                <Input placeholder="Write a comment..." disabled />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Priority</label>
              <div className="space-y-1">
                {priorityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setPriority(opt.value); handleSave({ priority: opt.value }); }}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm',
                      priority === opt.value ? 'bg-zinc-100 border-zinc-900' : 'border-zinc-200'
                    )}
                  >
                    <div className={cn('h-3 w-3 rounded-full', opt.color)} />
                    {opt.label}
                    {priority === opt.value && <Check className="ml-auto h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>

            <Separator />
            
            <Button variant="destructive" size="sm" className="w-full" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
export default TaskModal