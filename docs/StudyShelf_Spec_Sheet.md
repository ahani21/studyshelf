# PRODUCT SPEC SHEET
# StudyShelf

A Knowledge Synthesis and Resource Management Ecosystem

**Version:** 1.0 (MVP)
**Date:** April 2026

---

# 1. Product Overview

## 1.1 Product Name & Description

| Field | Detail |
| :---- | :---- |
| Product Name | StudyShelf |
| One-line Description | A unified platform that transforms passive bookmark collection into active learning through spaced repetition, AI tagging, and adaptive study paths |
| Product Type | Web application / SaaS |
| Version | 1.0 (MVP Build) |

## 1.2 Problem Statement

Current tools for managing digital resources fail to bridge the gap between simple link hoarding and active knowledge retention. This creates three specific problems:

- **The Collector's Fallacy:** Existing bookmark managers (Raindrop.io, Pocket) make it easy to save content but provide no mechanism to ensure it's actually studied or retained. Users accumulate hundreds of unread links.

- **Fragmented tool ecosystems:** Spaced repetition apps (Anki, BeeMind) handle retention well but can't manage a diverse library of web resources, PDFs, and multimedia. Users must switch between multiple tools.

- **No lifecycle management:** There is no single tool that handles the full resource lifecycle — from initial discovery and archival to active review and mastery confirmation.

## 1.3 Competitive Landscape

| Tool | Core Strength | Primary Weakness |
| :---- | :---- | :---- |
| Raindrop.io | Visual organization and aesthetics | No study or retention mechanics |
| Pocket | Clean cross-platform reading | Limited organization for complex research |
| BeeMind | Spaced repetition via SM-2 | Doesn't handle full articles or multimedia |
| Readwise Reader | Highlight syncing and synthesis | High subscription fee |
| Bookmark OS | Integrated tasks + notes | Steep learning curve, higher cost |
| Tixio | Team collaboration and shared boards | Too complex for individual learners |

## 1.4 Target Users

**Primary user — Individual Learner:** A student or knowledge worker who saves resources from the web and wants a system that actually helps them study and retain the material, not just hoard it.

**Secondary user — Organization Member:** A university student or professional within a team workspace (e.g., a study group or corporate L&D cohort) who needs access to shared collections and curated learning paths alongside their personal shelf.

**Tertiary user — Organization Admin:** A faculty member, team lead, or L&D administrator who curates shared collections, monitors team progress via analytics, and enforces compliance resources that cannot be skipped.

This requires three roles: **Admin** (full CRUD + analytics), **Member** (read/write on own resources, read on shared), and **Viewer** (read-only).

---

# 2. Core Features

## 2.1 Feature List

| # | Feature | Priority | Description |
| :---- | :---- | :---- | :---- |
| F1 | Resource Ingestion via Web Clipper | Must Have | Browser extension captures the URL, auto-extracts OpenGraph metadata (title, description, thumbnail), normalizes the URL to prevent duplicates, and saves to the user's shelf in one click. |
| F2 | AI Auto-Tagging | Must Have | On resource save, an LLM analyzes the page content and suggests relevant tags. User can accept, reject, or modify suggestions before saving. |
| F3 | Spaced Repetition Review Queue | Must Have | A daily review queue surfaces saved resources using a modified SM-2 algorithm. Users rate recall as Again / Hard / Good / Easy, and the system schedules the next review interval accordingly. |
| F4 | Collections & Hierarchical Organization | Must Have | Users can organize resources into nested collections (folders), assign custom icons, and filter across all resources by collection or tag. |
| F5 | Clean Reading View | Should Have | Strips ads, navigation, and scripts from saved articles to deliver a clean, distraction-free reading experience inline within StudyShelf. |
| F6 | Adaptive Learning Paths | Should Have | For Organization users, resources are sequenced into structured curricula. After quizzes, the system dynamically adjusts the next recommended resource based on performance. |
| F7 | Learning Analytics Dashboard | Should Have | Tracks completion rate, knowledge gain (pre/post quiz scores), retention curve projections, and content fatigue signals. Admin-level view includes cohort metrics and exportable AI decision logs. |
| F8 | Multi-Tenant Workspaces (Organizations) | Must Have | Supports personal and shared workspaces via Clerk Organizations. Data is isolated per organization at the database level via PostgreSQL RLS. Users can belong to and switch between multiple orgs. |
| F9 | Authentication & Role-Based Access | Must Have | Three roles: Admin (full CRUD, analytics, invite members), Member (add/read own resources, read shared), Viewer (read-only). Access enforced at both middleware and database layers. |
| F10 | Smart Notifications & Habit Reminders | Nice to Have | Push notifications for SRS review due dates, weekly email digest of top unread links, and in-app toasts for milestone achievements. |

