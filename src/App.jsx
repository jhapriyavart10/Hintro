import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Board from './components/Board'
import Login from './pages/Login'
import { Toaster } from 'sonner'

// Simple Auth Guard
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Board />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: 'bg-white border-zinc-200 text-zinc-900 shadow-lg',
            title: 'text-zinc-900 font-medium',
            description: 'text-zinc-500',
            actionButton: 'bg-zinc-900 text-white',
            cancelButton: 'bg-zinc-100 text-zinc-900',
          },
        }}
      />
    </BrowserRouter>
  )
}

export default App