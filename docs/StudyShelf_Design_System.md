# StudyShelf — Design System

**Purpose:** This document defines the visual language for StudyShelf. Every screen, component, and interaction must reference these tokens. No deviations unless explicitly requested.

**Reference aesthetic:** Warm, scholarly dark UI. Think "late-night reading session in a well-stocked library." Deep warm-tinted backgrounds, soft amber accents, and generous whitespace. Typography-forward — oversized display text for key metrics, fine caption text for metadata. Cards feel like paper shelves: slightly textured, warm-edged, with a subtle ambient glow from below rather than above. Status communicated through calm color language — not urgent, not alarming.

---

## 1. Visual Direction

| Principle | Meaning |
|---|---|
| **Dark-first, always** | No light mode. Canvas is a deep warm-tinted near-black. Off-white text throughout. |
| **Warm tones, not cold** | Amber/gold accent instead of indigo. Backgrounds have a slight warm bias to feel cozy, not clinical. |
| **Typography is the hero** | The "shelf" metaphor is expressed through type: big resource titles, tiny domain/date metadata, generous line height. |
| **Cards feel like paper** | Slightly warm card surfaces, thin warm-tinted borders, a soft inner gradient. Not glassy — more matte. |
| **Ambient shelf glow** | Soft radial gradient from bottom-center (warm gold) to evoke a reading lamp underneath the shelf. Applied once per page. |
| **Status is calm** | Green for mastered/present, amber for in-progress/warning, muted rose for missed/danger. No alarm-red. |
| **Breathing room is non-negotiable** | Large card padding, generous section spacing. This is a tool for focused study — visual clutter is the enemy. |

---

## 2. Color Tokens

Use these as CSS custom properties. No hardcoded hex values in components.

```css
:root {
  /* Canvas & Surfaces */
  --bg-void:            #080705;   /* Outermost page background — very dark warm black */
  --bg-canvas:          #0E0C09;   /* Main app background */
  --bg-surface:         #141210;   /* Default card background */
  --bg-surface-raised:  #1A1714;   /* Hover state, active nav item, modals */
  --bg-surface-inset:   #100E0C;   /* Input fields, inset wells */

  /* Borders */
  --border-subtle:      rgba(255, 240, 200, 0.06);   /* Default card borders — warm tint */
  --border-default:     rgba(255, 240, 200, 0.10);   /* Stronger dividers */
  --border-strong:      rgba(255, 240, 200, 0.18);   /* Focus rings, active states */

  /* Text */
  --text-primary:       #F2EDE4;   /* Headings, main content — warm off-white */
  --text-secondary:     #8C8070;   /* Labels, secondary info */
  --text-tertiary:      #524840;   /* Placeholder, disabled, captions */
  --text-inverse:       #0E0C09;   /* For buttons on light bg (rare) */

  /* Accent — the shelf glow */
  --accent-glow:        #D97706;   /* Amber — used for bottom glow, focus rings, active state */
  --accent-glow-soft:   rgba(217, 119, 6, 0.12);
  --accent-highlight:   #F59E0B;   /* Lighter amber for hover, sparklines */

  /* Semantic — Mastered / Success */
  --success-fg:         #34D399;
  --success-bg:         rgba(52, 211, 153, 0.10);
  --success-border:     rgba(52, 211, 153, 0.22);

  /* Semantic — Missed / Danger */
  --danger-fg:          #FB7185;
  --danger-bg:          rgba(251, 113, 133, 0.10);
  --danger-border:      rgba(251, 113, 133, 0.22);

  /* Semantic — In Progress / Warning */
  --warning-fg:         #FBBF24;
  --warning-bg:         rgba(251, 191, 36, 0.10);
  --warning-border:     rgba(251, 191, 36, 0.22);

  /* Semantic — Info / Neutral highlight */
  --info-fg:            #60A5FA;
  --info-bg:            rgba(96, 165, 250, 0.10);
  --info-border:        rgba(96, 165, 250, 0.22);

  /* SRS Rating colors */
  --srs-again:          #FB7185;   /* Again — danger */
  --srs-hard:           #FBBF24;   /* Hard — warning */
  --srs-good:           #34D399;   /* Good — success */
  --srs-easy:           #60A5FA;   /* Easy — info/blue */
}
```

