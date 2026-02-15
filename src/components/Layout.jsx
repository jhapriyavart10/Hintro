import React from 'react'
import { 
  LayoutDashboard, 
  ChevronLeft, 
  Plus, 
  Settings, 
  User,
  Boxes
} from 'lucide-react'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { cn } from '@/lib/utils'
import useBoardStore from '@/store/useBoardStore'
import useUIStore from '@/store/useUIStore'

const Layout = ({ children }) => {
  const { isSidebarCollapsed, toggleSidebar } = useUIStore()
  const { boards, activeBoard, setActiveBoard, getActiveBoard } = useBoardStore()
  
  const currentBoard = getActiveBoard()

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-zinc-200 bg-white transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-4">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900">
                <Boxes className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-zinc-900 tracking-tight">
                Hintro
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              "h-8 w-8 transition-transform duration-200",
              isSidebarCollapsed && "rotate-180"
            )}
          >
            <ChevronLeft className="h-4 w-4 text-zinc-500" />
          </Button>
        </div>

        {/* Sidebar Content */}
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
          {/* Boards Section */}
          <div className="space-y-2">
            {!isSidebarCollapsed && (
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Boards
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 hover:bg-zinc-100"
                >
                  <Plus className="h-3.5 w-3.5 text-zinc-500" />
                </Button>
              </div>
            )}

            <nav className="space-y-1">
              {boards.map((board) => (
                <button
                  key={board.id}
                  onClick={() => setActiveBoard(board.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm transition-all duration-200",
                    activeBoard === board.id
                      ? "bg-zinc-100 text-zinc-900 font-medium"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  )}
                >
                  <div className={cn("h-2 w-2 rounded-full", board.color)} />
                  {!isSidebarCollapsed && (
                    <span className="truncate">{board.name}</span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {!isSidebarCollapsed && <Separator />}

          {/* Navigation Links */}
          <nav className="space-y-1">
            <NavItem
              icon={LayoutDashboard}
              label="Dashboard"
              collapsed={isSidebarCollapsed}
            />
            <NavItem
              icon={Settings}
              label="Settings"
              collapsed={isSidebarCollapsed}
            />
          </nav>
        </div>

        {/* User Section */}
        <div className="border-t border-zinc-200 p-4">
          <button
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm text-zinc-600 transition-all duration-200 hover:bg-zinc-50 hover:text-zinc-900",
              isSidebarCollapsed && "justify-center"
            )}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
              <User className="h-4 w-4 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-zinc-900">
                  John Doe
                </span>
                <span className="text-xs text-zinc-500">john@hintro.ai</span>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">
              {currentBoard?.name || 'Board'}
            </h1>
            <p className="text-sm text-zinc-500">
              Manage and track your product initiatives
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <User className="mr-2 h-4 w-4" />
              Invite
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-zinc-50/50 p-6">
          <div className="mx-auto max-w-7xl">
            {children || (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                    <LayoutDashboard className="h-8 w-8 text-zinc-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-zinc-900">
                    No boards yet
                  </h3>
                  <p className="mb-4 text-sm text-zinc-500">
                    Get started by creating your first board
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Board
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

// NavItem Component
const NavItem = ({ icon: Icon, label, collapsed }) => (
  <button
    className={cn(
      "flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm text-zinc-600 transition-all duration-200 hover:bg-zinc-50 hover:text-zinc-900",
      collapsed && "justify-center"
    )}
  >
    <Icon className="h-4 w-4" />
    {!collapsed && <span>{label}</span>}
  </button>
)

export default Layout
