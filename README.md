# Hintro AI - Real-Time Collaboration Platform

Hintro AI is a production-ready, real-time task management platform inspired by the best features of Trello, Notion, and Linear. It features a high-performance Kanban board with optimistic UI updates, live collaboration via WebSockets, and a robust backend architecture.

## 🏗 Architecture

Hintro AI follows a Client-Server architecture decoupled by a REST API and a real-time WebSocket layer.

### Frontend (Client)

- **Framework**: React 18 + Vite (for ultra-fast HMR).
- **State Management**: Zustand. We use a global store to manage board state and implement **Optimistic UI Updates**. When a user moves a task, the UI updates instantly before the server responds. If the server request fails, the state automatically reverts.
- **Styling**: Tailwind CSS + Shadcn/UI for a clean, accessible, and professional design system (Zinc palette).
- **Drag & Drop**: @dnd-kit/core for accessible, keyboard-friendly drag interactions.

### Backend (Server)

- **Runtime**: Node.js + Express.
- **Database**: PostgreSQL accessed via Prisma ORM for type-safe queries.
- **Real-Time Layer**: Socket.io. The server acts as a broadcaster. When an event occurs (e.g., `task:moved`), it validates the action, updates the DB, and broadcasts the event to all other clients in the specific `boardId` room.

### Data Flow

1. **User Action**: User drags a task.
2. **Optimistic Update**: Frontend store updates immediately.
3. **API Call**: REST Request (PATCH /tasks/:id/move) sent to server.
4. **Persistence**: Server updates PostgreSQL.
5. **Broadcast**: Server emits `task:moved` via Socket.io.
6. **Sync**: Other connected clients receive the event and animate the change.

## 🚀 Setup Instructions

### Prerequisites

- Node.js: v18 or higher
- PostgreSQL: v14 or higher
- Git

### 1. Clone & Install

```bash
git clone <repository-url>
cd hintro-ai

# Install Frontend Dependencies
npm install

# Install Backend Dependencies
cd backend
npm install
```

### 2. Database Configuration

Ensure your PostgreSQL service is running. Create a new database:

```bash
# Terminal / Command Prompt
createdb hintro_ai
```

### 3. Environment Variables

Create a `.env` file in the **backend** folder:

```
# backend/.env
PORT=3001
# Replace 'password' with your actual Postgres password
DATABASE_URL="postgresql://postgres:password@localhost:5432/hintro_ai?schema=public"
JWT_SECRET="your-super-secret-key-change-this"
CORS_ORIGIN="http://localhost:5173"
```

Create a `.env` file in the **root** folder:

```
# .env (Frontend)
VITE_API_URL="http://localhost:3001/api"
VITE_SOCKET_URL="http://localhost:3001"
```

### 4. Database Migration

Apply the Prisma schema to your database:

```bash
cd backend
npm run prisma:migrate
# Optional: Seed data if you have a seed script
# npm run prisma:seed 
cd ..
```

### 5. Run the Application

You need two terminal windows running simultaneously.

**Terminal 1 (Backend)**:

```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend)**:

```bash
npm run dev
```

Visit http://localhost:5173 to use the app.

## 🔑 Demo Credentials

Since this is a self-hosted setup, there are no pre-seeded users by default. You can create your own account instantly:

1. **Open App**: Go to http://localhost:5173
2. **Sign Up**: Click "Sign up" toggle.
3. **Email**: demo@hintro.com
4. **Password**: password123
5. **Name**: Demo User

**Note**: Upon registration, a "My First Board" is automatically created for you.

## 📖 API Documentation

The backend exposes a RESTful API at http://localhost:3001/api. All protected routes require a `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Create a new user & default board. |
| POST | /auth/login | Authenticate and receive JWT. |

### Boards

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /boards | Fetch all boards the user is a member of. |
| POST | /boards | Create a new board. |
| GET | /boards/:id | Get full board data (Lists, Tasks, Members). |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /tasks | Create a task in a list. |
| PATCH | /tasks/:id | Update task details (title, priority, assignee). |
| PATCH | /tasks/:id/move | Move task between lists (updates position). |
| DELETE | /tasks/:id | Delete a task. |

### Comments & Activity

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /comments/:taskId | Fetch conversation history for a task. |
| POST | /comments | Post a new comment. |
| GET | /activity/:boardId | Fetch paginated activity logs for the board. |

## ⚖️ Assumptions & Trade-offs

### Assumptions

- **Trust Environment**: The app assumes logged-in users are trusted members of the board. While basic role checks exist, granular permissions (e.g., "Viewer" vs "Editor") are not fully enforced on every route for simplicity.
- **Single Region**: The WebSocket server is a single instance. For a global scale, a Redis adapter would be needed to sync events across multiple server instances.
- **Data Volume**: Lists will typically contain <100 tasks. Virtualization is not implemented on the lists, so performance might degrade with thousands of tasks per list.

### Trade-offs

- **Optimistic UI vs. Consistency**:
  - **Choice**: We prioritized speed. The UI updates instantly.
  - **Trade-off**: In rare cases of server failure, the UI might "snap back" to the previous state, which can be jarring for the user. We mitigate this with toast error notifications.

- **Authentication**:
  - **Choice**: Standard JWT stored in localStorage.
  - **Trade-off**: Vulnerable to XSS attacks if the app runs malicious scripts. A production version would use httpOnly cookies for better security.

- **Database Polling vs. Sockets**:
  - **Choice**: We use Sockets for "live" updates but HTTP for initial data fetching.
  - **Trade-off**: This adds complexity (maintaining two data paths) but ensures data integrity and cacheability of the initial load.

- **Drag and Drop Library**:
  - **Choice**: @dnd-kit over react-beautiful-dnd.
  - **Trade-off**: @dnd-kit is more modern and accessible but has a steeper learning curve and required custom collision detection logic for the Kanban board layout.

## 🛠 Tech Stack Details

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | React + Vite | Industry standard, massive ecosystem, high performance. |
| Styling | Tailwind CSS | Rapid UI development, consistent design system. |
| Components | Shadcn/UI | Accessible, copy-paste components that are easily customizable. |
| Database | PostgreSQL | Robust relational data integrity (ACID compliance). |
| ORM | Prisma | Best-in-class developer experience and type safety. |
| Real-time | Socket.io | Reliable fallback mechanisms (WebSocket -> Polling) ensuring connectivity. |