**Usage rules:**
- Page `<body>` → `--bg-void`
- Main app shell → `--bg-canvas`
- Cards → `--bg-surface` with 1px `--border-subtle`
- Hovered or active state → `--bg-surface-raised`
- Inputs/textareas → `--bg-surface-inset` with `--border-default`
- Never layer more than 3 shades of warm-dark in one view.

---

## 3. Typography

**Font families:**
```css
--font-display: 'Lora', 'Georgia', serif;             /* Headings, hero numbers — scholarly serif */
--font-body:    'Inter', system-ui, sans-serif;       /* Everything else */
--font-mono:    'JetBrains Mono', 'SF Mono', monospace; /* URLs, dates, counts, tags */
```

Load Lora from Google Fonts: `https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap`

The serif display font is intentional — it reinforces the "book/shelf" metaphor and differentiates StudyShelf visually from generic SaaS dashboards.

**Type scale:**

| Token | Size | Line Height | Weight | Tracking | Usage |
|---|---|---|---|---|---|
| `text-display-hero` | 72px / 4.5rem | 1.0 | 700 | -0.02em | Page-level hero ("Your Shelf") |
| `text-display-lg` | 56px / 3.5rem | 1.05 | 700 | -0.018em | Big retention % number |
| `text-display-md` | 40px / 2.5rem | 1.1 | 700 | -0.015em | Card hero metrics |
| `text-display-sm` | 32px / 2rem | 1.15 | 600 | -0.01em | Card main values |
| `text-h1` | 28px / 1.75rem | 1.2 | 600 | -0.008em | Page titles |
| `text-h2` | 22px / 1.375rem | 1.3 | 600 | -0.004em | Section titles |
| `text-h3` | 18px / 1.125rem | 1.4 | 500 | 0 | Card titles, resource titles |
| `text-body-lg` | 16px / 1rem | 1.6 | 400 | 0 | Primary body copy |
| `text-body` | 14px / 0.875rem | 1.5 | 400 | 0 | Default body |
| `text-body-sm` | 13px / 0.8125rem | 1.45 | 400 | 0 | Secondary body, descriptions |
| `text-caption` | 12px / 0.75rem | 1.4 | 500 | 0.01em | Captions, meta |
| `text-label` | 11px / 0.6875rem | 1.3 | 500 | 0.08em, UPPERCASE | Tiny section labels |
| `text-micro` | 10px / 0.625rem | 1.2 | 600 | 0.06em, UPPERCASE | Badges, ticker tags |

**Rules:**
- Hero headings (`text-display-*`) always use `font-display` (Lora serif).
- All body copy, UI labels, and UI elements use `font-body` (Inter).
- URLs, domain names, dates, tag counts use `font-mono`.
- Uppercase labels always get letter-spacing. Never uppercase body text.
- Resource titles in cards use `text-h3` with `font-display` (serif). This is the signature StudyShelf look.

---

## 4. Spacing Scale

4px base. Use only these values.

```
--space-1:   4px
--space-2:   8px
--space-3:   12px
--space-4:   16px
--space-5:   20px
--space-6:   24px
--space-8:   32px
--space-10:  40px
--space-12:  48px
--space-16:  64px
--space-20:  80px
--space-24:  96px
```

**Common applications:**
- Card padding: `--space-6` (24px) mobile, `--space-8` (32px) desktop
- Gap between resource cards: `--space-5`
- Gap between page sections: `--space-12`
- Icon-to-label gap inside nav: `--space-3`
- Button internal padding: `--space-3` vertical, `--space-5` horizontal
- SRS rating buttons gap: `--space-3`

---

## 5. Border Radius

