# Project Plan — Held

## Vision

One calm place that holds everything on a person's mind — emails, messages, letters — so they can stop remembering it all themselves. Not a task manager. A worry-offloader. The hero moment is the empty state: *"You're clear. Nothing needs you today."*

## Phases

### Phase 1 — Mobile-only v1 (status: in progress)

**Goal:** a mobile app that *feels* like the product, even though everything is mocked. Local-only, no backend, hardcoded sample data that looks real.

**In scope:**
- [x] Home screen with Today / This week / Later sections (Later collapsed by default)
- [x] Empty state with "You're clear." copy + breathing-dot animation
- [ ] Add flow: single text input "what's on your mind?"
- [ ] Tap to mark done
- [ ] Swipe to snooze (just hides the item for v1; no scheduling yet)
- [ ] Item detail view ("where this came from")
- [ ] Daily local notification at user-set time, default 8am
- [ ] MMKV local storage (requires moving off Expo Go to a dev client)
- [ ] Wire empty state to real data condition (currently a MODE constant toggles it)
- [ ] Switch hardcoded header date to live date with `date-fns`

**Out of scope (deferred):**
- Backend / API
- Auth / accounts
- Real connectors (Gmail, WhatsApp, SMS, Slack, Jira)
- AI extraction
- Onboarding flow
- Letter scanning / OCR
- Web push, server-sent notifications
- Subscription / payments

### Phase 2 — Backend + accounts (status: not started)

**Goal:** real data, cross-device sync, real Gmail integration.

**In scope:**
- [ ] `held-api/` scaffolded — Cloudflare Workers + Hono per global standards
- [ ] D1 schema + migrations for users and tasks
- [ ] Better Auth via `better-auth-cloudflare` — Sign in with Apple + Sign in with Google (no email/password, no magic link)
- [ ] Gmail OAuth with refresh tokens encrypted in D1
- [ ] AI extraction pipeline using Anthropic API
- [ ] Server-authoritative task state, cross-device sync

**Out of scope (later in phase 2 or in phase 3):**
- WhatsApp, SMS, Slack, Jira connectors

### Phase 3 — Monetization (status: not started)

**Goal:** premium subscription, sustainable business model. Free tier remains usable indefinitely; premium adds, doesn't gate the core promise.

**In scope:**
- [ ] In-app purchase via App Store / Play Store, abstracted through RevenueCat
- [ ] Premium features TBD based on user feedback (likely: more connectors, longer history, smarter scheduling)

**Out of scope:**
- Anything that gates the core worry-offloader promise behind a paywall

## Current status

**Phase 1, in progress. Session 2 of 2026-05-11 in flight.** Repo live at https://github.com/baranbartu/held with CI green.

**Done so far:**
- [x] Bootstrap files (`AGENTS.md`, `CLAUDE.md`, `PROJECT_PLAN.md`, `README.md`)
- [x] `held-app/` scaffolded — Expo SDK 54, Expo Router, TypeScript strict
- [x] Mobile-only (iOS + Android); web platform stripped consistently from `package.json` and `app.json`
- [x] Bundle ID `com.bote.held`, Expo owner `baranbartu`, scheme `held`
- [x] Fraunces (300/400/500 + italics) and Manrope (400/500/600) wired via `@expo-google-fonts/*` in the root layout; splash held until fonts load
- [x] Theme tokens (palette + font families) in `held-app/theme/`
- [x] `eas.json` with development / preview / production profiles (no submit config)
- [x] ESLint + Prettier configured; typecheck + lint pass
- [x] `.github/workflows/ci.yml` runs typecheck + lint on push to `main`; CI green
- [x] `docs/wireframe.html` saved as visual source of truth
- [x] Home screen (`app/index.tsx`) implemented against the wireframe with sample tasks (Today × 3, This week × 2, Later — 4 things footer)
- [x] Empty state in the same file, toggleable via `MODE` constant; breathing-dot animation on a 4s loop via Reanimated

**Next up (this session or the next):**
- [ ] User reviews home screen + empty state on device, flags anything off vs. the wireframe
- [ ] Add flow — bottom sheet (or full screen) with single text input "what's on your mind?"
- [ ] Tap-to-mark-done with a small confirmation (the cross-out moment matters)
- [ ] Swipe-to-snooze gesture (just hides for v1)
- [ ] Item detail view ("where this came from")
- [ ] Wire `MODE` to real data condition (`todayTasks.length === 0`) once tap-to-done is working
- [ ] Switch hardcoded date to live, with `date-fns` formatting

**After UI feels right:**
- [ ] Move off Expo Go to a dev client; add `react-native-mmkv` for local persistence
- [ ] Add `expo-notifications` for the daily 8am notification

## Decisions log

