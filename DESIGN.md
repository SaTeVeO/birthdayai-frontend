# BirthdayAI — Design System

Clean, minimal product aesthetic (Notion-like). Hebrew content, RTL throughout; the brand name **BirthdayAI** stays Latin/LTR. Built as streaming Design Components.

## Files
| File | Role |
|------|------|
| `BirthdayAI.dc.html` | Entry point — overview frames + interactive router, add-contact modal, toasts |
| `Landing.dc.html` | Marketing landing page |
| `Login.dc.html` | Login with live validation + error state |
| `Dashboard.dc.html` | Upcoming birthdays, stats, activity, empty state |
| `EditGreeting.dc.html` | AI greeting editor, channel selector, send flow |

Open `BirthdayAI.dc.html` for the full prototype.

## Color tokens
| Token | Hex | Use |
|-------|-----|-----|
| Primary (Indigo) | `#6366F1` | Buttons, links, brand mark, highlights |
| Primary hover | `#4F46E5` | Hover/active on primary |
| Secondary | `#EEF2FF` | Soft indigo fills, secondary buttons, badges |
| Secondary text | `#4F46E5` | Text on secondary fills |
| Accent (Amber) | `#F59E0B` | Activity dot; "היום!" badge uses `#FEF3C7` bg / `#B45309` text |
| Background | `#F3F4F6` | App canvas |
| Surface | `#FFFFFF` | Cards, navbars, modals |
| Subtle surface | `#F9FAFB` | Alternating section bg |
| Text primary | `#111827` | Headings, body |
| Text muted | `#6B7280` | Secondary text |
| Text faint | `#9CA3AF` | Meta, counters |
| Border | `#E5E7EB` | Inputs, dividers |
| Border subtle | `#EEF0F3` | Card borders |
| Border highlight | `#C7D2FE` | Today-card / hover border |
| Error | `#EF4444` | Invalid fields, over-limit counter |
| Error bg / text | `#FEF2F2` / `#B91C1C` | Error banner |
| Success | `#10B981` | Send confirmation |
| Success bg / text | `#ECFDF5` / `#065F46` | Success banner |

### Avatar monogram pairs (bg / text)
`#EEF2FF`/`#6366F1` · `#FEF3C7`/`#D97706` · `#DCFCE7`/`#16A34A` · `#FCE7F3`/`#DB2777` · `#E0F2FE`/`#0284C7`

## Typography
- **Font:** Inter (400/500/600/700/800), `system-ui` fallback. Minimum body size 16px on landing, 13–15px in dense app UI.
- Display H1 (hero): 56px / 800 / -0.03em
- Section H2: 34px / 800 / -0.02em
- Page title: 23–26px / 800 / -0.02em
- Card title: 16–19px / 700
- Body: 15–17px / 400–500, line-height 1.55
- Label / meta: 12–14px / 600

## Spacing
Base unit **8px**. Common steps: 4, 8, 12, 16, 20, 24, 28, 32, 56, 72, 88px.
Page gutters 32px; card padding 16–32px; grid gaps 12–24px.

## Radius
- Cards / surfaces: **12px** (large surfaces 14–16px, modals/hero card 16–18px, CTA band 24px)
- Buttons / inputs: **8px**
- Pills / badges / avatars: 999px

## Shadows
- Card: `0 1px 3px rgba(17,24,39,.05)`
- Raised card / today: `0 4px 14px -4px rgba(99,102,241,.25)`
- Modal: `0 24px 60px -12px rgba(0,0,0,.4)`
- Primary button: `0 4px 14px rgba(99,102,241,.35)`

## Components
- **Navbar** — 64px, white, sticky, `1px #EEF0F3` bottom border. Logomark (indigo rounded square) + "BirthdayAI" Latin/LTR.
- **Buttons** — Primary (indigo, white, shadow); Secondary (`#EEF2FF` / indigo text); Ghost (transparent); all 8px radius, 600 weight.
- **Contact card** — avatar monogram + name/relationship/date + days label + action. Today variant: `#C7D2FE` border, "היום!" badge, "שלח ברכה"; others: "ערוך ברכה".
- **Input** — 8px radius, `1.5px #E5E7EB` border; error: `1.5px #EF4444` + `0 0 0 3px rgba(239,68,68,.12)` ring.
- **AI badge** — `#EEF2FF` pill, indigo text + dot, "נוצר ע״י AI".

## RTL
Root `dir="rtl"`. Logo groups and Latin/number runs use `direction:ltr`. Layout mirrors automatically (logo at start/right, actions at end/left).