```
--radius-sm:    6px      /* Badges, tags, small pills */
--radius-md:    10px     /* Buttons, inputs */
--radius-lg:    14px     /* Nav items, small cards */
--radius-xl:    18px     /* Default resource cards */
--radius-2xl:   24px     /* Hero cards, modals */
--radius-full:  9999px   /* Status pills, SRS rating buttons, avatars */
```

**Rules:**
- Default resource card = `--radius-xl`
- SRS rating buttons = `--radius-full` (pill shape, makes them feel tactile/satisfying to press)
- Buttons and inputs = `--radius-md`
- Never mix more than 2 radii in one component

---

## 6. Shadows, Glows & Effects

```css
/* Card lift — subtle warmth */
--shadow-card: 0 1px 2px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--border-subtle);

/* Raised card (modals, active states) */
--shadow-raised: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--border-default);

/* Focus ring — amber */
--shadow-focus: 0 0 0 3px rgba(217, 119, 6, 0.30);

/* The page-level shelf glow (apply once, at bottom-center of main content) */
--glow-shelf: radial-gradient(
  ellipse 700px 250px at 50% 110%,
  rgba(217, 119, 6, 0.10),
  rgba(217, 119, 6, 0) 70%
);

/* Card inner highlight — matte paper look */
--card-gradient: linear-gradient(
  180deg,
  rgba(255, 245, 220, 0.015) 0%,
  rgba(255, 245, 220, 0) 60%
);

/* SRS card glow (applied on review screen during active review) */
--glow-review: radial-gradient(
  ellipse 400px 200px at 50% 50%,
  rgba(217, 119, 6, 0.08),
  rgba(217, 119, 6, 0) 70%
);
```

**Cards get three stacked layers:**
1. Base: `background: var(--bg-surface)`
2. Gradient overlay: `background-image: var(--card-gradient)` (warm paper feel)
3. Border: `box-shadow: var(--shadow-card)`

**Subtle dot grid (main canvas, optional):**
```css
background-image: radial-gradient(rgba(255, 240, 200, 0.018) 1px, transparent 1px);
background-size: 28px 28px;
```

---

## 7. Layout System

**Breakpoints:**
- Mobile: 375px–767px
- Tablet: 768px–1023px
- Desktop: 1024px+

**Sidebar:**
- Width on desktop: 260px
- Collapses to icon-only (72px) on tablet
- Bottom nav on mobile

**Main content area:**
- Max width: 1400px, centered
- Horizontal padding: 24px (mobile), 32px (tablet), 48px (desktop)
- The shelf glow sits at the bottom of the viewport, so avoid excess bottom padding on the outermost wrapper

**Grid:**
- 12-column on desktop, 24px gutter
- Resource cards: 3-up on desktop, 2-up on tablet, 1-up on mobile
- Dashboard stats: 4-up on desktop, 2-up on tablet, 1-up on mobile

---

## 8. Component Specifications

### 8.1 Sidebar Navigation

**Structure:**
```
[Logo + "StudyShelf"]  [Collapse chevron]
──────────────────────────────────────────
[User block: name + org switcher if org user]
──────────────────────────────────────────
LABEL: Study
  ▸ Dashboard (active)
  ▸ My Shelf
  ▸ Review Queue   [N due today]
LABEL: Organize
  ▸ Collections
  ▸ Tags
LABEL: Insights
  ▸ Analytics
LABEL: Account
  ▸ Settings
  ▸ Logout
```

For Admin role, add between Insights and Account:
```
LABEL: Organization
  ▸ Org Analytics
  ▸ Manage Members
  ▸ Learning Paths
```

**Visual rules:**
- Background: `--bg-canvas` (no contrast from main area)
- Right edge: 1px `--border-subtle` divider
- Section labels: `text-label`, `--text-tertiary`, `--space-5` bottom margin
- Nav items: 44px height, `--space-4` horizontal padding, `--radius-lg`
- Icon size: 20px, stroke 1.75px, color `--text-secondary`
- Label font: `text-body`, color `--text-secondary`
- **Active state:** background `--bg-surface-raised`, icon + label `--text-primary`, 2px left border in `--accent-glow`
- Hover: background `--bg-surface`, no transform
- "N due today" badge on Review Queue: `text-micro`, `--radius-full`, `--warning-bg` bg, `--warning-fg` text

