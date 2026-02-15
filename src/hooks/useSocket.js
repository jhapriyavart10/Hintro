import { useEffect, useRef } from 'react'
import socketService from '@/services/socket'

export const useSocket = (events = {}) => {
  const listenersRef = useRef([])

  useEffect(() => {
    // Connect socket
    socketService.connect()

    // Set up event listeners
    Object.entries(events).forEach(([event, handler]) => {
      socketService.on(event, handler)
      listenersRef.current.push({ event, handler })
    })

    // Cleanup
    return () => {
      listenersRef.current.forEach(({ event, handler }) => {
        socketService.off(event, handler)
      })
      listenersRef.current = []
    }
  }, []) // Only run once on mount

  return socketService
}
