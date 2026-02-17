import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader } from './ui/dialog'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { Calendar, User, MessageSquare, Trash2, Check, Clock, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/services/api'
import { toast } from 'sonner'
import useBoardStore from '@/store/useBoardStore'

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-blue-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-red-500' },
]

const TaskModal = ({ task, isOpen, onClose, members = [], boardId }) => {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [priority, setPriority] = useState(task.priority || 'medium')
  const [assigneeId, setAssigneeId] = useState(task.assigneeId || null)
  
  // Comments State
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)

  const { deleteTask, updateTask, activeBoard } = useBoardStore()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // Fetch comments when modal opens
  useEffect(() => {
    if (isOpen && task.id) {
      fetchComments()
    }
  }, [isOpen, task.id])

  const fetchComments = async () => {
    setLoadingComments(true)
    try {
      const { data } = await api.getComments(task.id)
      setComments(data)
    } catch (error) {
      toast.error('Failed to load comments')
    } finally {
      setLoadingComments(false)
    }
  }

  const handleSave = async (updates) => {
    updateTask(activeBoard, task.listId, task.id, updates)
    try {
      await api.patch(`/tasks/${task.id}`, updates)
    } catch (error) {
      toast.error('Failed to save')
    }
  }

  const handlePostComment = async () => {
    if (!newComment.trim()) return
    try {
      const { data } = await api.createComment({ content: newComment, taskId: task.id })
      setComments([...comments, data])
      setNewComment('')
    } catch (error) {
      toast.error('Failed to post comment')
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
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden">
        {/* Header (Sticky) */}
        <div className="p-6 pb-2 border-b border-zinc-100 flex-shrink-0">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => handleSave({ title })}
            className="border-0 p-0 text-2xl font-semibold focus-visible:ring-0 shadow-none bg-transparent"
          />
          <div className="flex items-center gap-4 text-xs text-zinc-500 mt-2">
             <span className="bg-zinc-100 px-2 py-1 rounded-md">in list <strong>{task.listTitle || 'List'}</strong></span>
             <span>Created by {task.assignee?.name || 'Unassigned'}</span>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Main Column (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Description */}
                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-900">
                        <MessageSquare className="h-4 w-4" /> Description
                    </label>
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={() => handleSave({ description })}
                        className="min-h-[120px] resize-none bg-zinc-50/50 border-zinc-200 focus:bg-white transition-colors"
                        placeholder="Add a more detailed description..."
                    />
                </div>

                {/* Activity & Comments */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-zinc-900">Activity</label>
                    </div>
                    
                    {/* Comment Input */}
                    <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                            {user.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 space-y-2">
                            <Textarea 
                                placeholder="Write a comment..." 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="min-h-[80px]"
                            />
                            <div className="flex justify-end">
                                <Button size="sm" onClick={handlePostComment} disabled={!newComment.trim()}>
                                    Comment
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4 mt-6">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3 group">
                                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-1">
                                    {comment.user?.name?.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-zinc-900">{comment.user?.name}</span>
                                        <span className="text-xs text-zinc-400">{new Date(comment.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div className="text-sm text-zinc-700 mt-0.5 bg-zinc-50 p-2 rounded-md inline-block">
                                        {comment.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sidebar (Fixed width) */}
            <div className="w-80 border-l border-zinc-200 bg-zinc-50/50 p-6 overflow-y-auto space-y-6">
                
                {/* Status / Priority */}
                <div>
                    <label className="mb-2 block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Priority</label>
                    <div className="space-y-1">
                        {priorityOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => { setPriority(opt.value); handleSave({ priority: opt.value }); }}
                            className={cn(
                            'flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm transition-all',
                            priority === opt.value 
                                ? 'bg-white border-zinc-300 shadow-sm ring-1 ring-zinc-200' 
                                : 'border-transparent hover:bg-zinc-100'
                            )}
                        >
                            <div className={cn('h-2.5 w-2.5 rounded-full', opt.color)} />
                            {opt.label}
                            {priority === opt.value && <Check className="ml-auto h-4 w-4 text-zinc-600" />}
                        </button>
                        ))}
                    </div>
                </div>

                <Separator />

                {/* Assignee */}
                <div>
                    <label className="mb-2 block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Assignee</label>
                    <div className="space-y-1">
                        <button
                            onClick={() => { setAssigneeId(null); handleSave({ assigneeId: null }); }}
                            className={cn(
                                'flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm',
                                !assigneeId ? 'bg-white border-zinc-300 shadow-sm' : 'border-transparent hover:bg-zinc-100'
                            )}
                        >
                            <User className="h-4 w-4 text-zinc-400" />
                            Unassigned
                            {!assigneeId && <Check className="ml-auto h-4 w-4 text-zinc-600" />}
                        </button>
                        
                        {members.map((member) => (
                            <button
                                key={member.user.id}
                                onClick={() => { setAssigneeId(member.user.id); handleSave({ assigneeId: member.user.id }); }}
                                className={cn(
                                    'flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm',
                                    assigneeId === member.user.id ? 'bg-white border-zinc-300 shadow-sm' : 'border-transparent hover:bg-zinc-100'
                                )}
                            >
                                <div className="h-5 w-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold">
                                    {member.user.name.charAt(0)}
                                </div>
                                {member.user.name}
                                {assigneeId === member.user.id && <Check className="ml-auto h-4 w-4 text-zinc-600" />}
                            </button>
                        ))}
                    </div>
                </div>

                <Separator />
                
                <div className="pt-4">
                    <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Task
                    </Button>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
export default TaskModal