## 2.2 Feature F3 Deep Dive: Spaced Repetition System (SRS)

**This is the defining feature of StudyShelf and requires detailed specification. The SRS is not a simple reminder system — it implements a scientifically grounded memory retention algorithm that schedules reviews at precisely the right moment to prevent forgetting.**

### 2.2.1 Why SRS for Bookmarks?

The forgetting curve shows that without review, people lose ~70% of new information within 24 hours. Traditional bookmark managers ignore this entirely. StudyShelf treats every saved resource as a study item and schedules it for review based on the user's demonstrated recall performance — not arbitrary time intervals.

### 2.2.2 The SM-2 Algorithm Implementation

StudyShelf implements a modified version of the SM-2 algorithm. Each resource has two stored variables:
- **Interval (I):** Days until the next scheduled review
- **Ease Factor (EF):** A multiplier (default 2.5) representing how easy the resource is for this user to recall

After each review, the user provides one of four ratings:

| User Rating | Interpretation | Interval Adjustment | Ease Factor Change |
| :---- | :---- | :---- | :---- |
| Again | Total failure; forgot content | Reset to 1 day | −20% |
| Hard | Correct recall with significant effort | Interval × 1.2 | −15% |
| Good | Normal successful recall | Interval × EF | No change |
| Easy | Perfect, effortless recall | Interval × EF × 1.3 | +15% |

The next review is scheduled when the estimated recall probability (P) approaches 0.90, where P decays as a function of elapsed time (t) and memory stability (S).

### 2.2.3 Auto-Deletion for Ignored Resources

To combat link hoarding, if a resource appears in the review queue and is skipped **three consecutive times without interaction**, it is automatically flagged for archival or permanent deletion. The user is shown a modal: *"You've skipped this 3 times. Read it now or delete it forever?"* This keeps the shelf curated and intentional.

---

# 3. Data Model

The database schema has five primary entities and one SRS data table. All tables use UUIDs or auto-incrementing integer IDs as primary keys.

## 3.1 User

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | UUID | PRIMARY KEY (Clerk auto) | Clerk Auth user ID |
| email | TEXT | UNIQUE, NOT NULL | Login email |
| activeOrgId | TEXT | NULLABLE | Currently active organization context |
| role | TEXT | NOT NULL, CHECK (admin/member/viewer) | Access level within the active org |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |

## 3.2 Resource

The primary study unit of StudyShelf.

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT | Unique resource identifier |
| user_id | UUID | FOREIGN KEY → User(id), NOT NULL | Owner of the resource |
| url | TEXT | NOT NULL | Original URL as submitted |
| canonical_url | TEXT | UNIQUE per user, NOT NULL | Normalized, de-duplicated URL |
| title | TEXT | NOT NULL | Extracted from og:title or `<title>` |
| description | TEXT | NULLABLE | Extracted from og:description |
| image_url | TEXT | NULLABLE | Extracted from og:image or first large `<img>` |
| clean_content | TEXT | NULLABLE | Distilled article body for clean reading view |
| srs_id | INTEGER | FOREIGN KEY → SRS_Data(id), NULLABLE | Links to SRS schedule if user activates review |
| created_at | TIMESTAMP | DEFAULT NOW() | Date resource was saved |

