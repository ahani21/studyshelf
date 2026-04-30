# SKILL: Build StudyShelf

**Trigger this skill when:** the user asks to build, extend, or modify StudyShelf — the knowledge synthesis and resource management platform with spaced repetition.

**Do NOT trigger this skill for:** generic Next.js/Supabase tasks unrelated to StudyShelf, or for other products (ForgeTrack has its own skill).

---

## 0. How to Use This Skill

You are building StudyShelf. Three source-of-truth documents govern this build:

1. **`StudyShelf_Spec_Sheet.md`** — defines *what* to build: features, data model, constraints, acceptance criteria. This is the **product spec**.
2. **`StudyShelf_Design_System.md`** — defines *how it looks*: tokens, components, screen-level application. This is the **visual spec**.
3. **This file** — defines the *build process*: the order, checkpoints, prompting discipline, and anti-patterns.

When these three documents conflict: **spec > design system > skill**. Flag the conflict to the user before proceeding.

**Operating principles:**
- **Build in phases, never all at once.** Each phase has a validation gate. Do not start phase N+1 until phase N's gate passes.
- **Every prompt includes the relevant excerpt from spec + design system.** Do not rely on memory.
- **Ship the database before the UI.** Schema is ground truth. UI built before its schema is throwaway work.
- **SRS is the core feature — build it early, test it deeply.** Do not leave it for last.
- **Multi-tenancy is enforced at the database level, not just the UI.** RLS policies are non-negotiable.
- **Mobile-first.** Users review resources on their phones during commutes. A broken 375px layout is a broken product.
- **No lorem ipsum, no fake data without a seed script.** Every demo state must come from a deterministic seed file.

---

## 1. The Seven Phases

| # | Phase | Gate Before Advancing |
|---|---|---|
| P0 | Foundation — scaffold, env, tokens | App runs locally; design tokens visible on a test page |
| P1 | Database & Auth — schema, RLS, Clerk auth | Can insert test resource; user B cannot read user A's resources |
| P2 | Shell — layout, router, role-aware nav, login | Admin, Member, and Viewer land on different views after login |
| P3 | Core Shelf — save resource, view shelf, collections, tags | Resource saved via form appears in shelf; collection filter works |
| P4 | SRS Engine — review queue, rating, auto-deletion flag | Rating a resource correctly updates interval + due_date in DB |
| P5 | AI Features — auto-tagging, bulk import | AI tags a saved resource; bulk CSV import runs end-to-end |
| P6 | Analytics + Org Features — dashboard, org view, learning paths | Analytics show correct completion rate and retention curve |
| P7 | Polish & Acceptance — mobile, edge cases, full sweep | All 20 acceptance criteria pass |

Skipping phases causes rework. Do not skip.

---

## 2. Phase 0 — Foundation

**Preconditions:** Project opened, Supabase account available, Clerk account available, LLM API key available.

### Actions

1. **Initialize Next.js 15 project** with App Router. Name it `studyshelf`.
   ```bash
   npx create-next-app@latest studyshelf --app --tailwind --typescript
   ```

2. **Install dependencies:**
   ```
   @clerk/nextjs, @prisma/client, prisma,
   normalize-url, papaparse, lucide-react,
   openai (or @google/generative-ai)
   ```

