# TaskFlow (pnpm Monorepo + TypeScript)

![TaskFlow Banner](./apps/web/public/vite.svg)

TaskFlow is a production-ready, AI-augmented, real-time collaborative Kanban board built for modern engineering teams.

## 🚀 Architecture Overview

TaskFlow is structured as a **Type-Safe Monorepo** using `pnpm` Workspaces and **TypeScript**:

```text
TaskFlow/
├── apps/
│   ├── web/        # React 19 + Vite + TailwindCSS frontend (@taskflow/web)
│   └── api/        # Node.js + Express + PostgreSQL backend (@taskflow/api)
├── packages/
│   └── types/      # Shared TypeScript interfaces & Socket event maps (@taskflow/types)
├── .husky/         # Pre-commit hooks (Typecheck + Lint-staged)
├── pnpm-workspace.yaml
└── package.json
```

### Key Technical Highlights

- **Shared Types (`@taskflow/types`)**: The frontend and backend consume identical entity definitions (`Board`, `Task`, `Column`, `User`, `SocketEvents`), ensuring full contract synchronization.
- **Pluggable AI Providers**: Abstract AI Provider pattern supporting **Gemini** (`@google/genai`) and local **Ollama** LLMs seamlessly.
- **Real-Time Synchronized Canvas**: Websocket room architecture via `socket.io` broadcasting board events in real-time.
- **Database Migrations**: `node-pg-migrate` managing SQL schema migrations reproducibly.
- **Pre-commit Quality Gate**: Automated pre-commit hooks (`husky` + `lint-staged`) enforcing `pnpm typecheck` and `prettier` formatting before code lands in git.

---

## 🛠 Prerequisites

Make sure you have the following installed:

- **Node.js**: v18+
- **pnpm**: v9+ (`npm i -g pnpm`)
- **PostgreSQL**: Running locally or via Docker

---

## ⚙️ Quick Start

### 1. Environment Setup

Copy the example environment file into `apps/api/.env`:

```bash
cp apps/api/.env.example apps/api/.env
```

### 2. Monorepo Installation

Install all workspace dependencies, link internal packages (`@taskflow/types`), and set up pre-commit hooks:

```bash
pnpm install
```

### 3. Database Migration

Run migrations to provision your PostgreSQL database:

```bash
pnpm db:init
```

### 4. Start Development Applications

Launch both frontend and backend concurrently:

```bash
pnpm dev
# OR
pnpm start
```

- **Web Frontend**: [http://localhost:5173](http://localhost:5173)
- **API Backend**: [http://localhost:8000/api](http://localhost:8000/api)

---

## 🧑‍💻 Monorepo Scripts Reference

All developer commands are available directly via `pnpm`:

- `pnpm dev`: Run development servers in parallel across all apps.
- `pnpm build`: Build production output bundles across all apps and packages.
- `pnpm typecheck`: Run workspace-wide TypeScript typechecking (`tsc --noEmit`).
- `pnpm lint`: Run ESLint across all workspace projects.
- `pnpm format`: Auto-format entire codebase using Prettier.
- `pnpm db:init`: Run database migrations up to date.
- `pnpm db:rollback`: Rollback the latest migration.
