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

**Phase 1, in progress.**

End of session 1 (2026-05-10). Repo live at https://github.com/baranbartu/held with CI green.

Done:
- Bootstrap files (`AGENTS.md`, `CLAUDE.md`, `PROJECT_PLAN.md`, `README.md`)
- `held-app/` scaffolded with Expo SDK 54, Expo Router, TypeScript strict, ESLint + Prettier
- Mobile-only (iOS + Android); web platform stripped consistently from `package.json` and `app.json`
- Bundle ID `com.bote.held`, Expo owner `baranbartu`, scheme `held`
- Fraunces (300/400/500 + italics) and Manrope (400/500/600) wired via `@expo-google-fonts/*` in the root layout, splash held until fonts load
- Theme tokens (palette + font families) in `held-app/theme/`
- `eas.json` with development / preview / production profiles, no submit config
- Home screen (`app/index.tsx`) implemented against the wireframe with the brief's hardcoded sample tasks (Today × 3, This week × 2, Later — 4 things footer); typecheck + lint pass
- `docs/wireframe.html` saved as visual source of truth
- `.github/workflows/ci.yml` runs typecheck + lint on push to `main`; CI green

Next session:
- User runs `npm start` in `held-app/` and tests the home screen on a device via Expo Go. We iterate on layout/typography/spacing where it diverges from the wireframe.
- Once the home screen feels right, build the empty state with the breathing-dot animation (separate route or conditional render — tbd).
- Then the add flow ("what's on your mind?" single text input).
- Then the item detail view ("where this came from").
- MMKV storage and `expo-notifications` come after the UI is solid (require dev client; deferred to keep Expo Go iteration fast).

## Decisions log

Reverse-chronological. Each entry: date, decision, reasoning, alternatives considered.

- **2026-05-10** — **One git repo at the project root, not one per component.** Reasoning: docs (especially the wireframe) and both components belong to one product and should be versioned together. Alternative considered: separate repos for `held-app/` and `held-api/` — rejected as premature decoupling.
- **2026-05-10** — **`legacy-peer-deps=true` in `.npmrc`.** Reasoning: `expo-router` and `@expo/metro-runtime` declare `react-dom` as a peerOptional dep that npm 10+ pulls in anyway, then resolves to a version conflicting with expo's pinned `react`. Local `npm install` warns and overrides; `npm ci` is strict and fails. `.npmrc` makes both behave the same — the canonical Expo fix. Alternative considered: pinning `react-dom` explicitly to `react`'s version — rejected because it implies web support we don't have.
- **2026-05-10** — **Mobile-only, web platform stripped from day one.** Reasoning: the product is a mobile-first worry-offloader; web is out of scope and removing the deps now keeps the bundle clean and avoids drift between `package.json`, `app.json` platforms, and react-native-web/react-dom. Alternative considered: keep web for quick prototyping in a browser — rejected because it imports a different rendering model that hides RN font/spacing realities.
- **2026-05-10** — **`@expo-google-fonts/*` for Fraunces and Manrope (runtime fetch + cache), not bundled font files.** Reasoning: simpler than shipping `.ttf` assets, avoids configuring the `expo-font` plugin's static paths, splash screen is held until both font families load so there's no FOUT. Alternative considered: bundling the .ttf files via expo-font — defer until we have stable font weights and want offline-first font availability.
- **2026-05-10** — **`expo-go`-friendly stack for now: no `react-native-mmkv`, no `expo-notifications` until home screen feels right.** Reasoning: both require a dev client (no Expo Go support for native modules), and we want fast iteration on UI first. They're in v1 scope and will land in a follow-up session.
- **2026-05-10** — **Visual confirmation of the wireframe via Safari/computer-use was attempted but timed out (no user response to the access prompt). Built the home screen from the HTML/CSS source instead.** Reasoning: the source is unambiguous and all design tokens (colors, fonts, spacing) are explicit. We'll iterate on layout once the user runs the app on a device. Note for next session: if visual confirmation is wanted, set up a Claude Preview launch.json that serves `docs/` via `python3 -m http.server`.
- **2026-05-10** — **Credentials file for this project: `~/.baran-creds`.** Reasoning: matches the Expo account (`baranbartu`) the app will be owned by, and the GH account that will host the repo. Alternative considered: default `~/.gizem-creds`, rejected because it would mean a different GH account than the Expo owner.
- **2026-05-10** — **Multi-component layout (`held-app/` + future `held-api/`) chosen up front.** Reasoning: phase 2 will need a backend, and the global standard prefers naming components correctly from day one over restructuring later. `held-api/` is deferred (not scaffolded) until phase 2 begins.
- **2026-05-10** — **v1 is fully mocked: no backend, no auth, no real connectors, no AI extraction.** Reasoning: the product's worth is in the feeling of the UI — the calm, the plain language, the empty state. We need to nail that before any data pipeline. Real Gmail / AI / sync are phase 2.
- **2026-05-10** — **Zustand for cross-screen state, `useState` for everything else. No Redux, no React Query in v1.** Reasoning: per global mobile standard. The app has few cross-screen needs in v1 anyway.

## Open questions

- Header date — currently hardcoded to `saturday · may 9` to match the wireframe exactly. Switch to live date once the layout is stable; format with `date-fns` (e.g. `eeee · MMMM d` lowercased). Decision: live date in next session.
- Swipe-hint affordance — the wireframe shows a subtle gradient + "swipe →" on the third task as a teaching cue. Skipped in this build because the actual swipe gesture isn't wired up yet. Open question: when swipe-to-snooze lands, do we want a permanent visual hint, a once-on-first-run hint, or no hint at all (pure discovery)?
- Daily notification default time — brief says "user-set time, default 8am". Open: configurable in v1 settings screen, or hardcoded to 8am for v1 with a settings screen in v2? Defer until home screen feels right.
- Snooze semantics — for v1, swipe-to-snooze just hides the item. Open: hide forever, resurface tomorrow, or resurface next week? Default for first cut: hide for the current session only (in-memory). MMKV persistence comes with the dev-client work.
- Greeting copy generation — the wireframe shows "Three things need you today." This needs to come from the actual today count once data is dynamic. Wording for 0 items is the empty state ("You're clear."); wording for 1 ("One thing needs you today.") and many is mechanical, but worth a single helper to keep copy tones consistent.
- Visual rendering of the wireframe in future sessions — the in-session computer-use access prompt timed out. Consider setting up a Claude Preview `launch.json` with `python3 -m http.server` against `docs/` so future sessions can quickly screenshot the rendered design.
