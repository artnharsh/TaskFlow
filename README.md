# TaskFlow

![TaskFlow Banner](./frontend/public/vite.svg) <!-- Replace with actual banner if available -->

TaskFlow is a production-ready, AI-augmented, real-time collaborative Kanban board built for modern teams.

## 🚀 Vision

TaskFlow aims to bridge the gap between simple task management and intelligent project planning. It leverages real-time synchronization (via Socket.io) to ensure everyone on the team stays in sync, and deeply integrates AI (Gemini/Ollama) to autonomously break down complex goals into prioritized, actionable backlogs.

## ✨ Features

- **Real-Time Collaboration**: Changes to boards, columns, and tasks sync instantly across all connected clients.
- **AI Task Generation**: Tell the AI your sprint goal, and it will generate a complete, prioritized Kanban backlog in seconds.
- **AI Task Breakdown**: Break down complex, opaque tasks into manageable subtasks instantly.
- **Beautiful, Dynamic UI**: Built with modern aesthetics, glassmorphism, smooth micro-animations (Framer Motion), and a highly responsive drag-and-drop interface (@dnd-kit).
- **Workspace Analytics**: Comprehensive KPI dashboards and visual breakdowns of your workload.

## 🏗 Architecture

TaskFlow uses a modern, decoupled monolithic architecture:

- **Frontend (Client)**
  - **Framework**: React 19 + Vite
  - **Styling**: TailwindCSS v4 + Vanilla CSS
  - **State/Routing**: React Router DOM + Custom Context Providers
  - **Realtime**: `socket.io-client`
  - **Interactions**: `@dnd-kit` for native drag-and-drop, `framer-motion` for transitions.
  - *Modularity*: API calls are strictly decoupled inside `src/lib/api/` and complex views are broken down into small, single-responsibility components.

- **Backend (Server)**
  - **Runtime**: Node.js + Express
  - **Database**: PostgreSQL (Raw SQL queries via `pg`)
  - **Migrations**: Managed via `node-pg-migrate`
  - **Realtime**: `socket.io` for room-based WebSocket broadcasting
  - **Authentication**: JWT (JSON Web Tokens) with hashed passwords (`bcryptjs`).
  - **AI Integration**: Pluggable provider architecture (`GeminiProvider`, `OllamaProvider`) via `@google/genai`.

## 🛠 Prerequisites

Make sure you have the following installed on your local machine:
- Node.js (v18+ recommended)
- PostgreSQL (Running locally or via Docker)

## ⚙️ Setup & Installation

We provide a streamlined `Makefile` to handle all the setup heavy lifting.

### 1. Environment Configuration

Copy the example environment variables and update them with your actual Database URL and API keys.

```bash
cp backend/.env.example backend/.env
```

Ensure your `backend/.env` has:
```env
PORT=8000
DATABASE_URL=postgres://user:password@localhost:5432/taskflow
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:5173

# AI Configuration
AI_PROVIDER=gemini # or 'ollama'
GEMINI_API_KEY=your_gemini_api_key
```

### 2. Quick Start

Run the following command to install all dependencies for both frontend and backend:

```bash
make install
```

### 3. Database Initialization

Run the database migrations to set up your PostgreSQL schema:

```bash
make db-init
```

*(Optional) Seed the database with sample data:*
```bash
npm --prefix backend run db:seed
```

### 4. Run the Application

Start both the frontend and backend servers concurrently:

```bash
make start
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000/api](http://localhost:8000/api)

## 🧑‍💻 Developer Commands

The `Makefile` exposes several utility commands to ensure code quality:

- `make lint`: Run ESLint on the backend.
- `make format`: Run Prettier formatting on the backend.
- `make test`: Run backend tests (if configured).

## 🛡 License

This project is licensed under the ISC License.
