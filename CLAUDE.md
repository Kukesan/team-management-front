# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server (port 5173, proxies `/api` to `https://localhost:5001`)
- `npm run build` — type-check (`tsc -b`) then production build
- `npm run lint` — run oxlint
- `npm run preview` — preview the production build

There is no test suite/framework configured in this repo (no test script, no test files).

## Architecture

This is a React 19 + TypeScript + Vite frontend for a weekly team status-reporting app ("Weekly Reports"), talking to an ASP.NET Core backend that is developed separately (not in this repo). The `@` alias resolves to `src/`.

### Backend contract is inferred, not authoritative

The backend's exact DTO shapes were not fully specified when this app was built. Look for `ASSUMPTION:` / `TRADEOFF:` comments in `src/lib/http.ts`, `src/types/index.ts`, `src/api/*.ts`, and `vite.config.ts` — they document guessed conventions (base URL, error envelope shape, endpoint paths). When backend behavior turns out to differ, only files under `src/api/` and `src/types/` should need to change; UI code consumes the mapped/normalized shapes, never raw DTOs.

A recurring pattern: the backend returns `fullName` + `roles[]`, but the app's internal `User` type uses `name` + a single `role`. Each `src/api/*.ts` module maps the raw response DTO to the app's internal type at the API boundary (e.g. `mapUser` in `src/api/users.ts`, `mapAuthUser` in `src/api/auth.ts`) using `ROLE_PRIORITY` to collapse a roles array into the highest-priority single role. Follow this same map-at-the-boundary pattern for any new endpoint whose response shape differs from the internal type.

### Layering

- `src/api/*.ts` — one module per resource (`auth`, `users`, `projects`, `reports`, `dashboard`), each exporting a `xxxApi` object of thin functions wrapping `http` (the shared axios instance from `src/lib/http.ts`). This is the only layer allowed to know about raw backend DTO shapes.
- `src/types/index.ts` — all shared types in one file: app-internal types plus the raw `*Response` DTOs the API layer maps from.
- `src/features/<feature>/` — page components, feature-local schemas (zod, via `react-hook-form` + `@hookform/resolvers`), and feature-local state (e.g. `authStore.ts`). Feature folders mirror route groupings: `auth`, `reports`, `review`, `dashboard`, `projects`, `users`, `profile`.
- `src/components/` — shared, feature-agnostic components (`DataTable`, `EditableTable`, `RepeatableList`, `StatusBadge`, `EmptyState`, `ErrorState`) plus `components/ui/` which holds shadcn/Radix-style primitives (button, dialog, select, etc.).
- `src/routes/` — router setup and route guards (see below).
- `src/lib/` — cross-cutting utilities: `http.ts` (axios instance + interceptors), `queryClient.ts` (React Query client + centralized `queryKeys` factory), `utils.ts` (`cn` classname helper), `format.ts`.

### Data fetching and server state

React Query (`@tanstack/react-query`) owns all server state; `src/lib/queryClient.ts` exports both the `QueryClient` and a `queryKeys` factory object that every feature must use to build query keys, so invalidations stay consistent across features. Do not hand-roll query keys inline.

### Auth and routing

- `src/features/auth/authStore.ts` is a zustand store (persisted to localStorage) holding **only** the JWT and current user — session state. Server data always lives in React Query, never in this store. Read the store's own comment for the tradeoff behind persisting the raw JWT to localStorage (XSS exposure vs. avoiding a backend refresh-cookie endpoint that doesn't exist yet).
- `src/lib/http.ts` attaches the bearer token to every request and, on a 401 from a non-auth endpoint, clears the session and hard-redirects to `/login`.
- Route protection is layered in `src/routes/router.tsx`: `ProtectedRoute` (must be authenticated) wraps `AppLayout`, which wraps `RoleRoute` (role allowlist, e.g. `['Manager', 'Admin']` or `['Admin']`) around role-gated route groups. `src/hooks/useAuth.ts` exposes `useAuth()` (session/login/logout) and `useRole()` (role booleans) built on top of the zustand store.
- Roles are `TeamMember | Manager | Admin`. Review queue, team dashboard, and projects require Manager/Admin; user management requires Admin.

### Forms

Feature forms use `react-hook-form` with a zod schema per feature (`src/features/<feature>/schemas.ts`) wired through `@hookform/resolvers`. Follow the existing schema files (e.g. `src/features/reports/schemas.ts`) for how nested array fields (tasks, blockers, achievements, hours breakdown) are modeled and given client-generated `id`s (`crypto.randomUUID()`) for list rendering.
