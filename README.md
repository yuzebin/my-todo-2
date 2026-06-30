# my-todo-2

Multi-user to-do list app: users can register, log in, and manage their own to-do items.

## Tech Stack

- Language: TypeScript
- Framework: Next.js (App Router)
- Database: Postgres (via Prisma)
- Deployment target: Vercel

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create `.env.local` based on `.env.example`:

```bash
cp .env.example .env.local
```

Set:

- `DATABASE_URL`
- `SESSION_SECRET`

### 3) Initialize the database

```bash
npx prisma migrate dev
```

### 4) Run the dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Documentation

- Detailed development documentation: `docs/development-guide.md`