Reverse-chronological. Each entry: date, decision, reasoning, alternatives considered. (Decisions are historical and don't take checkboxes.)

- **2026-05-11** — **`MODE` constant at the top of `app/index.tsx` to toggle between task list and empty state during mocked v1.** Reasoning: faster than navigating to two routes and avoids wiring conditional logic before there's any way to *make* the list empty (no mark-done yet). Replace with `todayTasks.length === 0` once mark-done lands.
- **2026-05-11** — **Reanimated 4 (via the installed `react-native-worklets` package) for the breathing-dot animation.** Reasoning: Expo SDK 54 ships with Reanimated 4 and the worklets babel plugin is auto-configured; works in Expo Go for iOS. Alternative considered: pure `Animated` API — rejected because Reanimated 4 is the project's animation standard going forward and we'd just have to migrate later.
- **2026-05-11** — **`PROJECT_PLAN.md` uses checkboxes throughout** (scope, current status, next steps, open questions). Reasoning: the user finds it easier to follow at a glance than free-form prose status. Saved as a project-style memory so future projects start this way.
- **2026-05-10** — **One git repo at the project root, not one per component.** Reasoning: docs (especially the wireframe) and both components belong to one product and should be versioned together. Alternative considered: separate repos for `held-app/` and `held-api/` — rejected as premature decoupling.
- **2026-05-10** — **`legacy-peer-deps=true` in `.npmrc`.** Reasoning: `expo-router` and `@expo/metro-runtime` declare `react-dom` as a peerOptional dep that npm 10+ pulls in anyway, then resolves to a version conflicting with expo's pinned `react`. Local `npm install` warns and overrides; `npm ci` is strict and fails. `.npmrc` makes both behave the same — the canonical Expo fix. Alternative considered: pinning `react-dom` explicitly to `react`'s version — rejected because it implies web support we don't have.
- **2026-05-10** — **Mobile-only, web platform stripped from day one.** Reasoning: the product is a mobile-first worry-offloader; web is out of scope and removing the deps now keeps the bundle clean and avoids drift between `package.json`, `app.json` platforms, and react-native-web/react-dom. Alternative considered: keep web for quick prototyping in a browser — rejected because it imports a different rendering model that hides RN font/spacing realities.
- **2026-05-10** — **`@expo-google-fonts/*` for Fraunces and Manrope (runtime fetch + cache), not bundled font files.** Reasoning: simpler than shipping `.ttf` assets, avoids configuring the `expo-font` plugin's static paths, splash screen is held until both font families load so there's no FOUT. Alternative considered: bundling the .ttf files via expo-font — defer until we have stable font weights and want offline-first font availability.
- **2026-05-10** — **Expo-Go-friendly stack for now: no `react-native-mmkv`, no `expo-notifications` until home screen feels right.** Reasoning: both require a dev client (no Expo Go support for native modules), and we want fast iteration on UI first. They're in v1 scope and will land in a follow-up session.
- **2026-05-10** — **Visual confirmation of the wireframe via Safari/computer-use was attempted but timed out (no user response to the access prompt). Built the home screen from the HTML/CSS source instead.** Reasoning: the source is unambiguous and all design tokens (colors, fonts, spacing) are explicit. We'll iterate on layout once the user runs the app on a device. Note for next session: if visual confirmation is wanted, set up a Claude Preview launch.json that serves `docs/` via `python3 -m http.server`.
- **2026-05-10** — **Credentials file for this project: `~/.baran-creds`.** Reasoning: matches the Expo account (`baranbartu`) the app will be owned by, and the GH account that will host the repo. Alternative considered: default `~/.gizem-creds`, rejected because it would mean a different GH account than the Expo owner.
- **2026-05-10** — **Multi-component layout (`held-app/` + future `held-api/`) chosen up front.** Reasoning: phase 2 will need a backend, and the global standard prefers naming components correctly from day one over restructuring later. `held-api/` is deferred (not scaffolded) until phase 2 begins.
- **2026-05-10** — **v1 is fully mocked: no backend, no auth, no real connectors, no AI extraction.** Reasoning: the product's worth is in the feeling of the UI — the calm, the plain language, the empty state. We need to nail that before any data pipeline. Real Gmail / AI / sync are phase 2.
- **2026-05-10** — **Zustand for cross-screen state, `useState` for everything else. No Redux, no React Query in v1.** Reasoning: per global mobile standard. The app has few cross-screen needs in v1 anyway.

## Open questions

- [ ] **Header date** — currently hardcoded `saturday · may 9` to match the wireframe. Switch to live date with `date-fns` (e.g. `eeee · MMMM d` lowercased). Decision: live date once layout is stable.
- [ ] **Swipe-hint affordance** — the wireframe shows a subtle gradient + "swipe →" on the third task as a teaching cue. Skipped in the first build because the swipe gesture isn't wired yet. Open: when swipe-to-snooze lands, permanent visual hint vs. once-on-first-run vs. pure discovery?
- [ ] **Daily notification default time** — brief says "user-set time, default 8am". Open: configurable in v1 settings, or hardcoded to 8am for v1 with settings in v2?
- [ ] **Snooze semantics** — for v1 it just hides. Open: hide forever, resurface tomorrow, or resurface next week? Default first cut: hide for the current session only (in-memory). MMKV persistence comes with the dev-client work.
- [ ] **Greeting copy generation** — "Three things need you today." needs to come from the live count. 0 → empty state; 1 → "One thing needs you today."; many → "N things…". Worth a small helper to keep copy tones consistent.
- [ ] **Visual rendering of the wireframe in future sessions** — the in-session computer-use access prompt timed out last time. Consider a Claude Preview `launch.json` with `python3 -m http.server` against `docs/` so future sessions can screenshot the rendered design.
