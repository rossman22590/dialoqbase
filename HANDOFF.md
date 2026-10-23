# Handoff — dialoqbase (`june-2026-aitutor-sso`)

_Written 2026-10-23 from git history; the session that did this work left no notes._

## Where things stand

- Branch `june-2026-aitutor-sso` (main checkout `C:\Users\Ross\Desktop\news\dialoqbase`) and worktree branch `claude/playground-chat-redesign-39b0d4` both point at **`451d70e`**. Working trees are clean.
- `origin/june-2026-aitutor-sso` is at `95e4f48`, so **4 commits are unpushed** (`4ae9e10`, `31a41ae`, `64183f0`, `451d70e`).
- No PR is open. Fork remotes: `origin` (your fork), `upstream` (n4ze3m/dialoqbase, now archived).

## What was done (oldest → newest)

### `95e4f48` Models, pricing, billing, admin panel (pushed)
- **Models:** catalog refreshed to OpenRouter's Oct 2026 list (`server/prisma/seed.ts`, `server/src/utils/models.ts`). Schema defaults for `Bot.model` and `defaultChatModel` are now `openai/gpt-5.6-terra`.
- **Pricing:** `server/src/utils/pricing.ts` stores the provider's cost with a 1.5x markup, plus long-prompt tiers.
- **Billing:** `server/src/utils/billing.ts` and `usage-tracker.ts` bill the usage OpenRouter reports for each call, or estimate it from the text sent when there's no report. They credit-check and charge on every channel: web, playground, bot API, v1 API, OpenAI-compatible API, Telegram, Discord and WhatsApp. Transactions record the model, the channel and the OpenRouter cost.
- **Admin:** `/admin` UI (`app/ui/src/components/Admin/*`, `routes/admin/root.tsx`) is backed by `server/src/handlers/api/v1/admin/oversight.handler.ts`. It covers overview, users, bots, transactions, usage and queue. Admins can suspend or reactivate users (suspended users can't log in or use the API, and their bots stop answering; see `server/src/plugins/jwt.ts`) and grant or remove admin. Credit adjustments are logged.
- **Migrations:**
  - `20261023000000_update_models_oct_2026`: replaces the model catalog and moves bots off models that are no longer live.
  - `20261023000100_make_rcohen_admin`: makes rcohen@mytsi.org an admin.

### `4ae9e10` + `31a41ae` Playground chat redesign (unpushed)
- `app/ui/src/components/Bot/Playground/*`
  - Layout: centered message column, purple user bubbles, a bot avatar and a typing or streaming indicator.
  - Scrolling: auto-scroll that respects manual scroll-up, plus a "Jump to latest" button.
  - Composer: auto-growing, with an empty state that suggests prompts.
  - Errors: a failed reply shows inline with "Edit & retry".
- Design tokens are CSS variables with Tailwind aliases (`canvas`, `chrome`, `sidebar`, `surface`, `line`, `fg`) in `app/ui/src/index.css` and `tailwind.config.js`. The antd theme uses the same palette. Fonts are now the system UI and monospace stacks.

### `64183f0` App-wide design system (unpushed)
- Shared primitives in `app/ui/src/components/ui/index.tsx`: PageHeader, Card*, EmptyState, StatTile, Badge and Skeleton, with matching `ui-*` CSS classes.
- Shared `Layout/AppHeader.tsx` (with a credits pill), a redesigned account menu, a refined settings nav and fixes to the mobile drawer.

### `451d70e` Restyle of every page (unpushed)
- Presentation only: API calls, query keys, form rules and navigation are unchanged.
- Covers the dashboard, create bot, login/register, all bot tabs, settings, admin, loaders and the error boundary.

## Verification status

- **Server:** `tsc --noEmit` passes.
- **UI:** `yarn build` passes. The earlier `TS2786 'SyntaxHighlighter'` errors came from `app/ui/yarn.lock` pulling in a second copy of the React types (`@types/react@19` for `@types/react-syntax-highlighter`). They're fixed by a `resolutions` pin to `@types/react@^18` in `app/ui/package.json`. This fix is uncommitted in the main checkout. The Docker build uses `pnpm-lock.yaml`, which only has 18.2.67, so it shouldn't have been affected.
- **Not done:**
  - The UI hasn't been checked in a browser in this handoff.
  - The migrations haven't been confirmed as applied to any deployed database.
  - There are no tests for billing or admin (`server/test` only has route tests).

## Next steps

1. Commit the `@types/react` resolution fix (`app/ui/package.json`, `app/ui/yarn.lock`).
2. Smoke-test in the browser:
   - the playground chat (streaming, retry, mobile)
   - `/admin`
   - suspending a user
   - a billed answer on one channel, then check that the transaction row is right
3. Push the 4 commits and open a PR (or deploy) once that passes.
4. Run `prisma migrate deploy` where it's deployed; the model migration moves existing bots onto new models.
5. Optional cleanup: remove the `claude/playground-chat-redesign-39b0d4` worktree. It has nothing that isn't already on `june-2026-aitutor-sso`.
