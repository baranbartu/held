# Held

## Elevator pitch

A mobile app that gives people one calm place to see everything that needs them — emails, messages, letters, all of it — so they can stop holding it in their head. It is **not** a task manager. It is a **worry-offloader**: *"Held holds what's on your mind, so you don't have to."*

## Plain-language description

- **To a 7-year-old:** It's an app that remembers all the things you have to do, so you don't have to remember them yourself. It tells you when it's time.
- **To a 77-year-old:** It's a quiet helper on your phone. It looks at your emails and messages, picks out the things that need a reply or an action, and shows them to you in one simple list with the dates that matter.

## Persona / target user

People drowning in inputs from too many channels — work emails, Slack pings, WhatsApp from family, SMS appointment confirmations, physical mail with deadlines. They've tried Todoist, Notion, Things, Akiflow, Saner.ai. All of them feel like more work. They want a Post-it note that's smart enough to read their email.

## Architecture

Multi-component project. Layout:

```
/Users/baranbartudemirci/dev/projects/held/
├── AGENTS.md
├── CLAUDE.md           # this file
├── PROJECT_PLAN.md     # living plan, status, decisions
├── docs/
│   └── wireframe.html  # visual reference, source of truth for layout
├── held-app/           # React Native + Expo (phase 1)
└── held-api/           # Cloudflare Workers + Hono (phase 2, not yet scaffolded)
```

For v1: mobile-only, no backend, no auth, no real connectors, no AI extraction. Everything is mocked locally so we can iterate on the feel of the product before wiring real data.

## Tech stack

**Mobile (`held-app/`):**
- React Native with Expo (managed workflow)
- TypeScript, strict mode
- Expo Router (file-based navigation)
- Zustand for cross-screen state, `useState` for local state
- StyleSheet API for styling (no NativeWind in v1)
- `expo-secure-store` for secrets, `react-native-mmkv` for app data
- `expo-font` for Fraunces (serif) + Manrope (sans)
- `expo-notifications` for the daily local notification
- ESLint + Prettier with `eslint-config-expo`
- Bundle ID: `com.bote.held`, Expo owner: `baranbartu`

**Backend (`held-api/`, phase 2):**
- Cloudflare Workers + Hono
- D1, KV, R2 as needed
- Better Auth via `better-auth-cloudflare` for Sign in with Apple + Sign in with Google

## Core principles (do not violate without explicit discussion)

1. **One list. Three sections: Today, This week, Later.** No projects, tags, priorities, filters, calendar views, or folders. Ever.
2. **Plain language only.** "HR is waiting" not "High priority." "Due in 3 weeks" not "May 31, 2026."
3. **Source is always visible.** Every item shows where it came from (gmail, whatsapp, letter, etc.) in tiny lowercase.
4. **Two gestures: swipe to snooze, tap to mark done.** No long-press menus, no edit modals, no confirmation dialogs.
5. **Precision over recall.** Better to miss 5 real tasks than surface 1 fake one.
6. **The empty state is the hero.** "You're clear. Nothing needs you today."
7. **Quiet by default.** No red badges, no notification dots, no urgency theater.

## Visual design tokens

Color palette:
- Paper background: `#F1EBDD`
- Screen surface: `#FAF6EC`
- Ink (primary text): `#211D17`
- Ink soft (secondary): `#4A4239`
- Muted (metadata): `#978E7E`
- Hairline (dividers): `#D9D0BC`
- Accent (terracotta): `#B85C3C`
- Accent soft: `#D78A6A`
- Done: `#6B8E5A`

Typography:
- **Fraunces** (serif), 300–500, italic for emphasis — headings, item titles, greetings
- **Manrope** (sans), 400–600, often uppercase with letter-spacing — UI metadata, section heads

Visual reference: `docs/wireframe.html`. Open it visually before writing UI code. Match its spirit; pixel values can flex for React Native.

## Credentials

This project uses `~/.baran-creds` (GitHub account `baranbartu`, Expo username `baranbartu`).

## Living plan

The living plan, status, and decisions log is `./PROJECT_PLAN.md`. Update it whenever a change has lasting impact so future sessions can pick up where this one left off.

## Update directive

If any decision, architectural change, scope shift, or learning in this session has impact beyond the current task, update this file and/or `PROJECT_PLAN.md` before ending the session. A session that left the project in a different state than it found it but didn't update these files has failed its handoff to the next session.
