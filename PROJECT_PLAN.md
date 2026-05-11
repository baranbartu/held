# Project Plan — Held

## Vision

One calm place that holds everything on a person's mind — emails, messages, letters — so they can stop remembering it all themselves. Not a task manager. A worry-offloader. The hero moment is the empty state: *"You're clear. Nothing needs you today."*

## Phases

### Phase 1 — Mobile-only v1 (status: in progress)

**Goal:** a mobile app that *feels* like the product, even though everything is mocked. Local-only, no backend, hardcoded sample data that looks real.

**In scope:**
- [x] Home screen with Today / This week / Later sections (Later collapsed by default)
- [x] Empty state with "You're clear." copy + breathing-dot animation
- [x] Tap to mark done (strike-through animation, fade-out, reflow)
- [x] Swipe to snooze (just hides the item for v1; no scheduling yet)
- [x] Wire empty state to real data condition (`todayTasks.length === 0`)
- [x] Add flow: single text input "what's on your mind?" with deadline picker (today / tomorrow / custom date)
- [x] Switch hardcoded header date to live date with `date-fns`
- [x] Undo for accidental taps — 5-second soft-delete window with an undo bar above the add bar
- [x] Normalize task shape — every task has the same fields; "when" text is derived from `deadline` or `addedAt`
- [ ] Item detail view ("where this came from")
- [ ] Daily local notification at user-set time, default 8am
- [ ] MMKV local storage (requires moving off Expo Go to a dev client)

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
- [x] Empty state in the same file with breathing-dot animation on a 4s loop via Reanimated
- [x] Tap-to-done: strike-through draws across title (~260ms), title shifts to done-green, row fades out, others reflow via Reanimated `LinearTransition` + `FadeOut`
- [x] Swipe-to-snooze: pan right past ~100px slides the row off and snoozes; under that it springs back
- [x] `MODE` constant retired — empty state derives from `todayTasks.length === 0`
- [x] Greeting / subgreeting copy generates from live counts ("Three things need you today." → "One thing…" → empty state)
- [x] `GestureHandlerRootView` wrapped at app root
- [x] Zustand store (`store/tasks.ts`) holding unified task list with category field
- [x] Add screen (`app/add.tsx`) — iOS-style modal, paper background, Fraunces text input
- [x] Add bar on home is now `Pressable`, navigates to `/add`
- [x] Normalized `Task` shape — title / deadline / addedAt / source / urgent / category / dismissed
- [x] `helpers/dates.ts` with `formatWhen`, `formatTodayHeader`, `formatTodayName` (date-fns)
- [x] Deadline picker on add screen — today/tomorrow pills + `@react-native-community/datetimepicker` for custom dates; iOS inline spinner, Android system dialog
- [x] Undo with 5s window — soft-delete in store, undo bar above add bar, supersession of older pending dismisses
- [x] Live header date and `Go enjoy your {day}.` empty-state hint

**Next up (this session or the next):**
- [ ] User reviews data consistency + add deadline picker + undo on device, flags anything off
- [ ] Item detail view ("where this came from") — needs a non-conflicting gesture since tap is mark-done and swipe-right is snooze. Candidates: long-press, swipe-left, or a small affordance on the row.

**After UI feels right:**
- [ ] Move off Expo Go to a dev client; add `react-native-mmkv` for local persistence
- [ ] Add `expo-notifications` for the daily 8am notification

## Decisions log