## 3.3 Collection

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT | Unique collection identifier |
| user_id | UUID | FOREIGN KEY → User(id), NOT NULL | Owner of the collection |
| name | TEXT | NOT NULL | Display name (e.g., "Machine Learning Papers") |
| icon | TEXT | NULLABLE | Emoji or icon identifier |
| parent_id | INTEGER | NULLABLE, FOREIGN KEY → Collection(id) | For nested sub-collections; NULL = top-level |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |

## 3.4 Tag

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT | Unique tag identifier |
| name | TEXT | NOT NULL | Tag label (e.g., "deep-learning") |
| color | TEXT | NULLABLE | Hex color for visual display |

**ResourceTag (Junction Table):**

| Column | Type | Description |
| :---- | :---- | :---- |
| resource_id | INTEGER | FK → Resource |
| tag_id | INTEGER | FK → Tag |
| tagged_at | TIMESTAMP | When the tag was applied (for audit/AI confidence logging) |
| source | TEXT | "user" or "ai" — indicates whether the tag was manually applied or AI-suggested |

**COMPOSITE INDEX: @@index([resource_id, tag_id]) — required for fast multi-tag filtering at scale.**

## 3.5 SRS_Data

Stores the spaced repetition schedule variables per resource per user.

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT | Unique SRS record |
| resource_id | INTEGER | FOREIGN KEY → Resource(id), NOT NULL | The resource being tracked |
| interval | INTEGER | DEFAULT 1 | Days until next review |
| ease_factor | DECIMAL(3,2) | DEFAULT 2.50 | Recall difficulty multiplier |
| due_date | DATE | NOT NULL | Scheduled date for next review |
| last_reviewed | TIMESTAMP | NULLABLE | When the last review occurred |
| review_count | INTEGER | DEFAULT 0 | Total number of times reviewed |
| skip_count | INTEGER | DEFAULT 0 | Consecutive skips; triggers archival flag at 3 |

## 3.6 Entity Relationships

- **User 1:N Resource** — one user owns many resources
- **User 1:N Collection** — one user owns many collections
- **Collection N:N Resource** — a resource can belong to multiple collections (via junction table)
- **Resource N:N Tag** — a resource can have many tags (via ResourceTag junction table)
- **Resource 1:1 SRS_Data** — each resource can have one SRS record (nullable; user opts in to review)

## 3.7 Row Level Security Policies

Supabase/PostgreSQL RLS enforces data isolation at the database level, not just the UI. Even if application-layer bugs occur, users cannot access data outside their organization.

- **Resource table:** Users can SELECT/INSERT/UPDATE/DELETE only WHERE user_id = auth.uid() AND org_id = activeOrgId.
- **Collection table:** Same user-scoped isolation. Shared org collections are readable by all members of that org.
- **Tag table:** Tags are global identifiers. All users can SELECT tags. Only the resource owner can apply or remove them.
- **SRS_Data table:** Fully private. Users can only access rows linked to their own resources.
- **Analytics data:** Admin role can SELECT aggregated org-level metrics. Members see only self-scoped analytics. Viewer role has read-only access to self data.

---

# 4. Tech Stack

