// src/store/useBoardStore.js

import { create } from 'zustand'
import api from '@/services/api' // Ensure this service exists and exports methods like api.getBoard(id)

const useBoardStore = create((set, get) => ({
  boards: [],
  activeBoard: null, // No hardcoded ID
  isLoading: false,
  error: null,

  // Async Actions
  fetchBoard: async (boardId) => {
    set({ isLoading: true, error: null })
    try {
      // Assuming your api service has a method to get a board
      // If not, use: await api.get(`/boards/${boardId}`)
      const response = await api.getBoard(boardId) 
      const boardData = response.data || response // Adjust based on your axios response structure

      set((state) => {
        // Check if board already exists in store to update it, or add it
        const exists = state.boards.find((b) => b.id === boardData.id)
        if (exists) {
            return {
                boards: state.boards.map(b => b.id === boardData.id ? boardData : b),
                activeBoard: boardData.id,
                isLoading: false
            }
        }
        return {
            boards: [...state.boards, boardData],
            activeBoard: boardData.id,
            isLoading: false
        }
      })
    } catch (error) {
      console.error('Failed to fetch board:', error)
      set({ error: error.message, isLoading: false })
    }
  },

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