Reverse-chronological. Each entry: date, decision, reasoning, alternatives considered. (Decisions are historical and don't take checkboxes.)

- **2026-05-11** — **Normalized task shape: `title`, `deadline?: Date`, `addedAt: Date`, `source`, `urgent?`, `category`, `dismissed?`.** Reasoning: original mocked tasks mixed AI-generated commentary ("HR is waiting") with actual dates ("due in 3 weeks") and message-age ("she asked yesterday") in the same `when` string. Inconsistent. The displayed "when" is now derived: `formatWhen(deadline, addedAt)` returns a deadline phrase if there's a deadline, otherwise an addedAt phrase. This also makes the model future-proof for the real AI extraction pipeline (which will set the same fields).
- **2026-05-11** — **`source` stays a single free-form string for now ("gmail · 2 days ago", "letter · gemeente", "you").** Reasoning: the source line carries channel-specific context (sender, age, channel) and splitting it into `{ source, sourceMeta }` adds a structure we don't yet need. Manually-added tasks just get `source: "you"`. Revisit if/when sources start needing programmatic logic (filtering by source, etc).
- **2026-05-11** — **Undo via soft-delete with a 5s window.** Reasoning: the user reported accidentally tapping rows. Going from "dismissed → gone" to "dismissed → 5s undo window → gone" is the standard Gmail/Material pattern and respects the brief's "no confirmation dialogs" principle (no upfront 'are you sure?'). Implementation: `dismiss()` marks the task `dismissed: true` (filtered from view) and queues actual removal in 5s via a module-level `setTimeout`. `undo()` clears the flag. A second dismissal mid-window finalizes the previous one and starts a new 5s window. Alternative considered: keeping the dismissed task in a separate `dismissed` array — rejected because soft-delete via a flag preserves the task's original position in the array, so undo restores it where it was (rather than at the top).
- **2026-05-11** — **Undo bar stacks ABOVE the add bar, both visible.** Reasoning: replacing the add bar with the undo bar would block adding for 5s, which is annoying. Stacking keeps both functions reachable. Reanimated `FadeIn`/`FadeOut` handles the entrance/exit; the add bar position is fixed by the parent flex container.
- **2026-05-11** — **Deadline picker = three pills (today / tomorrow / pick a date) with `@react-native-community/datetimepicker` for custom.** Reasoning: matches the user's ask ("easy picks like today/tomorrow or custom→date picker"). Pills cover the 80% case in one tap. Custom date opens the platform-native picker (iOS spinner inline + "done" link; Android system dialog). The category is derived from the chosen deadline (`categorize()` in the store) — today/tomorrow → Today, +2..7 days → This week, +8 onward → Later. Alternative considered: letting the user explicitly pick the section — rejected because the deadline is the more meaningful input and the section is just a derived view.
- **2026-05-11** — **Header date and empty-state hint go live via date-fns.** Reasoning: the hardcoded `saturday · may 9` was a holdover from the wireframe and inconsistent with "today" deadlines in the data. `format(now, 'EEEE · MMMM d').toLowerCase()` for the header; `Go enjoy your {EEEE}.` for the empty-state hint. Closes the open question about live dates.
- **2026-05-11** — **Add screen is a Stack modal route (`app/add.tsx`), not a bottom sheet.** Reasoning: iOS-native modal presentation (slide up from below, swipe-down to dismiss) gives us 80% of the bottom-sheet UX for free, on the same paper background. Bottom sheet libraries (`@gorhom/bottom-sheet`) add a dep and gesture-handler interplay to maintain, and the "card stack" feel is exactly what a focused-input moment wants. Open: revisit if the modal feels too heavy for a thought-capture moment.
- **2026-05-11** — **Unified `tasks` array with a `category` field, in a Zustand store.** Reasoning: separate `todayTasks` / `weekTasks` arrays were duplicating state shape and made cross-section moves (snooze week→later, etc.) awkward to model later. Unified array filtered at the call site is cleaner; the store is one source of truth and Zustand was already the global standard for cross-screen state. Alternative considered: React Context — rejected because Zustand has no boilerplate, supports selector subscriptions, and matches the global standard.
- **2026-05-11** — **Manually-added tasks get `source: "you"` and `when: "just added"`.** Reasoning: per-source labeling is part of the trust principle ("source is always visible"). "you" is the honest plain-language label for self-typed items, fitting the lowercase voice ("gmail", "whatsapp"). "just added" reads naturally and avoids the redundancy of saying "today" when the task is already in the Today section.
- **2026-05-11** — **Single `TextInput` with `multiline`, `blurOnSubmit`, return key submits.** Reasoning: tasks can be longer than one visual line ("Reply to mom about Sunday lunch about whether the casserole was too dry"), but the gesture should still be type-and-return. `multiline=true` + `blurOnSubmit=true` lets RN wrap visually while keeping return as the submit key. No explicit save button — would add chrome the brief doesn't want.
- **2026-05-11** — **Gestures before add flow.** Reasoning: tap-to-done + swipe-to-snooze live on the home screen and complete the "two gestures, that's the whole interaction model" principle. They also unlock the empty state organically (mark everything done → "You're clear." appears) without needing a new screen. The brief's sequence said add flow next, but redirected after a brief recommendation.
- **2026-05-11** — **Tap-to-done = strike-through animation, not just a fade.** Reasoning: the brief explicitly notes "the cross-out moment matters." Strike line draws across the title (260ms, `Easing.out`) while title color interpolates to done-green; only after that does the row fade and exit. The done color (`#6B8E5A`) is in the wireframe palette and per the wireframe's "Done (used sparingly)" note, this is its only home for now. Alternative considered: instant `textDecorationLine: 'line-through'` — rejected because RN can't animate the text decoration property and the drawn line is what makes the moment feel earned.
- **2026-05-11** — **Swipe right (not left) for snooze.** Reasoning: matches the wireframe's `swipe →` hint and the CSS gradient `transparent → rgba(184,92,60,0.06)` on the right side of the third task. Threshold = 100px translationX; under that, springs back.
- **2026-05-11** — **Reanimated layout animations (`FadeOut` + `LinearTransition`) for the reflow.** Reasoning: when a row is dismissed, the surrounding items should slide up smoothly, not snap. Reanimated 4 supports this declaratively per-element with `exiting` and `layout` props. Alternative considered: RN's `LayoutAnimation` — rejected because it's flaky on Android and conflicts with concurrent gesture animations.
- **2026-05-11** — **`Gesture.Exclusive(pan, tap)` with `pan.activeOffsetX(20)` and `pan.failOffsetY([-12, 12])`.** Reasoning: pan needs an explicit horizontal threshold so vertical scrolling in the parent `ScrollView` (imported from `react-native-gesture-handler`, per its docs for nested gestures) doesn't fight with snooze. Exclusive prioritizes pan over tap when both could activate, so a horizontal drag never accidentally marks something done.
- **2026-05-11** — **`MODE` constant at the top of `app/index.tsx` to toggle between task list and empty state during mocked v1.** *(Retired same day — replaced with `todayTasks.length === 0` once tap-to-done landed.)*
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

- [x] ~~**Header date**~~ — resolved 2026-05-11. Header now uses `format(new Date(), 'EEEE · MMMM d').toLowerCase()`. Empty-state hint is `Go enjoy your {EEEE}.`.
- [ ] **Swipe-hint affordance** — the wireframe shows a subtle gradient + "swipe →" on the third task as a teaching cue. Skipped in the first build because the swipe gesture isn't wired yet. Open: when swipe-to-snooze lands, permanent visual hint vs. once-on-first-run vs. pure discovery?
- [ ] **Daily notification default time** — brief says "user-set time, default 8am". Open: configurable in v1 settings, or hardcoded to 8am for v1 with settings in v2?
- [ ] **Snooze semantics** — for v1 it just hides. Open: hide forever, resurface tomorrow, or resurface next week? Default first cut: hide for the current session only (in-memory). MMKV persistence comes with the dev-client work.
- [ ] **Undo for swipe-to-snooze too?** — undo currently fires for both tap and swipe paths (both call `dismiss()`), so it already works. But the undo bar says "marked done" regardless. If swipe should read "snoozed · undo", we'd need to track the action type. Open: small copy refinement or leave generic.
- [x] ~~**Greeting copy generation**~~ — resolved 2026-05-11. `numberWord(n)` helper covers 0–9 (digits beyond); singular/plural noun + verb handled inline. Revisit if we ever need >9 items in a section (unlikely in v1).
- [ ] **Visual rendering of the wireframe in future sessions** — the in-session computer-use access prompt timed out last time. Consider a Claude Preview `launch.json` with `python3 -m http.server` against `docs/` so future sessions can screenshot the rendered design.
