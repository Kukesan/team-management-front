# team-management-front

React 19 + TypeScript + Vite frontend for the Weekly Report Generator & Team Dashboard
app: team members submit weekly status reports, managers review/approve them, and a
team dashboard gives managers submission tracking and visual insights. Talks to an
ASP.NET Core backend (`team-management-api`, separate repo) over a REST API, which in
turn proxies AI chat/summary/help features to a FastAPI service (`team-management-ai`,
also separate). See [CLAUDE.md](CLAUDE.md) for the frontend's architecture in depth.

This is one of three repositories that make up the full application:

| Repo | What it is |
| --- | --- |
| `team-management-front` (this repo) | Frontend — React/Vite |
| `team-management-api` | Backend — ASP.NET Core REST API + PostgreSQL |
| `team-management-ai` | AI chat/summary/help — FastAPI, called by the backend |

To run the whole app locally you need all three running together (see below); the
frontend alone will load but every API call will fail without a running backend.

## Prerequisites

- Node.js 20+ and npm
- A running `team-management-api` instance — see that repo's README for installing its
  dependencies, running its database migrations, and starting it

## 1. Install dependencies

```bash
npm install
```

## 2. Configure the API URL

```bash
cp .env.example .env
```

By default `VITE_API_BASE_URL` is unset and requests go to the same-origin `/api` path,
proxied by the Vite dev server to `https://localhost:7058` (see `vite.config.ts` —
matches `team-management-api`'s default dev port). If your backend runs somewhere else,
set `VITE_API_BASE_URL` in `.env` instead of relying on the proxy.

## 3. Run the backend (and its database)

This repo doesn't contain the backend or database. In a sibling checkout of
`team-management-api`, follow its README to install dependencies, apply EF Core
migrations against a PostgreSQL database, and run it — by default it listens on
`https://localhost:7058`.

(Optional) For the AI Assistant page and the "?" help widget to work, also run
`team-management-ai` per its own README and wire its URL/internal key into
`team-management-api`'s config, as that README describes.

## 4. Run the frontend

```bash
npm run dev
```

Opens on `http://localhost:5173`. Log in with one of the demo accounts seeded by
`team-management-api` in Development (see that repo's README) — e.g.
`alice@teammanagement.local` / `Password123` (TeamMember) or
`carol.manager@teammanagement.local` / `Password123` (Manager), or the bootstrap admin
account it seeds.

## Other scripts

```bash
npm run build     # type-check (tsc -b) then production build
npm run preview   # preview the production build
npm run lint      # oxlint
```

There is no test suite/framework configured in this repo.

## Project structure

```
src/
  api/          one module per resource (auth, users, projects, reports, dashboard, ai) —
                the only layer that knows about raw backend DTO shapes
  types/        shared app-internal types + the raw backend *Response DTOs
  features/     page components + feature-local schemas/state, one folder per route group
                (auth, reports, review, dashboard, projects, users, profile, chat)
  components/   shared, feature-agnostic components + components/ui/ (shadcn-style
                primitives)
  routes/       router setup and role-based route guards
  lib/          cross-cutting utilities: http client, React Query client, formatting
```

See [CLAUDE.md](CLAUDE.md) for the full architecture writeup, including how the
`ASSUMPTION:`/`TRADEOFF:` comments in `src/lib/http.ts`, `src/types/index.ts`, and
`src/api/*.ts` document places where the backend contract was inferred rather than
specified.
