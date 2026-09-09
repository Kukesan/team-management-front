# AI Help Assistant — Knowledge Base

Source content for the `/ai/help` "how do I...?" assistant (see [HelpWidget.tsx](../../src/components/HelpWidget.tsx),
[ai.ts](../../src/api/ai.ts)). That endpoint is served by the backend (not in this repo) and is described as
"open to all roles, static product docs, no DB access" — these files are that static product documentation,
written from what the frontend actually implements today.

This is **not** consumed directly by the frontend at runtime. It's meant to be loaded by the backend into
whatever the `/ai/help` handler uses as its knowledge source (a system prompt, a RAG index, etc.). Keep it in
this repo because the frontend is the source of truth for what UI/flows actually exist — update these files
whenever a feature they describe changes shape.

## Files

- [`common.md`](common.md) — applies to every role (TeamMember, Manager, Admin): login, navigation, profile,
  password, report statuses/lifecycle.
- [`team-member.md`](team-member.md) — writing and submitting weekly reports, handling "Needs Correction".
- [`manager.md`](manager.md) — everything in `team-member.md` plus review queue, team dashboard, projects,
  member assignment, AI Assistant (chat/summary).
- [`admin.md`](admin.md) — everything in `manager.md` plus user management (invite, roles, removal).

## How to scope by role

Roles are `TeamMember | Manager | Admin` (see [`src/types/index.ts`](../../src/types/index.ts)) and are
strictly additive — a Manager can do everything a TeamMember can, and an Admin everything a Manager can
(see the route guards in [`router.tsx`](../../src/routes/router.tsx)). So the backend can build each role's
effective knowledge base by concatenating:

- TeamMember → `common.md` + `team-member.md`
- Manager → `common.md` + `team-member.md` + `manager.md`
- Admin → `common.md` + `team-member.md` + `manager.md` + `admin.md`

If the assistant is given the asking user's role, it should only answer from that role's effective set, and
say a feature isn't available to them rather than describing Manager/Admin-only flows to a TeamMember.

## Maintenance

`ASSUMPTION:`/`TRADEOFF:` comments in `src/lib/http.ts`, `src/types/index.ts`, and `src/api/*.ts` document
places where the backend contract is inferred — this knowledge base describes the frontend's behavior, which
is authoritative for "how do I do X in the app" regardless of backend DTO details.