### 8.2 Cards

**Default resource card:**
```css
.card {
  background: var(--bg-surface);
  background-image: var(--card-gradient);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  padding: var(--space-8);
}
```

**Hero card (metrics, today's review summary):**
- `--radius-2xl`
- Padding: `--space-10`
- May contain a sparkline/progress bar at the bottom

**Resource card anatomy (the most common card type):**
```
[Thumbnail — 56px height, full-width, rounded-t-xl, object-cover]
────────────────────────────────────────────────────────────────
[Domain + date — text-caption mono, --text-tertiary]
[Resource title — text-h3 font-display (serif)]
[Description — text-body-sm, max 2 lines, --text-secondary]

[Tag chips row]                      [SRS due date or "Mastered" pill]
```

**Card header pattern (for dashboard/analytics cards):**
- Label: `text-label`, `--text-tertiary`, margin-bottom `--space-2`
- Title: `text-h2` or `text-display-sm`

### 8.3 Buttons

**Primary button:**
```css
.btn-primary {
  background: var(--text-primary);   /* warm off-white */
  color: var(--text-inverse);
  border-radius: var(--radius-md);
  padding: 12px 20px;
  font: 500 14px var(--font-body);
  letter-spacing: -0.005em;
}
.btn-primary:hover { background: #E8E0D4; }
```

**Secondary button:**
```css
.btn-secondary {
  background: var(--bg-surface-raised);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 12px 20px;
}
```

**Accent button (used sparingly — e.g., "Start Review"):**
```css
.btn-accent {
  background: var(--accent-glow);
  color: #fff;
  border-radius: var(--radius-md);
  padding: 12px 20px;
}
.btn-accent:hover { background: var(--accent-highlight); }
```

**SRS Rating Buttons (Again / Hard / Good / Easy):**
- Full pill shape (`--radius-full`), large (48px height, 24px horizontal padding)
- Each has its own semantic color:
  - Again: `--srs-again` border + text, `--danger-bg` bg
  - Hard: `--srs-hard` border + text, `--warning-bg` bg
  - Good: `--srs-good` border + text, `--success-bg` bg
  - Easy: `--srs-easy` border + text, `--info-bg` bg
- On hover: fill becomes 20% opaque version of the semantic color
- Below each button: tiny caption showing next interval ("6 days", "1 month")

**Destructive button:** secondary shape, `--danger-fg` color, `--danger-border` border.

**Sizes:**
- Small: 32px height, 12px horizontal padding, 13px text
- Default: 40px height, 20px horizontal padding, 14px text
- Large: 48px height, 24px horizontal padding, 16px text

### 8.4 Inputs & Forms

```css
.input {
  background: var(--bg-surface-inset);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  color: var(--text-primary);
  font: 400 14px var(--font-body);
  height: 44px;
}
.input:focus {
  border-color: var(--accent-glow);
  box-shadow: var(--shadow-focus);
  outline: none;
}
.input::placeholder { color: var(--text-tertiary); }
```

Label: `text-label`, `--text-secondary`, margin-bottom `--space-2`.
Helper text: `text-caption`, `--text-tertiary`.
Error state: border `--danger-border`, helper `--danger-fg`.

**Search input (Shelf search):** includes a 16px search icon on the left, inset `--space-5` padding-left.

### 8.5 Badges & Status Pills

**Status pill:**
```css
.pill {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font: 600 12px var(--font-body);
}
.pill-success {
  background: var(--success-bg);
  color: var(--success-fg);
  border: 1px solid var(--success-border);
}
.pill-warning {
  background: var(--warning-bg);
  color: var(--warning-fg);
  border: 1px solid var(--warning-border);
}
.pill-danger {
  background: var(--danger-bg);
  color: var(--danger-fg);
  border: 1px solid var(--danger-border);
}
```

**SRS status pills (used on resource cards):**
- "Due Today" → `pill-warning`
- "Mastered" → `pill-success`
- "New" → info style
- "Overdue" → `pill-danger`

**Tag chips (on resource cards):**
- `text-micro`, `--radius-sm`, `--bg-surface-raised` bg, `--text-secondary` color, `--border-subtle` border
- Custom tag colors (user-set hex) applied as a 3px left border on the chip, not as fill

### 8.6 Tables

```css
.table { width: 100%; border-collapse: separate; border-spacing: 0; }
.table thead th {
  text-align: left;
  padding: 14px 20px;
  font: 500 11px var(--font-body);
  color: var(--text-tertiary);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-bottom: 1px solid var(--border-subtle);
}
.table tbody td {
  padding: 16px 20px;
  font: 400 14px var(--font-body);
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-subtle);
}
.table tbody tr:hover { background: var(--bg-surface-raised); }
```

**First column (resource title in table view):** `text-body`, `font-display` (serif), full weight.
**Domain/URL column:** `text-caption font-mono`, `--text-tertiary`.
**Status column:** always a status pill.

### 8.7 Stat Strip (Dashboard ticker)

Horizontal strip at the top of dashboard:
```
[BookOpen icon] RESOURCES  [142]  |  [Clock icon] DUE TODAY  [8]  |  [TrendingUp icon] AVG RECALL  [87%]  |  [Star icon] MASTERED  [34]
```
- Items separated by 1px `--border-subtle` vertical dividers
- Label: `text-label`, `--text-tertiary`
- Value: `text-body-lg`, weight 600, `--text-primary`, `tabular-nums`
- Icon: 16px, `--text-tertiary`
- Horizontally scrollable on mobile

### 8.8 SRS State Indicators

**On resource cards:**
- Due dot: 8px circle, `--warning-fg` fill + 14px soft glow halo
- Overdue dot: 8px circle, `--danger-fg` fill
- Mastered dot: 8px circle, `--success-fg` fill
- Not activated: 8px circle, `--text-tertiary` at 40% opacity

**Retention heatmap (Analytics screen):**
- Each day cell = 32×32px, `--radius-md`
- Reviewed + rated Good/Easy: `--success-bg` + `--success-border`
- Reviewed + rated Hard/Again: `--warning-bg` + `--warning-border`
- Not reviewed (overdue): `--danger-bg` + `--danger-border`
- No review scheduled: `--bg-surface-inset`, no border
- Today: additional 2px `--accent-glow` inset ring

**Ease Factor visual indicator (shown on detailed resource view):**
- Horizontal bar, `--bg-surface-inset` track
- Fill: gradient from `--danger-fg` (EF 1.3) through `--warning-fg` (EF 2.0) to `--success-fg` (EF 3.0+)
- Current position marker: 4px wide, `--text-primary`

### 8.9 Progress Bars

```css
.progress-track {
  height: 6px;
  background: var(--bg-surface-inset);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  background: var(--success-fg);   /* or --accent-glow for neutral progress */
  transition: width 0.6s ease;
}
```

For retention/recall bars:
- >80% → `--success-fg` fill
- 60–80% → `--warning-fg` fill
- <60% → `--danger-fg` fill

### 8.10 Modal / Dialog

```css
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(8, 7, 5, 0.75);
  backdrop-filter: blur(6px);
}
.modal {
  background: var(--bg-surface-raised);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-raised);
  padding: var(--space-10);
  max-width: 560px;
  width: calc(100% - 32px);
}
```

**Confirmation dialogs** (required for all destructive actions):
- Title: `text-h2` serif
- Body: `text-body-lg`, `--text-secondary`
- Actions: destructive button right-aligned, "Cancel" secondary to its left

### 8.11 Toast Notifications

Top-right, stacked.
- Width: 360px, padding `--space-4` `--space-5`
- Background: `--bg-surface-raised`, border `--border-default`, `--radius-lg`
- Leading icon 20px: check (success), warning (warning), X (error)
- Title: `text-body` weight 600
- Body: `text-body-sm` `--text-secondary`
- Auto-dismiss after 4s.

### 8.12 Empty States

Every screen that queries data must have an empty state. Empty states in StudyShelf should use **encouraging, future-oriented language** — never blame the user.

| Screen | Empty State Message | CTA |
|---|---|---|
| My Shelf | "Your shelf is waiting. Save your first resource to begin." | "Install Web Clipper" |
| Review Queue | "You're all caught up! Check back tomorrow." | "Browse My Shelf" |
| Collections | "No collections yet. Create one to start organizing." | "New Collection" |
| Search results | "No resources match that search. Try different keywords." | "Clear Filters" |
| Org shared shelf | "Your organization hasn't shared any resources yet." | "Invite Members" |

Visually: a simple icon (from Lucide, 48px, `--text-tertiary`) + headline (`text-h3`, `--text-secondary`) + CTA button.

---

## 9. Iconography

- **Library:** Lucide React
- **Default size:** 20px (24px section headers, 16px inline with text)
- **Stroke width:** 1.75px uniformly
- **Color:** `--text-secondary` default; `--text-primary` on active/hover; semantic colors for status
- Outlined only. No filled icons.

**Icon mapping for StudyShelf:**
- Dashboard → `LayoutDashboard`
- My Shelf → `BookMarked`
- Review Queue → `Brain`
- Collections → `FolderOpen`
- Tags → `Tag`
- Analytics → `BarChart2`
- Org Analytics → `Users`
- Import/Bulk Upload → `Upload`
- Settings → `Settings`
- Logout → `LogOut`
- Resource type — slides → `Presentation`
- Resource type — link → `Link`
- Resource type — PDF → `FileText`
- Resource type — video → `PlayCircle`
- SRS — Again → `RotateCcw`
- SRS — Hard → `Frown`
- SRS — Good → `Smile`
- SRS — Easy → `Zap`

---

## 10. Tailwind Config Snippet

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        void: '#080705',
        canvas: '#0E0C09',
        surface: {
          DEFAULT: '#141210',
          raised: '#1A1714',
          inset: '#100E0C',
        },
        border: {
          subtle: 'rgba(255,240,200,0.06)',
          default: 'rgba(255,240,200,0.10)',
          strong: 'rgba(255,240,200,0.18)',
        },
        fg: {
          primary: '#F2EDE4',
          secondary: '#8C8070',
          tertiary: '#524840',
        },
        accent: {
          glow: '#D97706',
          highlight: '#F59E0B',
        },
        success: { DEFAULT: '#34D399', bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.22)' },
        danger:  { DEFAULT: '#FB7185', bg: 'rgba(251,113,133,0.10)', border: 'rgba(251,113,133,0.22)' },
        warning: { DEFAULT: '#FBBF24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.22)' },
        info:    { DEFAULT: '#60A5FA', bg: 'rgba(96,165,250,0.10)', border: 'rgba(96,165,250,0.22)' },
      },
      fontFamily: {
        display: ['Lora', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      fontSize: {
        'display-hero': ['4.5rem', { lineHeight: '1.0',  letterSpacing: '-0.02em',  fontWeight: '700' }],
        'display-lg':   ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.018em', fontWeight: '700' }],
        'display-md':   ['2.5rem', { lineHeight: '1.1',  letterSpacing: '-0.015em', fontWeight: '700' }],
        'display-sm':   ['2rem',   { lineHeight: '1.15', letterSpacing: '-0.01em',  fontWeight: '600' }],
        'label':   ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.08em', fontWeight: '500' }],
        'micro':   ['0.625rem',  { lineHeight: '1.2', letterSpacing: '0.06em', fontWeight: '600' }],
      },
      borderRadius: {
        'xl':  '1.125rem',
        '2xl': '1.5rem',
      },
      backgroundImage: {
        'shelf-glow':    'radial-gradient(ellipse 700px 250px at 50% 110%, rgba(217,119,6,0.10), rgba(217,119,6,0) 70%)',
        'card-gradient': 'linear-gradient(180deg, rgba(255,245,220,0.015) 0%, rgba(255,245,220,0) 60%)',
        'dot-grid':      'radial-gradient(rgba(255,240,200,0.018) 1px, transparent 1px)',
        'review-glow':   'radial-gradient(ellipse 400px 200px at 50% 50%, rgba(217,119,6,0.08), rgba(217,119,6,0) 70%)',
      },
      backgroundSize: {
        'dot-grid': '28px 28px',
      },
    },
  },
};
```

---

## 11. Screen-Specific Application

### 11.1 Login / Onboarding Screen

- No sidebar. Full-screen centered.
- Background: `bg-void` + subtle shelf glow at bottom
- Card: `bg-surface`, `rounded-2xl`, max-width 440px, padding 48px
- Logo (a small open book icon) + "StudyShelf" in `text-h1 font-display` at top
- Tagline below: "Save smarter. Study deeper." in `text-body` `--text-secondary`
- Social login: "Continue with Google" as primary button (full width)
- Divider: thin `--border-subtle` line with "or" in `text-caption` `--text-tertiary`
- Email + password fields per §8.4
- "Sign In" secondary full-width button
- After first login: step-by-step onboarding (install clipper, save first resource, activate SRS)

### 11.2 Dashboard

- **Hero row:** "Good evening, {name}" in `text-display-hero font-display`, "You have {N} resources due for review." in `text-body-lg` `--text-secondary`
- **Stat strip:** Resources | Due Today | Avg Recall | Mastered
- **Cards row 1 (2-up):**
  - Review Queue hero — big "8 due today" number, "Est. 12 min" below, "Start Review" accent button
  - Shelf Health — retention curve sparkline, avg ease factor, "at risk" count
- **Cards row 2 (2-up):**
  - Recently Saved — last 5 resource thumbnails/titles
  - Recent Activity — last 5 review results, imports, and saves

### 11.3 My Shelf Screen

- Filter bar: search input (full-width, leading icon) + filter dropdowns (Collection, Tag, Status) + sort dropdown
- Resource cards in 3-column grid
- Each resource card per §8.2 anatomy
- Bulk action bar (appears when resources are selected): add to collection, activate SRS, delete — floats at bottom of screen
- "Save Resource" button (+ icon) floated bottom-right on mobile (FAB style)

### 11.4 Review Screen

- No sidebar distraction — sidebar collapses to icon-only automatically when Review is active
- Center-screen: single resource card, large, `--radius-2xl`, with `review-glow` behind it
- Top: progress indicator "3 / 12" + estimated time remaining
- Card shows: resource title (serif, large), domain + date (mono caption), description, thumbnail
- "Show Article" expand button → inline clean reading view slides in below
- Rating buttons row at bottom — 4 pill buttons per §8.3 (Again / Hard / Good / Easy)
- On hover of rating button: tooltip shows next interval ("Good → in 6 days")
- Skip button: text link style, `--text-tertiary`, right-aligned above rating buttons
- Skip count indicator: "Skipped 2×" warning appears after 2nd skip; after 3rd, archival modal fires
- On queue complete: full-screen celebration — icon, "Queue cleared!" in `text-display-sm`, stats (reviewed, avg rating, next due), "Back to Shelf" button

### 11.5 Collections Screen

- Left panel (240px): collection tree — hierarchical, drag-to-reorder, icons visible
- Right panel: resource grid for selected collection, same card style as Shelf
- "New Collection" button: top of left panel, secondary style
- Collection edit: click collection name → inline rename. Right-click or ⋮ → move, delete

### 11.6 Analytics Screen

**Individual view (all roles):**
- Hero metric: retention percentage in `text-display-hero`, color-coded
- 4 stat cards: Resources Saved, Reviews Completed, Avg Ease Factor, Mastered Count
- Review heatmap (per §8.8) — GitHub contribution graph style
- Retention curve chart: time on X, recall probability on Y, each tracked resource as a line
- Monthly breakdown table

**Admin org view (additional):**
- Cohort completion rates — horizontal bar chart, one bar per member
- Knowledge Retention score per member, color-coded
- AI decision log table — exportable
- Content fatigue signals — resources with declining engagement flagged

### 11.7 Bulk Import Screen

- Step indicator at top: 4 steps with numbered circles (same pattern as ForgeTrack §11.5 but amber accent)
- **Step 1 — Upload:** Large drag-drop zone, `--radius-2xl`, dashed `--border-default`, hover: amber border + `accent-glow-soft` bg. Shows filename, URL count, detected format on drop.
- **Step 2 — Map Columns:** 2-column layout. Source columns left, target field dropdowns right. IGNORE option always present.
- **Step 3 — Preview:** Color-coded rows (3px left border: green/amber/red). Summary bar. Duplicate URL chips shown in amber.
- **Step 4 — Import:** Amber progress bar on `bg-surface-inset` track. Success card with count summary.

### 11.8 Login (Org Switcher)

After login, if user belongs to multiple orgs:
- Top of sidebar: org name + chevron
- Click → popover with org list + "Personal Workspace" option
- Switching org re-scopes all resource queries immediately

---

## 12. Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Use Lora (serif) for display text and resource titles | Use Inter everywhere — it erases the scholarly feel |
| Use `tabular-nums` on all numeric displays | Let numbers shift width as they update |
| Apply shelf glow once at bottom of main content | Repeat the glow at top or multiple times |
| Use SRS semantic colors for Again/Hard/Good/Easy consistently | Mix up which color means which rating |
| Make tag chips use a left-border for color, not filled bg | Fill entire chip with tag color — it's too loud |
| Keep borders at 6–18% warm-white opacity | Use solid gray borders that break the warm feel |
| Pair huge serif display type with tiny mono captions | Use similar sizes throughout — kills the hierarchy |
| Keep icons outlined, 1.75px stroke, Lucide only | Mix filled and outlined icons, or use a different library |
| Use `--accent-glow` (amber) only for focus rings, active states, and the shelf glow | Paint large surfaces amber — it's accent, not fill |
| Show the next SRS interval on rating button hover | Make users guess what clicking "Good" will do |
| Celebrate queue completion with a distinct done-state screen | Just redirect to shelf silently |

---

## 13. Implementation Checklist

Before shipping any screen, verify:

- [ ] Page background is `bg-void` or `bg-canvas`, not pure black
- [ ] Shelf radial glow applied once at bottom-center of main content
- [ ] All cards use `bg-surface` + `card-gradient` overlay + `shadow-card`
- [ ] Resource titles in cards use `font-display` (Lora serif)
- [ ] All numeric values use `font-variant-numeric: tabular-nums`
- [ ] URLs and domain names rendered in `font-mono`
- [ ] All SRS state (due, overdue, mastered, new) uses pills, not raw colored text
- [ ] SRS rating buttons are full-pill-shaped with the four correct semantic colors
- [ ] Dashboard hero numbers appear in `text-display-md` or larger
- [ ] Sidebar active item has the 2px left `accent-glow` (amber) border
- [ ] Icons are Lucide, outlined, 20px, 1.75 stroke
- [ ] Every destructive action has a confirmation modal
- [ ] All empty states use encouraging language (no "You haven't done X yet")
- [ ] Mobile viewport (375px) renders without horizontal scroll
- [ ] Focus states use `accent-glow` 3px ring (amber, keyboard accessible)
- [ ] No `color: #fff`, no `background: #000` hardcoded — only tokens

---

**End of design system.** Reference this doc alongside `StudyShelf_Spec_Sheet.md` and `SKILL_build_studyshelf.md` in every session that builds or modifies StudyShelf UI.