| Layer | Technology | Rationale |
| :---- | :---- | :---- |
| Frontend Framework | Next.js 15 (App Router) | Server-side rendering, streaming metadata, superior SEO for public learning paths |
| Styling | Tailwind CSS | Utility-first, consistent design system, no custom CSS sprawl |
| Authentication | Clerk | Native multi-tenancy (Organizations), social login, granular RBAC, encrypted session metadata |
| Database ORM | Prisma | Type-safe data modeling, automated migrations, robust relational pattern support |
| Database Engine | PostgreSQL | Row-Level Security, complex indexing, proven at scale |
| URL Processing | normalize-url / URI.js | Consistent URL canonicalization; strips tracking params (utm_source, fbclid) before dedup check |
| Search | Meilisearch / Algolia | Low-latency full-text search across extracted article content |
| AI Tagging | LLM API (GPT-4o / Gemini Flash) | Structured JSON tag suggestions from page content; fast inference, cost-efficient |
| CSV / XLSX Parsing | PapaParse / SheetJS | Client-side parsing for bulk resource imports without requiring a server roundtrip |
| Deployment | Vercel + Supabase (managed PostgreSQL) | Edge functions for SRS calculations, global CDN, connection pooling via PrismaClient singleton |
| State Management | React useState / useReducer | No external state library needed for this scope |

---

# 5. Screen Specifications

## 5.1 Dashboard (Home Screen)

**Purpose: At-a-glance view of the user's study activity and daily review queue.**

Layout: Single page, primary content visible without scrolling.

- **Top bar:** App name 'StudyShelf' + navigation (Dashboard, My Shelf, Collections, Review, Analytics, Settings) + org switcher
- **Card 1 — Today's Review:** Number of resources due for review today, estimated time to complete, "Start Review" CTA button
- **Card 2 — Shelf Summary:** Total saved resources, total read vs. unread, resources added this week
- **Card 3 — Retention Health:** Average ease factor across the shelf, percentage of resources with recall > 90%, resources at risk of forgetting (due but not reviewed for 3+ days)
- **Card 4 — Recent Activity:** Last 5 actions (e.g., "Saved: The Illustrated Transformer", "Reviewed: Attention is All You Need — rated Good")

## 5.2 My Shelf Screen

**Purpose: Browse, filter, and manage all saved resources.**

- Filter bar: search box (full-text across titles and content), filter by tag (multi-select), filter by collection, filter by status (Unread / In Progress / Mastered)
- Resource cards: thumbnail, title, source domain, date saved, tag chips, SRS due date if active
- Sort options: Date Saved (default), Due for Review, Alphabetical, Ease Factor (hardest first)
- Bulk actions: select multiple resources → add to collection, apply tag, delete, activate SRS
- Empty state: "Your shelf is empty. Install the web clipper to start saving resources."

## 5.3 Review Screen (SRS Queue)

**Purpose: Work through the daily review queue using spaced repetition.**

