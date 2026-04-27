# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

# Project-Specific Guidelines

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Commands

```bash
npm install
npm run dev        # dev server on port 3000
npm run build      # production build
npm run typecheck  # TypeScript check (tsc --noEmit); no lint/format tooling configured
```

---

## Architecture

**Stack:** Next.js 14 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui components.

### Request flow

Chat messages go through two hops:
1. `ChatWindow` → `POST /api/chat` (Next.js route at `src/app/api/chat/route.ts`)
2. The route handler pipes the request to `BACKEND_URL/v1/chat/completions` (default `http://localhost:8857`) and streams the SSE response back verbatim.

Model list is fetched client-side by `useModels` hook via `GET /v1/models?detailed=true`, which Next.js rewrites directly to the backend (configured in `next.config.js`).

### i18n

Locale is read from a `locale` cookie at request time (`src/i18n/request.ts`). Translation files live in `messages/{en,vi,ja}.json`. Components call `useTranslations()` from `next-intl`. The locale cookie must be set by the UI — there is no URL-based routing.

### Styling

Tailwind v4 is used without a `tailwind.config.*` file. Theme tokens are CSS custom properties defined in `src/styles/globals.css` under `:root` and `.dark`. Shadcn/ui components live in `src/components/ui/`.

### Environment variables

- `BACKEND_URL` — backend origin for the `POST /api/chat` route handler (server-side only). Defaults to `http://localhost:8857`.

### Key types (`src/types.ts`)

- `Message` — `{ role, content, model? }`
- `Conversation` — `{ id, title, messages[] }`
- `BackendModel` — shape returned by `GET /v1/models?detailed=true`, includes `type` (`routing_profile` | `model` | `alias`), `capabilities`, and availability fields.
