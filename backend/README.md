# Backend Setup Instructions

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- npm or yarn package manager

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Configure PostgreSQL

### Option A: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a new database:

```sql
CREATE DATABASE hintro_ai;
```

3. Update the `.env` file with your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/hintro_ai?schema=public"
```

### Option B: Using Docker

```bash
docker run --name hintro-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=hintro_ai -p 5432:5432 -d postgres:14
```

## Step 3: Run Prisma Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations to create database tables
npm run prisma:migrate

# (Optional) Open Prisma Studio to view your database
npm run prisma:studio
```

## Step 4: Start the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3001`

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (GUI for database)

## API Endpoints

### Boards
- `GET /api/boards` - Get all boards
- `GET /api/boards/:id` - Get single board
- `POST /api/boards` - Create board
- `PATCH /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board

### Lists
- `POST /api/lists` - Create list
- `PATCH /api/lists/:id` - Update list
- `DELETE /api/lists/:id` - Delete list

### Tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/move` - Move task to different list
- `DELETE /api/tasks/:id` - Delete task

### WebSocket Events

#### Client → Server
- `board:join` - Join a board room
- `board:leave` - Leave a board room
- `cursor:move` - Update cursor position
- `task:dragging` - Task being dragged
- `task:typing` - User typing in task

#### Server → Client
- `user:joined` - User joined board
- `user:left` - User left board
- `task:created` - New task created
- `task:updated` - Task updated
- `task:moved` - Task moved (with animation)
- `list:created` - New list created
- `board:updated` - Board updated

## Troubleshooting

### Database Connection Issues

If you see connection errors:

1. Ensure PostgreSQL is running:
   ```bash
   # Windows
   pg_ctl status
   
   # Linux/Mac
   sudo service postgresql status
   ```

2. Verify your DATABASE_URL in `.env`

3. Check PostgreSQL logs for errors

### Port Already in Use

If port 3001 is already in use:

1. Change the PORT in `.env`:
   ```env
   PORT=3002
   ```

2. Update frontend `.env` to match:
   ```env
   VITE_API_URL=http://localhost:3002/api
   VITE_SOCKET_URL=http://localhost:3002
   ```

### Prisma Issues

Reset the database (⚠️ This deletes all data):
```bash
npx prisma migrate reset
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Server
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/hintro_ai?schema=public"

# CORS
CORS_ORIGIN=http://localhost:5173
```
