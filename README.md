# my-todo-2
my-todo 2 is the second demo project.
Allow multiple users to register and log in, and manage their own to-do list.

## Tech Stack

- Language: `TypeScript`
- Deployment target: `Vercel`

## Documentation

- Detailed development documentation: `docs/development-guide.md`

## Quick Start

1. Create `.env.local` from `.env.example` and set `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
2. Install dependencies:

```bash
npm install
```

3. Generate Prisma client:

```bash
npm run prisma:generate
```

4. Run the dev server:

```bash
npm run dev
```

## API

- Register: `POST /api/auth/register` body `{ "email": "...", "password": "..." }`
- Login: `GET /api/auth/signin` (NextAuth default UI for Credentials)
- Todos:
  - `GET /api/todos`
  - `POST /api/todos` body `{ "title": "...", "description"?: "..." }`
  - `PATCH /api/todos/:id` body `{ "title"?: "...", "description"?: "...", "status"?: "pending|completed" }`
  - `DELETE /api/todos/:id`
