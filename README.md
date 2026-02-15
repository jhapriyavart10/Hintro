# Hintro AI - Real-Time Task Collaboration Platform

A **production-ready**, high-polish task collaboration platform (Trello/Notion hybrid) with real-time capabilities. Built with a professional, VC-backed startup aesthetic inspired by Linear, Vercel, and Notion.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🎯 Core Functionality
- ✅ **Kanban Board** - Drag-and-drop task management
- ✅ **Real-time Collaboration** - See other users' changes instantly
- ✅ **Optimistic Updates** - Instant UI feedback
- ✅ **Task Management** - Create, edit, delete, and move tasks
- ✅ **List Management** - Create and organize multiple lists
- ✅ **Task Details** - Rich modal with priorities, labels, assignees
- ✅ **Smooth Animations** - Professional micro-interactions

### 🎨 Design Excellence
- ✅ **Professional UI** - Clean, minimalist design
- ✅ **Inter Font** - Refined typography
- ✅ **Zinc Color Palette** - Sophisticated grays
- ✅ **Subtle Shadows** - Soft, diffused depth
- ✅ **Micro-interactions** - Hover effects, transitions
- ✅ **Custom Scrollbars** - Minimal, rounded
- ✅ **Flash Animations** - Yellow highlight for real-time updates

### 🔧 Technical Features
- ✅ **RESTful API** - Express backend
- ✅ **WebSocket Support** - Socket.io real-time events
- ✅ **PostgreSQL Database** - Robust data persistence
- ✅ **Prisma ORM** - Type-safe database access
- ✅ **State Management** - Zustand stores
- ✅ **Modern Drag & Drop** - @dnd-kit implementation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Installation

```bash
# 1. Install dependencies
npm install
cd backend && npm install && cd ..

# 2. Set up PostgreSQL database
createdb hintro_ai

# 3. Configure environment variables
# Copy .env.example to .env and update values

# 4. Run database migrations
cd backend
npm run prisma:migrate
cd ..

# 5. Start servers
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
npm run dev
```

Visit **http://localhost:5173** 🎉

📖 **Detailed Setup**: See [SETUP.md](SETUP.md) for comprehensive instructions.

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite |
| **Styling** | Tailwind CSS + Shadcn/UI |
| **State** | Zustand |
| **Drag & Drop** | @dnd-kit/core |
| **Real-time** | Socket.io |
| **Backend** | Node.js + Express |
| **Database** | PostgreSQL + Prisma ORM |
| **Icons** | Lucide React |
| **Toasts** | Sonner |

## 📂 Project Structure

```
hintro-ai/
├── backend/                    # Node.js + Express backend
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── routes/                # API endpoints
│   │   ├── boards.js
│   │   ├── lists.js
│   │   └── tasks.js
│   ├── socket/                # WebSocket handlers
│   │   └── index.js
│   ├── db/
│   │   └── prisma.js          # Database client
│   ├── server.js              # Express app
│   └── package.json
├── src/
│   ├── components/
│   │   ├── ui/                # Shadcn/UI components
│   │   │   ├── button.jsx
│   │   │   ├── input.jsx
│   │   │   ├── dialog.jsx
│   │   │   ├── textarea.jsx
│   │   │   └── separator.jsx
│   │   ├── Board.jsx          # Main Kanban board
│   │   ├── List.jsx           # Task list/column
│   │   ├── TaskCard.jsx       # Individual task card
│   │   ├── TaskModal.jsx      # Task detail modal
│   │   └── Layout.jsx         # App layout with sidebar
│   ├── store/
│   │   ├── useBoardStore.js   # Board state (Zustand)
│   │   └── useUIStore.js      # UI state (Zustand)
│   ├── services/
│   │   ├── api.js             # REST API client
│   │   └── socket.js          # Socket.io client
│   ├── hooks/
│   │   └── useSocket.js       # Custom Socket hook
│   ├── lib/
│   │   └── utils.js           # Utility functions
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── SETUP.md                    # Detailed setup guide
└── README.md
```

## 🎯 Feature Showcase

### 🎨 Professional UI/UX

**Kanban Board**
- ✅ Drag-and-drop tasks with @dnd-kit (accessible & smooth)
- ✅ Visual drag overlay with subtle rotation
- ✅ Horizontal scrolling list container
- ✅ Empty state placeholders

**Task Cards**
- ✅ Priority indicators (color-coded left border)
- ✅ Drag handle (appears on hover)
- ✅ Labels with pill design
- ✅ Assignee avatars with gradients
- ✅ Meta info (comments, attachments, due dates)
- ✅ Hover lift animation (-translate-y-0.5)

**Task Details Modal**
- ✅ Inline editing for title & description
- ✅ Priority selection with visual indicators
- ✅ Label & assignee management
- ✅ Comments section (ready)
- ✅ Attachment support (ready)

**Layout**
- ✅ Collapsible sidebar (300ms smooth transition)
- ✅ Board navigation with color indicators
- ✅ User profile with gradient avatar
- ✅ Responsive design

### ⚡ Real-Time Collaboration

**WebSocket Features**
- ✅ Live task movements across all connected clients
- ✅ **Yellow flash animation** when others move tasks
- ✅ User presence (join/leave notifications)
- ✅ Toast notifications for remote changes
- ✅ Automatic reconnection

