# Handoff — dialoqbase (`june-2026-aitutor-sso`)

_Written 2026-10-23 from git history; the session that did the original work left no notes. Updated the same day after a review and fixes._

## Where things stand

- Branch `june-2026-aitutor-sso` in the main checkout (`C:\Users\Ross\Desktop\news\dialoqbase`). The working tree is clean.
- `origin/june-2026-aitutor-sso` is at `95e4f48`, so **everything from `4ae9e10` onward is unpushed**, including this handoff.
- No PR is open. Fork remotes: `origin` (your fork), `upstream` (n4ze3m/dialoqbase, now archived).
- The worktree branch `claude/playground-chat-redesign-39b0d4` stopped at `451d70e`; everything after that is only on `june-2026-aitutor-sso`.

## What was done (oldest → newest)

### `95e4f48` Models, pricing, billing, admin panel (pushed)
- **Models:** catalog refreshed to OpenRouter's Oct 2026 list (`server/prisma/seed.ts`, `server/src/utils/models.ts`). Schema defaults for `Bot.model` and `defaultChatModel` are now `openai/gpt-5.6-terra`.
- **Pricing:** `server/src/utils/pricing.ts` stores the provider's cost with a 1.5x markup, plus long-prompt tiers.
- **Billing:** `server/src/utils/billing.ts` and `usage-tracker.ts` bill the usage OpenRouter reports for each call, or estimate it from the text sent when there's no report. They credit-check and charge on every channel: web, playground, bot API, v1 API, OpenAI-compatible API, Telegram, Discord and WhatsApp. Transactions record the model, the channel and the OpenRouter cost.
- **Admin:** `/admin` UI (`app/ui/src/components/Admin/*`, `routes/admin/root.tsx`) is backed by `server/src/handlers/api/v1/admin/oversight.handler.ts`. It covers overview, users, bots, transactions, usage and queue. Admins can suspend or reactivate users (suspended users can't log in or use the API, and their bots stop answering; see `server/src/plugins/jwt.ts`) and grant or remove admin. Credit adjustments are logged.
- **Migrations:**
  - `20261023000000_update_models_oct_2026`: replaces the model catalog and moves bots off models that are no longer live.
  - `20261023000100_make_rcohen_admin`: makes rcohen@mytsi.org an admin.

### `4ae9e10` + `31a41ae` Playground chat redesign
- `app/ui/src/components/Bot/Playground/*`
  - Layout: centered message column, purple user bubbles, a bot avatar and a typing or streaming indicator.
  - Scrolling: auto-scroll that respects manual scroll-up, plus a "Jump to latest" button.
  - Composer: auto-growing, with an empty state that suggests prompts.
  - Errors: a failed reply shows inline with "Edit & retry".
- Design tokens are CSS variables with Tailwind aliases (`canvas`, `chrome`, `sidebar`, `surface`, `line`, `fg`) in `app/ui/src/index.css` and `tailwind.config.js`. The antd theme uses the same palette. Fonts are now the system UI and monospace stacks.

### `64183f0` App-wide design system
- Shared primitives in `app/ui/src/components/ui/index.tsx`: PageHeader, Card*, EmptyState, StatTile, Badge and Skeleton, with matching `ui-*` CSS classes.
- Shared `Layout/AppHeader.tsx` (with a credits pill), a redesigned account menu, a refined settings nav and fixes to the mobile drawer.

### `451d70e` Restyle of every page
- Presentation only. The review confirmed that API calls, query keys and form field names are identical before and after.
- Covers the dashboard, create bot, login/register, all bot tabs, settings, admin, loaders and the error boundary.

### `7806b47` UI build fix
- `app/ui/yarn.lock` pulled in a second copy of the React types (`@types/react@19`, via `@types/react-syntax-highlighter`), which broke `yarn build` with `TS2786 'SyntaxHighlighter'` errors.
- A `resolutions` pin in `app/ui/package.json` keeps them at `@types/react@^18`.
- The Docker build uses `pnpm-lock.yaml`, which only has one copy, so it probably wasn't affected.

### `462bc98` Billing fixes (from review)
- A bot no longer answers once its owner's balance is **0 or below**. Before, it only stopped below 0.
- New `answerWithBilling` in `billing.ts` wraps the chain call and charges as soon as it finishes, before history is saved. If the chain fails after an OpenRouter call succeeded, that call is still charged, and the transaction description ends with "(failed)". If no call succeeded, nothing is charged.
- All 11 places a bot answers use it.

### `6967cfb` Admin and playground fixes (from review)
- **Credit adjustments:** the balance change and its audit row are saved in one transaction.
- **Error replies:** suspending or changing admin access for an unknown user returns 404, and retrying a job that hasn't failed returns 400. Both used to return a server error.
- **Own-key check:** the admin bots list uses the shared `usesOwnKey` helper, the same one billing uses.
- **Playground sources:** the playground reuses the documents the chain already retrieved instead of searching twice. If the chain never reached the search step, it falls back to searching as before. The sources shown now match what the answer used.
- **Playground scrolling:** the chat only stops following the reply when the user scrolls up.

## Verification status

- **Server:** `tsc --noEmit` passes.
- **UI:** `yarn build` passes.
- **Throwaway tests (not kept in the repo):** checks with a fake database and a mocked OpenRouter covered:
  - billing: the zero-balance block, charging on success, charging on failure after a call, and no charge when no call ran
  - admin: the single transaction, the 404 and 400 replies
- **Not done:**
  - Nothing has been checked in a browser or against real OpenRouter.
  - The migrations haven't been confirmed as applied to any deployed database.
  - There are no committed tests for billing or admin (`server/test` only has route tests).

## Next steps

1. Smoke-test in the browser:
   - **Playground:** streaming, "Edit & retry", scroll following, mobile, and that sources still show.
   - **`/admin`:** every tab, suspending a user, adjusting credits.
   - **Billing:** send one real message and check the transaction row.
2. Push the branch and open a PR (or deploy) once that passes.
3. Run `prisma migrate deploy` where it's deployed. The model migration moves existing bots onto new models, so check which bots it will move first.
4. Optional: turn the throwaway billing and admin checks into real tests under `server/test`.
5. Optional cleanup: remove the `claude/playground-chat-redesign-39b0d4` worktree.
