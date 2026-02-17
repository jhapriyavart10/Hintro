import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Board from './components/Board'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard' // Import the new page
import { Toaster } from 'sonner'

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
        
        {/* Dashboard is now the home route */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Board route now takes an ID */}
        <Route path="/board/:boardId" element={
          <ProtectedRoute>
            <Layout>
              <Board />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster position="bottom-right" />
    </BrowserRouter>
  )
}

export default App