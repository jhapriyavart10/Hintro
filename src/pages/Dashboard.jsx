import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Layout, Clock, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import api from '@/services/api'
import { toast } from 'sonner'

const Dashboard = () => {
  const [boards, setBoards] = useState([])
  const [newBoardTitle, setNewBoardTitle] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    fetchBoards()
  }, [])

  const fetchBoards = async () => {
    try {
      const { data } = await api.get('/boards')
      setBoards(data)
    } catch (error) {
      toast.error('Failed to load boards')
    }
  }

  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim()) return
    try {
      const { data } = await api.post('/boards', { name: newBoardTitle })
      setBoards([...boards, data])
      setNewBoardTitle('')
      setIsDialogOpen(false)
      toast.success('Board created!')
      navigate(`/board/${data.id}`)
    } catch (error) {
      toast.error('Failed to create board')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-zinc-900 text-white p-1.5 rounded-md">
            <Layout className="h-5 w-5" />
          </div>
          <span className="font-semibold text-zinc-900">Hintro Task</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500">Welcome, {user.name}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-zinc-900">Your Boards</h1>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-zinc-900 text-white hover:bg-zinc-800">
                <Plus className="h-4 w-4 mr-2" /> Create Board
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new board</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input 
                  placeholder="Board name (e.g., Q1 Roadmap)" 
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                />
                <Button onClick={handleCreateBoard} className="w-full">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {boards.map((board) => (
            <Link key={board.id} to={`/board/${board.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-32 flex flex-col justify-between border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{board.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" /> Updated recently
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
          
          {boards.length === 0 && (
             <div className="col-span-full text-center py-12 text-zinc-400">
               No boards yet. Create one to get started!
             </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard