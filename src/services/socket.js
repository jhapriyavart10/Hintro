import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

class SocketService {
  constructor() {
    this.socket = null
    this.listeners = new Map()
  }

  connect() {
    if (this.socket?.connected) return

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected:', this.socket.id)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error)
    })

    // Handle ping/pong for connection health
    this.socket.on('ping', () => {
      this.socket.emit('pong', { timestamp: Date.now() })
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Board operations
  joinBoard(boardId, user) {
    if (!this.socket) return
    this.socket.emit('board:join', { boardId, user })
  }

  leaveBoard(boardId) {
    if (!this.socket) return
    this.socket.emit('board:leave', boardId)
  }

  // Real-time event listeners
  on(event, callback) {
    if (!this.socket) return

    this.socket.on(event, callback)
    
    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  off(event, callback) {
    if (!this.socket) return

    this.socket.off(event, callback)

    // Remove from listeners
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  // Emit events
  emit(event, data) {
    if (!this.socket) return
    this.socket.emit(event, data)
  }

  // Cursor tracking
  updateCursor(boardId, position, user) {
    if (!this.socket) return
    this.socket.emit('cursor:move', { boardId, position, user })
  }

  // Task dragging feedback
  emitTaskDragging(boardId, taskId, position) {
    if (!this.socket) return
    this.socket.emit('task:dragging', { boardId, taskId, position })
  }

  // Typing indicators
  emitTyping(boardId, taskId, user, isTyping) {
    if (!this.socket) return
    this.socket.emit('task:typing', { boardId, taskId, user, isTyping })
  }

  // Cleanup
  removeAllListeners() {
    if (!this.socket) return

    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket.off(event, callback)
      })
    })

    this.listeners.clear()
  }
}

export default new SocketService()
