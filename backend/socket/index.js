export function setupSocketHandlers(io) {
  // Track connected users
  const connectedUsers = new Map()

  io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.id}`)

    // Handle user joining a board
    socket.on('board:join', (data) => {
      const { boardId, user } = data
      socket.join(`board:${boardId}`)
      
      // Track user
      connectedUsers.set(socket.id, { ...user, boardId })
      
      // Notify others in the board
      socket.to(`board:${boardId}`).emit('user:joined', {
        socketId: socket.id,
        user,
      })

      console.log(`👤 User ${user.name} joined board ${boardId}`)
    })

    // Handle user leaving a board
    socket.on('board:leave', (boardId) => {
      socket.leave(`board:${boardId}`)
      const user = connectedUsers.get(socket.id)
      
      if (user) {
        socket.to(`board:${boardId}`).emit('user:left', {
          socketId: socket.id,
          user,
        })
      }

      console.log(`👤 User left board ${boardId}`)
    })

    // Real-time cursor position (for collaborative cursors)
    socket.on('cursor:move', (data) => {
      const { boardId, position, user } = data
      socket.to(`board:${boardId}`).emit('cursor:update', {
        socketId: socket.id,
        position,
        user,
      })
    })

    // Real-time task dragging feedback
    socket.on('task:dragging', (data) => {
      const { boardId, taskId, position } = data
      socket.to(`board:${boardId}`).emit('task:drag-update', {
        socketId: socket.id,
        taskId,
        position,
      })
    })

    // Handle typing indicators
    socket.on('task:typing', (data) => {
      const { boardId, taskId, user, isTyping } = data
      socket.to(`board:${boardId}`).emit('task:typing-update', {
        taskId,
        user,
        isTyping,
      })
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      const user = connectedUsers.get(socket.id)
      
      if (user && user.boardId) {
        socket.to(`board:${user.boardId}`).emit('user:left', {
          socketId: socket.id,
          user,
        })
      }

      connectedUsers.delete(socket.id)
      console.log(`👤 User disconnected: ${socket.id}`)
    })
  })

  // Periodic ping to keep connections alive
  setInterval(() => {
    io.emit('ping', { timestamp: Date.now() })
  }, 30000) // Every 30 seconds
}