3. **Create `.env.local`** with:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
   CLERK_SECRET_KEY=...
   CLERK_ENCRYPTION_KEY=...
   DATABASE_URL=...          # Supabase PostgreSQL connection string
   DIRECT_URL=...            # For Prisma migrations (bypasses pooler)
   LLM_API_KEY=...           # For AI tagging
   ```

4. **Paste the Tailwind config from Design System §10** into `tailwind.config.ts`. Do not modify the color or font values.

5. **Load Lora + Inter** in the root layout:
   ```tsx
   // app/layout.tsx
   import { Lora, Inter } from 'next/font/google'
   ```

6. **Apply the shelf glow and base styles** in `app/globals.css`:
   ```css
   body {
     background: var(--bg-void);
     color: var(--text-primary);
     font-family: var(--font-body);
   }
   .app-main {
     background-image: var(--shelf-glow);
     min-height: 100vh;
   }
   ```

7. **Initialize Prisma:**
   ```bash
   npx prisma init
   ```
   Point `DATABASE_URL` to your Supabase connection string.

8. **Create `src/lib/ai.ts`** — stub for the LLM client. No logic yet.

9. **Build a throwaway test page** at `/dev-tokens` that renders: one resource card, one SRS rating button set, one status pill in each color, one input field. Confirm all match the design system.

### Gate
- App runs on `npm run dev` without errors.
- `/dev-tokens` renders all components and they match the design system tokens.
- Warm dark background, shelf glow visible at bottom. Lora serif visible on card title.

### Common failures
- Lora not loading → check Next.js font import, not a CSS `@import`
- Tailwind CSS variables not applying → paste the `:root {}` block from Design System §2 into `globals.css`
- Clerk middleware not wrapping routes → ensure `middleware.ts` is at the root, not inside `app/`

---

## 3. Phase 1 — Database & Auth

**Preconditions:** P0 gate passed. Supabase project created. Clerk app created.

### Actions

1. **Write the Prisma schema** from Spec §3.1–3.5. Five models: `User`, `Resource`, `Collection`, `Tag`, `SRS_Data`, plus `ResourceCollection` and `ResourceTag` junction models.

2. **Apply the UNIQUE constraints:**
   - `Resource`: unique on `(userId, canonicalUrl)` — same URL can't be saved twice by the same user
   - `Tag`: unique on `name` (case-insensitive — store lowercase)
   - `SRS_Data`: unique on `resourceId` — one SRS record per resource

3. **Apply composite indexes** (Spec §3.4):
   ```prisma
   @@index([resourceId, tagId])  // on ResourceTag
   @@index([userId, dueDate])    // on SRS_Data — for fast "due today" queries
   ```

4. **Enable RLS in Supabase** on every table. Write the policies from Spec §3.7:
   - Resources: users can only SELECT/INSERT/UPDATE/DELETE their own rows (WHERE userId = auth.uid())
   - Collections: same user-scoped isolation; org shared collections are readable by all org members
   - SRS_Data: fully private, scoped to resource owner

5. **Set up Clerk middleware:**
   ```typescript
   // middleware.ts
   import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
   const isProtected = createRouteMatcher(['/dashboard(.*)', '/shelf(.*)', '/review(.*)', '/analytics(.*)'])
   export default clerkMiddleware(async (auth, req) => {
     if (isProtected(req)) await auth.protect()
   })
   ```

6. **Write a seed script** at `prisma/seed.ts`:
   - 1 demo user (seeded via Clerk test credentials)
   - 20 resources across 5 collections (use real article URLs: MDN docs, Arxiv abstracts, Wikipedia articles on CS topics)
   - SRS data: mix of new (interval=1), in-progress (interval=3–14), and mastered (interval=60+) records — 8 due today for a satisfying demo
   - Tags: at least 10 distinct tags covering "machine-learning", "web-dev", "system-design", "mathematics", "productivity"
   - 1 demo org with 3 members (admin, member, viewer) and 5 shared resources

### Gate
- Seed script runs cleanly: `npx prisma db seed`
- Logged in as User A, the Supabase SQL editor confirms their resource query returns only their rows
- Logged in as User B, same query returns zero rows from User A
- Inserting the same canonical URL twice for the same user fails with a Prisma unique constraint error
- Clerk middleware redirects unauthenticated users to `/sign-in` on all protected routes

### Common failures
- RLS using `auth.uid()` with Prisma — Prisma doesn't set the Supabase auth context automatically. You must set `SET LOCAL app.current_user_id = '{userId}'` per request, or use Supabase client instead of Prisma for RLS-critical queries.
- Prisma `DIRECT_URL` missing — migrations will fail through the Supabase pooler. Use the direct (non-pooled) connection for migrations only.
- Case sensitivity in tag dedup — always `.toLowerCase()` before insert.

---

## 4. Phase 2 — Shell & Login

**Preconditions:** P1 gate passed.

### Actions

1. **Set up Next.js App Router routes:**
   - `/` — redirects based on role
   - `/sign-in`, `/sign-up` — Clerk-handled
   - `/dashboard` — all authenticated users
   - `/shelf` — all authenticated users
   - `/review` — all authenticated users
   - `/collections` — all authenticated users
   - `/analytics` — Member (self) and Admin (org)
   - `/admin/members`, `/admin/paths`, `/admin/analytics` — Admin only
   - `/import` — Member and Admin only
   - `/403` — forbidden page

2. **Build a `<RoleGuard>` server component** that reads the user's Clerk role from `auth().sessionClaims` and redirects accordingly. Admin-only routes must return 403 for Member/Viewer, not silently redirect.

3. **Build the app shell:**
   - `<Sidebar>` — role-aware, from Design System §8.1. Shows "N due today" badge on Review Queue nav item, live-fetched.
   - `<TopBar>` — breadcrumb + search input (global shelf search) + org switcher if org user + avatar
   - `<Main>` — the shelf-glow wrapper

4. **Build the Login / Onboarding screens** per Design System §11.1:
   - Clerk `<SignIn>` and `<SignUp>` components styled to match the design system
   - After first sign-up: onboarding modal (3 steps: install clipper → save first resource → activate first SRS review)

5. **Build the 403 page** — friendly "You don't have access to this" with role-appropriate redirect button.

6. **Implement org switching** per Design System §11.8: Clerk `<OrganizationSwitcher>` styled as a sidebar popover.

### Gate
- Unauthenticated user → `/sign-in`
- After login, admin → `/dashboard` with full nav. Member → `/dashboard` without admin nav items. Viewer → `/dashboard` read-only view.
- Member typing `/admin/members` → `/403`
- Org switcher shows "Personal Workspace" and any org the user belongs to
- Sidebar "Review Queue" badge shows the correct due-today count from seed data

### Common failures
- Clerk `sessionClaims` not including org role — must configure Clerk's public metadata to include the `role` field and map it to session claims in the Clerk dashboard
- Race condition on org context — always await `auth()` before reading `orgId`; never read it from client state

---

## 5. Phase 3 — Core Shelf

**Preconditions:** P2 gate passed.

Build these screens in order. Each is independently testable.

### 5.1 Save Resource (Manual Form + Clipper Stub)

Build the "save resource" flow before the web clipper exists:

- A modal form: URL field + optional title override + collection selector + tag input (multi-select with create)
- On submit:
  1. Normalize the URL (strip tracking params using `normalize-url`)
  2. Check for existing canonical URL in user's shelf → show "Already saved" with link if dupe
  3. Fetch OpenGraph metadata server-side (title, description, og:image)
  4. Insert into `Resource` table
  5. If tags provided, insert into `ResourceTag`
  6. Show success toast, add resource to shelf optimistically
- "Save Resource" button: accessible from sidebar and as FAB on mobile

### 5.2 My Shelf (`/shelf`)

Follow Design System §11.3:

- Fetch resources with their SRS_Data, tags, and collection memberships
- Render in 3-column grid (Design System §8.2 resource card anatomy)
- Implement filter bar: search (full-text across title + description), filter by collection, filter by tag, filter by SRS status (Due Today, Overdue, Mastered, New, No SRS)
- Sort: Date Saved (default), Due for Review, Ease Factor (hardest first), Alphabetical
- Bulk action bar: appears on multi-select, floats at bottom. Actions: Add to Collection, Apply Tag, Activate SRS, Delete.

**Query discipline:** filter queries are server-side (Next.js route handlers). Client only sends the filter state as query params.

### 5.3 Collections (`/collections`)

Follow Design System §11.5:

- Left panel: collection tree, hierarchical, icon + name
- Right panel: resources in selected collection, same card grid
- Create collection: modal with name + icon picker (emoji or Lucide icon)
- Move resource to collection: drag-and-drop OR right-click context menu
- Nested collections: unlimited depth, but UI should cap visual indentation at 3 levels to avoid runaway nesting

### 5.4 Tags Screen

- Tag list view: all user tags, count of resources per tag, custom color (shown as 3px left border on chip)
- Click a tag → filtered shelf view for that tag
- Edit tag: rename, change color. Merge tag: combine two tags into one (updates all ResourceTag rows)
- Delete tag: confirmation modal. Detaches from all resources, does not delete the resources.

### Gate
- Save a resource via the form → appears in shelf with correct metadata thumbnail and tags
- Duplicate URL → "Already saved" message appears, no duplicate inserted
- Filter by tag → only tagged resources appear
- Create collection, move resource to it → collection count updates
- Bulk-select 3 resources → activate SRS → all 3 get SRS_Data rows with interval=1 and dueDate=today

### Common failures
- OpenGraph fetch blocked by CORS on client-side — must be server-side. Use a Next.js route handler or server action.
- Tracking params not stripped — `normalize-url` must be called with `{ stripAuthentication: true, removeTrailingSlash: true }` and custom `removeSingleQueryParameters: ['utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'gclid']`
- Collection tree not updating after drag — invalidate the collection query after the mutation resolves
- Tag dedup failing because stored with capital letter — always `.toLowerCase()` before compare and insert

---

## 6. Phase 4 — SRS Engine

**Preconditions:** P3 gate passed. Resources exist in shelf with SRS activated.

This is the most important feature. Build it with care.

### 6.1 Review Queue Logic

**"Due today" query:**
```sql
SELECT r.*, s.*
FROM resources r
JOIN srs_data s ON s.resource_id = r.id
WHERE r.user_id = {userId}
  AND s.due_date <= CURRENT_DATE
ORDER BY s.due_date ASC, s.ease_factor ASC;  -- oldest due, hardest first
```

**Queue ordering:**
1. Overdue (due_date < today) — sorted oldest first
2. Due today — sorted by ease_factor ascending (hardest first)
3. "New" resources if user has activated a daily new-card limit

### 6.2 SM-2 Rating Logic

Implement as a server action or route handler. Called when user clicks a rating button.

```typescript
async function rateResource(resourceId: string, rating: 'again' | 'hard' | 'good' | 'easy') {
  const srs = await getSRSData(resourceId);
  let { interval, easeFactor } = srs;

  switch (rating) {
    case 'again':
      interval = 1;
      easeFactor = Math.max(1.30, easeFactor - 0.20);
      break;
    case 'hard':
      interval = Math.round(interval * 1.2);
      easeFactor = Math.max(1.30, easeFactor - 0.15);
      break;
    case 'good':
      interval = Math.round(interval * easeFactor);
      break;
    case 'easy':
      interval = Math.round(interval * easeFactor * 1.3);
      easeFactor = Math.min(4.0, easeFactor + 0.15);
      break;
  }

  interval = Math.min(365, Math.max(1, interval));  // cap: 1–365 days

  const dueDate = addDays(new Date(), interval);
  await updateSRSData(resourceId, { interval, easeFactor, dueDate, lastReviewed: new Date() });
}
```

**Constraints from Spec §6.3:**
- EF floor: 1.30 — `Math.max(1.30, easeFactor - delta)`
- Interval cap: 365 days — `Math.min(365, newInterval)`
- Rating "Again" always resets to 1 day regardless of current interval

### 6.3 Skip Logic & Auto-Deletion

On skip (no rating):
1. Increment `srs.skipCount`
2. If `skipCount === 2`: show inline warning "Skipped twice — review or remove this resource"
3. If `skipCount === 3`: fire the archival modal per Design System §8.12 ("Read it now or delete it forever")
   - "Read it now" → opens clean reading view inline, skip count does NOT advance
   - "Archive" → moves resource to archived state (hidden from shelf and queue, not deleted)
   - "Delete" → permanent delete after confirmation modal

On any rating (even "Again"): `skipCount = 0`.

### 6.4 Review Screen UI

Follow Design System §11.4:
- Sidebar auto-collapses to icon-only when `/review` is active (less distraction)
- Center: single resource card, large, with `review-glow` behind it
- "Show Article" → inline clean reading view (stripped content from `Resource.cleanContent`)
- Rating buttons: 4 pill buttons, full-width on mobile, centered row on desktop
- Hover on rating button → tooltip showing next interval (compute it in preview, don't commit)
- On queue complete: celebration screen per Design System §11.4

### Gate
- Rating "Good" on a resource with interval=3 and easeFactor=2.5 → new interval=8, dueDate=today+8
- Rating "Again" on any resource → interval=1, EF drops by 0.20 (floor 1.30)
- Skipping 3 times → archival modal appears
- Archiving a resource → it disappears from shelf and review queue
- Interval never exceeds 365 days regardless of streak

### Common failures
- `addDays` off-by-one — use a reliable date library (date-fns) not manual millisecond math
- EF going below 1.30 — always use `Math.max(1.30, newEF)` immediately after calculation
- Skip count not resetting on rating — must explicitly set `skipCount: 0` in the update call
- Review queue showing resources rated today — filter: `dueDate <= CURRENT_DATE`, not `< CURRENT_DATE`; today counts as due

---

## 7. Phase 5 — AI Features

**Preconditions:** P4 gate passed. SRS engine fully functional.

### 7.1 AI Auto-Tagging

Called immediately after a resource is saved (async, non-blocking):

**Request to LLM:**
```typescript
const response = await llm.chat({
  model: 'gpt-4o-mini',   // or gemini-2.0-flash
  response_format: { type: 'json_object' },
  temperature: 0.2,
  messages: [{
    role: 'system',
    content: `You are a resource tagging assistant. Given a resource title and description, return a JSON object with a "tags" array of 2–5 lowercase, hyphenated tags (e.g., "machine-learning", "web-dev"). Tags must be general and reusable, not specific to this one article. Return ONLY valid JSON.`
  }, {
    role: 'user',
    content: `Title: ${resource.title}\nDescription: ${resource.description}`
  }]
});
```

- Parse response, validate tags against allowed format (lowercase, hyphenated, max 24 chars)
- Upsert tags into `Tag` table, insert into `ResourceTag` with `source: 'ai'`
- Show the user the AI-suggested tags as pre-filled chips in the shelf card — they can remove or add more
- Log any LLM failure to console; gracefully continue without tags rather than blocking the save

### 7.2 Bulk Import Screen (`/import`)

Follow Design System §11.7 (4-step pipeline). Build each step independently.

**Step 1 — Upload:**
- Accept `.csv` and `.html` (browser bookmark export) files, max 5MB
- Parse client-side: CSV with PapaParse, HTML bookmark files by extracting all `<a href>` tags
- Show: filename, detected URL count, format detected

**Step 2 — Map Columns (CSV only):**
- Send headers + first 3 rows to LLM agent
- Agent returns: `{ url_column, title_column, tag_column, date_column, ignore_columns[] }`
- Show editable mapping table. IGNORE option always present. User must confirm before proceeding.

**Step 3 — Preview & Validate:**
- For each URL:
  - Run `normalize-url` and check for dupe against user's existing shelf
  - Color-code: green = new, amber = duplicate (show existing resource link), red = invalid URL
- Summary bar: "X new, Y duplicates, Z invalid"
- "Import" button disabled until user resolves or dismisses errors

**Step 4 — Import:**
- Batch insert in groups of 20
- For each batch: insert resources, trigger async OG metadata fetch + AI tagging
- Progress bar (amber fill on dark track)
- On complete: "X resources added to your shelf"

### Gate
- Save a resource with a valid URL → AI tags appear on the card within 3s
- Invalid LLM response → tags are silently skipped, resource is saved without tags, no error shown to user
- Bulk import with a 10-URL CSV → all new URLs inserted, duplicate shown in amber, invalid shown in red
- HTML bookmark export from Chrome/Firefox → URLs correctly extracted and importable

### Common failures
- LLM returns tags with spaces (e.g., "machine learning") → reject and re-prompt or sanitize to "machine-learning"
- OG fetch times out (> 5s per URL) → set a 4s timeout, fall back to URL hostname as title
- Bulk import blocking the UI → run all OG fetches and AI tagging async (background queue), insert resources immediately with placeholder titles

---

## 8. Phase 6 — Analytics + Org Features

**Preconditions:** P5 gate passed.

### 8.1 Individual Analytics (`/analytics`)

Follow Design System §11.6 individual view:

- **Completion rate:** `(resources with at least one review) / (total resources with SRS activated)`
- **Avg ease factor:** mean across all SRS_Data rows for this user — color coded (>2.5 green, 1.8–2.5 amber, <1.8 red)
- **Retention curve:** fetch all SRS_Data ordered by due_date; compute estimated recall probability P = exp(-t/S) for each resource and plot as a sparkline
- **Review heatmap:** one cell per calendar day, color by review outcome per Design System §8.8
- **Monthly breakdown table:** month, resources saved, reviews completed, avg rating distribution

### 8.2 Org-Level Analytics (Admin only)

- Cohort completion rates: one horizontal bar per member, sorted by rate desc
- Knowledge Retention score per member: PEC = mastered end, NC = new, PSC = mastered start (Spec §8 formula)
- AI decision log table: filter by date range, exportable as CSV
- Content fatigue signals: resources where the last 3 reviews were "Again" or "Hard" flagged as "Stale"

### 8.3 Adaptive Learning Paths (Admin, Org tier)

Per Spec §F6:
- Admin creates a "Learning Path": an ordered list of resources with optional pre-test
- Member assigned to path works through it sequentially
- After completing a resource (any rating except "Again"), next resource unlocks
- If member passes pre-test quiz (>90%), introductory resources are skipped
- Compliance resources (admin-flagged): cannot be skipped regardless of quiz performance; archival modal suppressed

### Gate
- Analytics dashboard shows correct completion rate from seed data
- Admin can see org-level member progress; member cannot access admin analytics URL
- Knowledge Retention score formula matches spec calculation

---

## 9. Phase 7 — Polish & Acceptance

**Preconditions:** P6 gate passed.

### Actions

1. **Walk through all 20 acceptance criteria in Spec §8.** Check each one. Any failure = fix before continuing.

2. **Mobile sweep at 375px:**
   - Sidebar → bottom nav
   - Resource cards → single column
   - Review screen → rating buttons stacked 2×2 on very small screens
   - Tables → horizontal scroll inside container
   - Touch targets ≥ 44×44px on all interactive elements

3. **Confirmation modals** on all destructive actions: delete resource, archive resource, delete collection, bulk delete, clear SRS history.

4. **Empty states** on every data-fetching screen per Design System §8.12.

5. **Loading states:** skeleton cards matching resource card shape, not generic spinners. Inline skeleton on SRS_Data updates (optimistic UI — show new interval before server confirms).

6. **Keyboard navigation:** tab order logical, focus rings visible (amber 3px ring per design system), Escape closes modals.

7. **Console clean:** zero errors, zero unhandled rejections, zero React key warnings.

### Final Gate — Ship Readiness Checklist

- [ ] All 20 acceptance criteria from Spec §8 verified
- [ ] Design system implementation checklist from Design System §13 all checked
- [ ] Seed data lets a fresh user immediately see a populated dashboard with 8 reviews due
- [ ] Bulk import works with a real browser bookmark export file
- [ ] All three roles (Admin, Member, Viewer) have clean login → primary task flows
- [ ] SRS rating loop: save → activate SRS → review → rate → correct interval in DB
- [ ] Works on a 375px iPhone viewport
- [ ] README: how to run locally, how to seed, demo credentials for each role

---

## 10. Prompting Discipline

**Good prompt from user:**
> "Build Phase 4.2 — SM-2 rating logic. Follow Spec §6.3 and the rateResource function in the skill. Don't build the review UI yet."

**Bad prompt from user:**
> "Make the SRS thing work."

→ Ask which phase, point them at this skill file.

**When user says "just make it work":**
- Do not skip phases.
- Do not skip the database → RLS → UI order.
- If scope must be cut, cut features (e.g., defer Learning Paths to v2), not layers (e.g., never skip RLS to "ship faster").

---

## 11. Anti-Patterns (Do NOT Do These)

| Anti-pattern | Why it's wrong | What to do instead |
|---|---|---|
| Building the shelf UI before the schema | UI assumes shapes that break on real data | Schema first, always |
| Using `localStorage` for role/auth state | Can be tampered with; Viewer can impersonate Admin | Read role from Clerk session on every request |
| Skipping RLS because "the UI already hides it" | Anyone with devtools can bypass the UI | RLS is mandatory for all tables |
| Hardcoded hex colors (`#10B981`, `#fff`) | Breaks the design system | Use CSS variables / Tailwind tokens |
| `INSERT` for SRS updates instead of `UPSERT` | Breaks on second activation of SRS for a resource | Use `upsert({ onConflict: 'resourceId' })` |
| Treating empty cells in CSV import as absence | Corrupts data | Skip rows with empty URL fields entirely |
| Building AI tagging as blocking — user must wait | Feels slow; breaks save flow | Run AI tagging async, update card after save |
| Using proportional-width numbers on retention % | Numbers jitter as they update | Always `font-variant-numeric: tabular-nums` |
| Putting serif (Lora) on body copy | Harder to read at small sizes | Lora only for `text-display-*` and resource titles |
| Forgetting to lowercase tags before insert | "ML" and "ml" become two different tags | Always `.toLowerCase()` before tag insert |
| Calculating interval with `Date` millisecond math | Off-by-one errors on DST transitions | Use date-fns `addDays()` |
| Showing Clerk/Prisma raw error strings to the user | Leaks internals | Wrap in friendly messages, log real errors to console |

---

## 12. Debugging Playbook

| Symptom | Likely cause | Fix |
|---|---|---|
| User B sees User A's resources | RLS not enabled or policy uses wrong column | `ALTER TABLE resources ENABLE ROW LEVEL SECURITY` + verify policy uses `userId = auth.uid()` |
| SRS interval not updating | `upsert` not finding existing row | Check `onConflict` key matches the UNIQUE constraint exactly |
| AI tags not appearing | LLM returned invalid JSON | Wrap parse in try/catch, log error, continue without tags |
| Interval jumping to 365 on first "Easy" | Missing `Math.min(365, ...)` cap | Add cap immediately after interval calculation |
| Due date off by 1 day | Timezone issue with `new Date()` | Use `startOfDay(new Date())` from date-fns |
| Duplicate URLs still saving | `normalize-url` not stripping all tracking params | Add explicit `removeQueryParameters: ['utm_source', 'fbclid', ...]` |
| Org switcher not scoping queries | `orgId` read from stale client state | Re-fetch `orgId` from `auth()` on every server action |
| Mobile layout breaks | Fixed widths, not using `w-full max-w-*` | Replace all fixed px widths with responsive Tailwind |
| Focus ring invisible | CSS variable not loaded | Verify `:root` block in `globals.css` includes `--shadow-focus` |
| Review queue empty even with due records | `dueDate < today` instead of `<= today` | Fix filter to `dueDate <= CURRENT_DATE` |

---

## 13. What Success Looks Like

At the end of Phase 7, the user can:

1. Open StudyShelf, log in, and see a dashboard with 8 resources due for review — no setup required, seed data loads this state.
2. Work through the review queue on a phone at 375px, rating each resource, and see the next interval shown before confirming the rating.
3. Save a new resource from the manual form → see AI tags suggested within 3s → accept them → resource appears on shelf.
4. Drag a browser bookmark export file onto the import screen → preview 50 URLs with dedup detection → import in one click.
5. Log in as an Org Admin → see all three member completion rates in the analytics panel → export the AI decision log.

If all five are true, the skill succeeded.

---

**End of skill.** Load alongside `StudyShelf_Spec_Sheet.md` and `StudyShelf_Design_System.md` in every session that touches this codebase.
