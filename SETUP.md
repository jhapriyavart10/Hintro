# 🚀 Complete Setup Guide

This guide will walk you through setting up the entire Hintro AI Task Collaboration Platform.

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL 14+ ([Download](https://www.postgresql.org/download/))
- Git ([Download](https://git-scm.com/downloads))

## Quick Start (5 minutes)

### 1. Install Frontend Dependencies

```bash
# In the root directory
npm install
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 3. Set Up PostgreSQL Database

#### Windows (using PowerShell)

```powershell
# If PostgreSQL is not installed, download from:
# https://www.postgresql.org/download/windows/

# Create the database
psql -U postgres
CREATE DATABASE hintro_ai;
\q
```

#### Mac (using Homebrew)

```bash
# Install PostgreSQL
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb hintro_ai
```

#### Linux (Ubuntu/Debian)

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql

# Create database
sudo -u postgres createdb hintro_ai
```

### 4. Configure Environment Variables

#### Frontend (.env in root)

```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

#### Backend (backend/.env)

```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://postgres:password@localhost:5432/hintro_ai?schema=public"
CORS_ORIGIN=http://localhost:5173
```

⚠️ **Important**: Replace `password` with your PostgreSQL password!

### 5. Run Prisma Migrations

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Create database tables
npm run prisma:migrate

cd ..
```

### 6. Start Both Servers

#### Option A: Run in Separate Terminals

**Terminal 1 (Frontend)**
```bash
npm run dev
```

**Terminal 2 (Backend)**
```bash
cd backend
npm run dev
```

#### Option B: Using PowerShell (Windows)

```powershell
# Start backend in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Start frontend
npm run dev
```

### 7. Open the Application

Visit **http://localhost:5173** in your browser!

## 🎨 What You'll See

Upon opening, you'll see a professional Kanban board with:

- ✅ **Product Roadmap** board with sample tasks in 4 lists
- ✅ **Drag-and-drop** functionality
- ✅ **Real-time updates** (try opening in 2 browser windows!)
- ✅ **Smooth animations** when tasks are moved
- ✅ **Task details modal** (click any task)
- ✅ **Collapsible sidebar**

## 🧪 Testing Real-Time Features

1. Open the app in **two browser windows** side-by-side
2. In one window, drag a task to a different list
3. Watch it animate with a yellow flash in the other window! ✨

## 📁 Project Structure

```
hintro-ai/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── routes/
│   │   ├── boards.js          # Board API endpoints
│   │   ├── lists.js           # List API endpoints
│   │   └── tasks.js           # Task API endpoints
│   ├── socket/
│   │   └── index.js           # WebSocket handlers
│   ├── db/
│   │   └── prisma.js          # Prisma client
│   └── server.js              # Express server
├── src/
│   ├── components/
│   │   ├── ui/                # Shadcn components
│   │   ├── Board.jsx          # Main board
│   │   ├── List.jsx           # Column component
│   │   ├── TaskCard.jsx       # Task card
│   │   ├── TaskModal.jsx      # Task details
│   │   └── Layout.jsx         # App layout
│   ├── store/
│   │   ├── useBoardStore.js   # Board state
│   │   └── useUIStore.js      # UI state
│   ├── services/
│   │   ├── api.js             # API client
│   │   └── socket.js          # Socket.io client
│   ├── hooks/
│   │   └── useSocket.js       # Socket hook
│   └── App.jsx
└── README.md
```

## 🛠 Common Issues & Solutions

### Issue: "Database connection failed"

**Solution:**
1. Ensure PostgreSQL is running
2. Check your `DATABASE_URL` in `backend/.env`
3. Verify database exists: `psql -U postgres -l`

### Issue: "Port 3001 already in use"

**Solution:**
Change the port in `backend/.env`:
```env
PORT=3002
```
And update frontend `.env`:
```env
VITE_API_URL=http://localhost:3002/api
VITE_SOCKET_URL=http://localhost:3002
```

### Issue: "Module not found" errors

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Also in backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Issue: Frontend can't connect to backend

**Solution:**
1. Check that backend is running on port 3001
2. Verify CORS settings in `backend/server.js`
3. Check browser console for errors

## 🎯 Next Steps

### Add Authentication
- Implement JWT authentication
- Add user registration/login
- Secure API endpoints

### Enhance Features
- Add file attachments to tasks
- Implement comments system
- Add activity feed
- Create board templates

### Deploy
- Frontend: Vercel, Netlify, or Cloudflare Pages
- Backend: Railway, Render, or Heroku
- Database: Supabase, Railway, or Amazon RDS

## 📚 Technologies Used

- **Frontend**: React 18, Vite, Tailwind CSS, Shadcn/UI
- **State**: Zustand
- **Drag & Drop**: @dnd-kit
- **Real-time**: Socket.io
- **Backend**: Node.js, Express
- **Database**: PostgreSQL, Prisma ORM
- **Icons**: Lucide React
- **Notifications**: Sonner

## 🤝 Development Workflow

### Adding a New Feature

1. **Plan** - Update the Zustand store if needed
2. **UI** - Create/update components
3. **API** - Add backend endpoints
4. **Socket** - Add real-time events if needed
5. **Test** - Test with multiple browser windows

### Database Changes

```bash
# Make changes to schema.prisma
# Then run:
cd backend
npm run prisma:migrate
```

## 🔧 Useful Commands

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend
```bash
npm run dev              # Start dev server
npm run prisma:studio    # Open database GUI
npm run prisma:migrate   # Run migrations
```

## 🆘 Need Help?

- Check the [Backend README](backend/README.md) for detailed API docs
- Review component files for usage examples
- Inspect browser console and network tab

## 📄 License

This project is for educational purposes.

---

Built with ❤️ using modern web technologies
