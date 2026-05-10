# Project Plan — Held

## Vision

One calm place that holds everything on a person's mind — emails, messages, letters — so they can stop remembering it all themselves. Not a task manager. A worry-offloader. The hero moment is the empty state: *"You're clear. Nothing needs you today."*

## Phases

### Phase 1 — Mobile-only v1 (status: in progress)
- **Goal:** a mobile app that *feels* like the product, even though everything is mocked. Local-only, no backend, hardcoded sample data that looks real.
- **Scope:**
  - Home screen with Today / This week / Later sections (Later collapsed by default)
  - Empty state with breathing-dot animation
  - Add flow: single text input "what's on your mind?"
  - Tap to mark done, swipe to snooze (snooze just hides for now)
  - Item detail view showing source ("where this came from")
  - Daily local notification at user-set time, default 8am
  - MMKV local storage
- **Out of scope:** backend, auth, real connectors, AI extraction, onboarding flow, OCR, payments, web push.

### Phase 2 — Backend + accounts (status: not started)
- **Goal:** real data, cross-device sync, real Gmail integration.
- **Scope:**
  - `held-api/` Cloudflare Workers + Hono backend per global standards
  - Sign in with Apple + Sign in with Google via Better Auth (no email/password, no magic link)
  - Gmail OAuth with refresh tokens encrypted in D1
  - AI extraction pipeline using Anthropic API
  - Server-authoritative task state, cross-device sync
- **Out of scope:** WhatsApp, SMS, Slack, Jira connectors (later in phase 2 or phase 3).

### Phase 3 — Monetization (status: not started)
- **Goal:** premium subscription, sustainable business model.
- **Scope:**
  - In-app purchase via App Store / Play Store, abstracted through RevenueCat
  - Premium features TBD based on user feedback (likely: more connectors, longer history, smarter scheduling)
  - Free tier remains usable indefinitely; premium adds, doesn't gate the core promise
- **Out of scope:** anything that would gate the core worry-offloader promise behind a paywall.

## Current status

**Phase 1, in progress — first session.**

Working on initial scaffold: bootstrap files, Expo app, fonts, theme, home screen with mocked sample tasks. Waiting on the wireframe HTML from the user before building the home screen UI.

## Decisions log

Reverse-chronological. Each entry: date, decision, reasoning, alternatives considered.

- **2026-05-10** — **Credentials file for this project: `~/.baran-creds`.** Reasoning: matches the Expo account (`baranbartu`) the app will be owned by, and the GH account that will host the repo. Alternative considered: default `~/.gizem-creds`, rejected because it would mean a different GH account than the Expo owner.
- **2026-05-10** — **Multi-component layout (`held-app/` + future `held-api/`) chosen up front.** Reasoning: phase 2 will need a backend, and the global standard prefers naming components correctly from day one over restructuring later. `held-api/` is deferred (not scaffolded) until phase 2 begins.
- **2026-05-10** — **v1 is fully mocked: no backend, no auth, no real connectors, no AI extraction.** Reasoning: the product's worth is in the feeling of the UI — the calm, the plain language, the empty state. We need to nail that before any data pipeline. Real Gmail / AI / sync are phase 2.
- **2026-05-10** — **Zustand for cross-screen state, `useState` for everything else. No Redux, no React Query in v1.** Reasoning: per global mobile standard. The app has few cross-screen needs in v1 anyway.

## Open questions

- Wireframe HTML — user said they'd share it. Save to `docs/wireframe.html` and open visually before writing home screen UI. (Pending in this session.)
- Daily notification default time — set to 8am per brief; should this be configurable in v1 or hardcoded? Brief says "user-set time, default 8am" — likely a simple settings screen, but defer until home screen feels right.
- Snooze semantics — for v1 it just hides; later phases need real scheduling. Need to decide: hide forever vs. resurface tomorrow vs. resurface next week. Default for v1: hide for the current session only.