**Optimistic Updates**
- ✅ Instant UI feedback on all actions
- ✅ Async API calls don't block UI
- ✅ Automatic revert on API errors
- ✅ Error toast with descriptions

### 🔧 Backend & API

**REST API**
- ✅ Full CRUD for boards, lists, tasks
- ✅ PostgreSQL with Prisma ORM
- ✅ Express server with CORS & security
- ✅ Error handling & logging

**WebSocket Server**
- ✅ Socket.io integration
- ✅ Room-based events (per board)
- ✅ User tracking & presence
- ✅ Ping/pong for connection health

## 🔌 API Reference

### REST Endpoints

```
GET    /api/boards           # List all boards
GET    /api/boards/:id       # Get board with lists & tasks
POST   /api/boards           # Create board
PATCH  /api/boards/:id       # Update board
DELETE /api/boards/:id       # Delete board

POST   /api/lists            # Create list
PATCH  /api/lists/:id        # Update list
DELETE /api/lists/:id        # Delete list (only if empty)

POST   /api/tasks            # Create task
PATCH  /api/tasks/:id        # Update task
PATCH  /api/tasks/:id/move   # Move task (triggers animation)
DELETE /api/tasks/:id        # Delete task
```

### WebSocket Events

**Client → Server**
```
board:join         { boardId, user }
board:leave        boardId
cursor:move        { boardId, position, user }
task:dragging      { boardId, taskId, position }
task:typing        { boardId, taskId, user, isTyping }
```

**Server → Client**
```
user:joined        { socketId, user }
user:left          { socketId, user }
task:created       { listId, task }
task:updated       task
task:moved         { task, fromListId, toListId, animate: true }
list:created       { boardId, list }
board:updated      board
```

## 🧪 Testing Real-Time Features

1. Open app in **two browser windows** side-by-side
2. In Window 1: Drag a task to a different list
3. In Window 2: Watch it **flash yellow** and smoothly appear! ✨
4. Create a new task in Window 1
5. See the toast notification in Window 2

## 🎯 Future Enhancements

### Authentication & Permissions
- [ ] JWT authentication
- [ ] User registration/login
- [ ] Board-level permissions
- [ ] Team management

### Enhanced Features
- [ ] Rich text editor for descriptions
- [ ] File attachments (S3/CloudFlare R2)
- [ ] Live comments system
- [ ] @mentions & notifications
- [ ] Activity feed
- [ ] Task templates

### Advanced Views
- [ ] Calendar view
- [ ] Timeline/Gantt chart
- [ ] Table view with filters
- [ ] Dashboard with analytics

### DevOps & Scale
- [ ] Docker setup
- [ ] Redis for caching
- [ ] CDN for static assets
- [ ] E2E tests (Playwright)
- [ ] Load testing

## 🎨 Design Tokens

### Colors
- Primary Background: `bg-zinc-50/50`
- Card Background: `bg-white`
- Primary Text: `text-zinc-800`
- Secondary Text: `text-zinc-500`
- Borders: `border-zinc-200`
- Accents: `bg-zinc-900`

### Typography
- Font: Inter
- Letter Spacing: -0.015em
- Primary: 400-600 weight
- Headings: 600-700 weight

### Spacing
- Base unit: 4px (Tailwind default)
- Generous padding: `p-4`, `p-6`
- Component gaps: `gap-2`, `gap-3`

### Transitions
- Duration: 200ms
- Easing: ease-in-out
- Hover lifts: `-translate-y-0.5`
- Active scales: `scale-95`

## � Development

### Commands

**Frontend**
```bash
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
```

**Backend**
```bash
cd backend
npm run dev              # Start with nodemon (port 3001)
npm run prisma:studio    # Open database GUI
npm run prisma:migrate   # Run migrations
npm run prisma:generate  # Generate Prisma Client
```

### Best Practices

1. **Use `cn()` utility** for conditional Tailwind classes
2. **Prefer Shadcn/UI components** over custom ones
3. **Always implement optimistic updates** for user actions
4. **Add micro-interactions** to all interactive elements
5. **Test real-time features** with multiple browser windows
6. **Follow the design system** color palette & spacing
7. **Add proper error handling** with toast notifications

### Database Changes

```bash
# 1. Modify prisma/schema.prisma
# 2. Create migration
cd backend
npx prisma migrate dev --name your_change_description

# 3. Generate updated Prisma Client
npm run prisma:generate
```

## 🐛 Troubleshooting

See [SETUP.md](SETUP.md) for detailed troubleshooting.

**Quick fixes:**
- Database errors → Check PostgreSQL is running
- Port conflicts → Change PORT in backend/.env
- Module errors → `rm -rf node_modules && npm install`
- CORS errors → Verify CORS_ORIGIN matches frontend URL

## 🔗 Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/UI](https://ui.shadcn.com/)
- [dnd-kit](https://dndkit.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Prisma](https://www.prisma.io/)
- [Socket.io](https://socket.io/)
- [Express](https://expressjs.com/)

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ using modern web technologies**

A professional-grade task collaboration platform with attention to every detail - from typography to micro-interactions to real-time collaboration.

✨ **Not your typical template** - Every pixel crafted with care.
