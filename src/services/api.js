const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

class ApiService {
  // Boards
  async getBoards() {
    const response = await fetch(`${API_URL}/boards`)
    if (!response.ok) throw new Error('Failed to fetch boards')
    return response.json()
  }

  async getBoard(boardId) {
    const response = await fetch(`${API_URL}/boards/${boardId}`)
    if (!response.ok) throw new Error('Failed to fetch board')
    return response.json()
  }

  async createBoard(data) {
    const response = await fetch(`${API_URL}/boards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create board')
    return response.json()
  }

  async updateBoard(boardId, data) {
    const response = await fetch(`${API_URL}/boards/${boardId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update board')
    return response.json()
  }

  async deleteBoard(boardId) {
    const response = await fetch(`${API_URL}/boards/${boardId}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete board')
  }

  // Lists
  async createList(data) {
    const response = await fetch(`${API_URL}/lists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create list')
    return response.json()
  }

  async updateList(listId, data) {
    const response = await fetch(`${API_URL}/lists/${listId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update list')
    return response.json()
  }

  async deleteList(listId) {
    const response = await fetch(`${API_URL}/lists/${listId}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete list')
  }

  // Tasks
  async createTask(data) {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create task')
    return response.json()
  }

  async updateTask(taskId, data) {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update task')
    return response.json()
  }

  async moveTask(taskId, data) {
    const response = await fetch(`${API_URL}/tasks/${taskId}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to move task')
    return response.json()
  }

  async deleteTask(taskId) {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete task')
  }
}

export default new ApiService()