- Progress indicator: "3 / 12 reviewed today"
- Resource display: title, source URL, thumbnail, and optionally the clean reading view inline
- Rating buttons (displayed after the user confirms they've reviewed): **Again** | **Hard** | **Good** | **Easy** — each shows the resulting next interval on hover (e.g., "Good → 6 days")
- Skip button: increments the skip_count; after 3 skips, triggers the archival modal
- On queue completion: celebration screen showing resources reviewed, average rating, and projected next review load

## 5.4 Collections Screen

**Purpose: Organize resources into nested folders.**

- Sidebar: hierarchical tree of collections with custom icons, drag-to-reorder
- Main panel: grid or list view of resources in the selected collection
- Create collection: modal with name, icon picker, optional parent collection
- Move resource: drag and drop or right-click context menu
- Empty collection state: "This collection is empty. Drag resources here or save directly to this collection via the clipper."

## 5.5 Analytics Dashboard

**Purpose: Track learning progress and knowledge retention over time.**

- **Individual view (all roles):**
  - Completion rate: % of shelf that has been read at least once
  - Retention curve: graph of recall probability over time for key resources
  - Review history: calendar heatmap of daily review activity (similar to GitHub contribution graph)
  - Monthly breakdown: resources saved vs. resources reviewed vs. resources mastered

- **Admin-only org view:**
  - Cohort completion rates across all members
  - Knowledge Retention metric per member and org-wide
  - Content fatigue signals: topics where engagement is dropping
  - Exportable AI decision log (which path adjustments were made and why)

## 5.6 CSV / Bulk Import Screen

**Purpose: Import a list of URLs in bulk (e.g., from another bookmark manager export).**

- Step 1 — Upload: drag-and-drop zone for .csv or .html (bookmark export) files. Show row count and detected columns on drop.
- Step 2 — Map Columns: auto-detect URL, title, and tag columns. User can override mapping. IGNORE option for unwanted columns.
- Step 3 — Preview & Validate: table of URLs to import, color-coded (green = clean, yellow = duplicate detected, red = invalid URL). Summary: "42 ready, 3 duplicates, 1 invalid."
- Step 4 — Import: batch import with progress bar. On completion: "42 resources saved to your shelf."

## 5.7 Login Screen

**Purpose: Authenticate users and route them to the correct org context.**

- Clean centered form: email + password + "Sign In" button
- Social login: "Continue with Google" option via Clerk
- On successful login: redirect to Dashboard in last active org context
- First-time login: onboarding flow prompting web clipper install
- Org switcher accessible post-login for users belonging to multiple orgs

## 5.8 Navigation: Role-Based

The navigation bar adapts based on the logged-in user's role:

- **Admin navigation:** Dashboard | My Shelf | Collections | Review | Analytics (full) | Settings | Invite Members | Logout
- **Member navigation:** Dashboard | My Shelf | Collections | Review | Analytics (self) | Logout
- **Viewer navigation:** Shared Collections | Analytics (self) | Logout

Admin-only routes (full analytics, member management, compliance settings) return 403 Forbidden if a Member or Viewer attempts direct URL access.

---

# 6. Constraints & Business Rules

**These are the non-negotiable rules that govern data integrity and user experience. Every constraint must be explicitly specified when building or prompting. Silent violations here corrupt the learning data.**

## 6.1 Data Integrity Constraints

1. **No duplicate resources per user:** A user cannot save the same canonical URL twice. Enforced at the database level via UNIQUE(user_id, canonical_url) and at the application level before insert. Tracking parameters (utm_source, fbclid, etc.) are stripped before the uniqueness check.

2. **URL normalization is mandatory:** Every URL must be processed through normalize-url before storage. This ensures that http vs. https, trailing slashes, and parameter order differences do not create duplicate entries.

3. **SRS records are linked 1:1 to resources:** A resource can only have one active SRS schedule. Activating SRS on an already-tracked resource updates the existing record rather than creating a new one.

4. **Tag names are case-insensitive:** "Machine Learning" and "machine learning" are the same tag. Tags are stored in lowercase and displayed as entered.

5. **Ease Factor floor is 1.30:** The SM-2 algorithm does not allow EF to drop below 1.30, regardless of how many "Again" ratings a resource receives. This prevents intervals from collapsing to zero.

6. **AI tag decisions must be logged:** Every auto-tag applied by the AI must be recorded in ResourceTag.source = 'ai'. This allows the user to audit and remove AI suggestions, and allows the analytics system to measure AI tagging accuracy over time.

## 6.2 UI/UX Constraints

1. **Mobile responsive:** All screens must be fully functional at 375px minimum viewport width. The Review screen is the most critical — users may review resources on a phone during a commute.

2. **Role-based access is enforced at the database level:** PostgreSQL RLS policies ensure that even if a Member bypasses the frontend, they cannot query resources, collections, or analytics belonging to another user or org.

3. **Admin-only routes are protected at middleware:** clerkMiddleware() intercepts every request to /admin and /analytics/org routes, verifying the user's role within the active org before allowing access.

4. **Confirmation before destructive actions:** Any action that permanently modifies or deletes data must show a confirmation dialog. This includes: deleting a resource, permanently deleting from the archival queue, removing a member from an org, and clearing SRS history.

5. **Empty states must be encouraging:** Empty state copy must not blame the user. Use future-oriented language (e.g., "Your shelf will hold your saved resources once you install the clipper") rather than "You haven't added anything yet."

## 6.3 SRS Constraints

1. **SRS is opt-in per resource:** Users must explicitly activate SRS on a resource. It does not activate automatically on save. Bulk activation is permitted (select all → activate SRS).

2. **Skip count resets on any interaction:** If a user rates a resource (even "Again"), the skip_count resets to 0. Only consecutive skips without rating trigger the archival flag.

3. **Compliance resources cannot be archived:** For org-tier users, resources flagged as "Compliance" by an Admin cannot be archived or deleted by the user, regardless of skip count. The archival modal is suppressed and replaced with a locked indicator.

4. **Review intervals are capped at 365 days:** Even if EF is very high and a resource is rated "Easy" repeatedly, the maximum interval before the next review is 365 days. This prevents resources from disappearing from the review queue indefinitely.

## 6.4 Import Constraints

1. **Maximum file size: 5MB.** Files exceeding this are rejected at client-side validation with a clear error message.

2. **Accepted formats: .csv and .html (bookmark export).** Other file types are rejected before processing.

3. **Column mapping must be user-confirmed:** Auto-detected mapping is always shown for review before import proceeds. The system never silently imports with unconfirmed column mappings.

4. **Duplicate URLs are flagged, not silently dropped:** When a URL in the import file matches an existing canonical URL in the user's shelf, it is highlighted yellow in the preview with the note "Already in your shelf." The user can choose to skip it or update metadata on the existing record.

---

# 7. Accessibility Standards

StudyShelf adheres to WCAG 2.1 Level AA to ensure compatibility with screen readers and assistive technologies.

| Requirement | Success Criterion | Implementation |
| :---- | :---- | :---- |
| Text Alternatives | 1.1.1 (Level A) | All extracted resource thumbnails must have descriptive alt-text |
| Keyboard Access | 2.1.1 (Level A) | Full navigation via Tab, Shift+Tab, and Enter keys |
| Color Contrast | 1.4.3 (Level AA) | Minimum 4.5:1 contrast ratio for all text |
| Visible Focus | 2.4.7 (Level AA) | High-visibility focus rings on all interactive elements |
| Input Identification | 1.3.5 (Level AA) | Proper HTML tagging on all form fields for browser autofill |
| Text Resize | 1.4.4 (Level AA) | UI must remain fully functional when text is scaled to 200% |

---

# 8. Acceptance Criteria

The MVP is considered complete when all of the following are true:

1. Web clipper saves a resource with auto-extracted title, description, and thumbnail in under 3 seconds
2. Duplicate URL detection correctly blocks saving the same canonical URL twice (with and without tracking params)
3. AI auto-tagging suggests at least 2 relevant tags for a saved resource and allows user to accept, reject, or modify them
4. SRS review queue appears on the Dashboard with correct due-today count from seed data
5. Rating a resource (Again / Hard / Good / Easy) correctly updates the interval and ease_factor in SRS_Data and schedules the next due_date
6. A resource skipped 3 consecutive times triggers the archival modal ("Read it now or delete it forever?")
7. Collections can be created, nested, and have resources assigned to them
8. Full-text search returns relevant results across titles and extracted article content
9. Admin can log in and see the full navigation including org-level analytics
10. Member can log in, save resources, and see only their own resources and shared org collections
11. Viewer cannot access admin-only routes via direct URL — returns 403 or redirects
12. Bulk CSV import correctly parses, deduplicates, and imports resources with a user-confirmed column mapping
13. Clean reading view renders article content without ads or navigation clutter
14. All screens are responsive at 375px mobile viewport with no broken layouts
15. Learning analytics dashboard shows correct completion rate, review history heatmap, and retention curve for seed data
16. Organization switching correctly scopes all resources and collections to the newly active org
17. PostgreSQL RLS prevents a Member from querying resources owned by another user, even via direct API call
18. Smart notification sends a weekly email digest listing the top 5 unread resources by Study Priority
19. Ease Factor never drops below 1.30 regardless of consecutive "Again" ratings
20. No console errors, no unhandled promise rejections, and no blank screens on any user flow
