import { create } from 'zustand'

const useBoardStore = create((set, get) => ({
  boards: [
    {
      id: 'product-roadmap',
      name: 'Product Roadmap',
      color: 'bg-blue-500',
      lists: [
        {
          id: 'list-1',
          title: 'Backlog',
          boardId: 'product-roadmap',
          position: 0,
          tasks: [
            {
              id: 'task-1',
              title: 'Design new dashboard layout',
              description: 'Create wireframes and high-fidelity mockups',
              listId: 'list-1',
              position: 0,
              priority: 'high',
              assignee: { name: 'John Doe', avatar: 'JD' },
              labels: ['design', 'ui'],
            },
            {
              id: 'task-2',
              title: 'Implement user authentication',
              description: 'Add OAuth2 login flow',
              listId: 'list-1',
              position: 1,
              priority: 'medium',
              assignee: { name: 'Jane Smith', avatar: 'JS' },
              labels: ['backend', 'security'],
            },
          ],
        },
        {
          id: 'list-2',
          title: 'In Progress',
          boardId: 'product-roadmap',
          position: 1,
          tasks: [
            {
              id: 'task-3',
              title: 'Set up CI/CD pipeline',
              description: 'Configure GitHub Actions for automated deployments',
              listId: 'list-2',
              position: 0,
              priority: 'high',
              assignee: { name: 'John Doe', avatar: 'JD' },
              labels: ['devops'],
            },
          ],
        },
        {
          id: 'list-3',
          title: 'Review',
          boardId: 'product-roadmap',
          position: 2,
          tasks: [],
        },
        {
          id: 'list-4',
          title: 'Done',
          boardId: 'product-roadmap',
          position: 3,
          tasks: [
            {
              id: 'task-4',
              title: 'Setup project repository',
              description: 'Initialize Git and configure project structure',
              listId: 'list-4',
              position: 0,
              priority: 'low',
              assignee: { name: 'John Doe', avatar: 'JD' },
              labels: ['setup'],
            },
          ],
        },
      ],
    },
  ],
  activeBoard: 'product-roadmap',

  // Getters
  getBoard: (boardId) => {
    return get().boards.find((b) => b.id === boardId)
  },

  getActiveBoard: () => {
    return get().boards.find((b) => b.id === get().activeBoard)
  },

  // Board actions
  setActiveBoard: (boardId) => set({ activeBoard: boardId }),

  addBoard: (board) =>
    set((state) => ({
      boards: [...state.boards, { ...board, lists: [] }],
    })),

  // List actions
  addList: (boardId, list) =>
    set((state) => ({
      boards: state.boards.map((board) =>
        board.id === boardId
          ? { ...board, lists: [...board.lists, { ...list, tasks: [] }] }
          : board
      ),
    })),

  updateList: (boardId, listId, updates) =>
    set((state) => ({
      boards: state.boards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              lists: board.lists.map((list) =>
                list.id === listId ? { ...list, ...updates } : list
              ),
            }
          : board
      ),
    })),

  deleteList: (boardId, listId) =>
    set((state) => ({
      boards: state.boards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              lists: board.lists.filter((list) => list.id !== listId),
            }
          : board
      ),
    })),

  // Task actions
  addTask: (boardId, listId, task) =>
    set((state) => ({
      boards: state.boards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              lists: board.lists.map((list) =>
                list.id === listId
                  ? { ...list, tasks: [...list.tasks, task] }
                  : list
              ),
            }
          : board
      ),
    })),

  updateTask: (boardId, listId, taskId, updates) =>
    set((state) => ({
      boards: state.boards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              lists: board.lists.map((list) =>
                list.id === listId
                  ? {
                      ...list,
                      tasks: list.tasks.map((task) =>
                        task.id === taskId ? { ...task, ...updates } : task
                      ),
                    }
                  : list
              ),
            }
          : board
      ),
    })),

  deleteTask: (boardId, listId, taskId) =>
    set((state) => ({
      boards: state.boards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              lists: board.lists.map((list) =>
                list.id === listId
                  ? {
                      ...list,
                      tasks: list.tasks.filter((task) => task.id !== taskId),
                    }
                  : list
              ),
            }
          : board
      ),
    })),

  // Move task between lists (for drag and drop)
  moveTask: (boardId, taskId, fromListId, toListId, newPosition) =>
    set((state) => {
      const board = state.boards.find((b) => b.id === boardId)
      if (!board) return state

      const fromList = board.lists.find((l) => l.id === fromListId)
      const toList = board.lists.find((l) => l.id === toListId)
      const task = fromList?.tasks.find((t) => t.id === taskId)

      if (!fromList || !toList || !task) return state

      // Remove task from source list
      const updatedFromList = {
        ...fromList,
        tasks: fromList.tasks.filter((t) => t.id !== taskId),
      }

      // Add task to destination list
      const updatedTask = { ...task, listId: toListId, position: newPosition }
      const updatedToList = {
        ...toList,
        tasks: [...toList.tasks, updatedTask].sort(
          (a, b) => a.position - b.position
        ),
      }

      return {
        boards: state.boards.map((b) =>
          b.id === boardId
            ? {
                ...b,
                lists: b.lists.map((l) => {
                  if (l.id === fromListId) return updatedFromList
                  if (l.id === toListId) return updatedToList
                  return l
                }),
              }
            : b
        ),
      }
    }),

  // Reorder task within same list
  reorderTask: (boardId, listId, taskId, newPosition) =>
    set((state) => ({
      boards: state.boards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              lists: board.lists.map((list) =>
                list.id === listId
                  ? {
                      ...list,
                      tasks: list.tasks
                        .map((task) =>
                          task.id === taskId
                            ? { ...task, position: newPosition }
                            : task
                        )
                        .sort((a, b) => a.position - b.position),
                    }
                  : list
              ),
            }
          : board
      ),
    })),
}))

export default useBoardStore
