# DevOps Task Manager Project

A full-stack task management application built with React, Node.js, Express, PostgreSQL, and Prisma. This project is designed to demonstrate DevOps practices including containerization, CI/CD, and orchestration.

## Tech Stack

### Frontend
- React 19
- React Router v7
- Axios
- Tailwind CSS
- Vite
- Lucide React (icons)

### Backend
- Node.js
- Express 5
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcryptjs

## Project Structure

```
DevOps-Project/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── index.js     # Entry point
│   │   ├── lib/         # Database connection
│   │   ├── middleware/  # Authentication middleware
│   │   └── routes/      # API routes
│   ├── prisma/          # Database schema
│   ├── Dockerfile       # Backend container
│   └── package.json
├── frontend/            # React application
│   ├── src/
│   │   ├── components/
│   │   ├── context/     # Auth context
│   │   ├── pages/       # Login, Register, Dashboard
│   │   └── App.jsx
│   ├── Dockerfile       # Frontend container
│   ├── nginx.conf       # Nginx configuration
│   └── package.json
└── docker-compose.yml   # Multi-container orchestration
```

## Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- pnpm (package manager)

## Quick Start with Docker

1. **Clone the repository**
   ```bash
   cd /home/yassineamjad/Desktop/DevOps-Project
   ```

2. **Start all services**
   ```bash
   ./setup.sh
   ```

## Local Development Setup

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start PostgreSQL with Docker**
   ```bash
   docker-compose up -d postgres
   ```

5. **Generate Prisma Client and push schema**
   ```bash
   pnpm prisma generate
   pnpm prisma:push
   ```

6. **Start the backend server**
   ```bash
   pnpm dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - The Vite proxy will forward API requests to http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Tasks
- `GET /api/tasks` - Get all user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/taskdb"
PORT=5000
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

