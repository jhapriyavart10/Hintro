import React from 'react'
import Layout from './components/Layout'
import Board from './components/Board'
import { Toaster } from 'sonner'

function App() {
  return (
    <>
      <Layout>
        <Board />
      </Layout>
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: 'bg-white border-zinc-200 text-zinc-900',
            title: 'text-zinc-900 font-medium',
            description: 'text-zinc-500',
            actionButton: 'bg-zinc-900 text-white',
            cancelButton: 'bg-zinc-100 text-zinc-900',
          },
        }}
      />
    </>
  )
}

export default App
