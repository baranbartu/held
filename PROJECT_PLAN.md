# Project Plan — Held

## Vision

One calm place that holds everything on a person's mind — emails, messages, letters — so they can stop remembering it all themselves. Not a task manager. A worry-offloader. The hero moment is the empty state: *"You're clear. Nothing needs you today."*

## Phases

### Phase 1 — Mobile-only v1 (status: in progress)

**Goal:** a mobile app that *feels* like the product, even though everything is mocked. Local-only, no backend, hardcoded sample data that looks real.

**In scope:**
- [x] Home screen with Today / This week / Later sections (Later collapsed by default)
- [x] Empty state with "You're clear." copy + breathing-dot animation
- [x] Tap to open detail; swipe-right to mark done (slide-off + undo bar); swipe-left to postpone (today / tomorrow / pick-a-date picker, updates deadline + re-categorizes). Conventional gesture set with reveal-on-swipe affordances ("done" / "postpone" peek out behind row).
- [x] Wire empty state to real data condition (`todayTasks.length === 0`)
- [x] Add flow: single text input "what's on your mind?" with deadline picker (today / tomorrow / custom date)
- [x] Switch hardcoded header date to live date with `date-fns`
- [x] Undo for accidental taps — 5-second soft-delete window with an undo bar above the add bar
- [x] Normalize task shape — every task has the same fields; "when" text is derived from `deadline` or `addedAt`
- [x] Item detail view ("where this came from") — opened via swipe-left; shows source, title, deadline, raw context, and mark-done + postpone actions
- [x] Daily local notification at 8am — `expo-notifications` schedules a daily reminder ("here's what needs you today"), quiet by default (no sound, no badge). User-set time UI deferred; default-only for now.
- [x] MMKV local storage — `react-native-mmkv` v4 + `react-native-nitro-modules` peer; Zustand `persist` middleware with a JSON reviver for `deadline` / `addedAt`. `partialize` keeps only `tasks` (pendingDismissId stays in-memory by design). Needs a dev client to run (Expo Go doesn't bake in arbitrary native modules).

**Out of scope (deferred):**
- Backend / API
- Auth / accounts
- Real connectors (Gmail, WhatsApp, SMS, Slack, Jira)
- AI extraction
- Onboarding flow
- Letter scanning / OCR
- Web push, server-sent notifications
- Subscription / payments

### Phase 2 — Backend + auth + manual capture + AI extraction (status: not started)

**Goal:** real data, cross-device sync, and AI-interpreted manual capture in three flavors — text, voice, photo. No 3rd-party connectors yet; the product works on day one for any user without setup.

**In scope:**
- [ ] `held-api/` scaffolded — Cloudflare Workers + Hono per global standards
- [ ] D1 schema + migrations for users and tasks
- [ ] R2 buckets for audio + photo uploads
- [ ] Better Auth via `better-auth-cloudflare` — Sign in with Apple + Sign in with Google (no email/password, no magic link)
- [ ] Text capture wired to backend (replaces local-only add)
- [ ] Voice capture — `expo-av` to record, upload to R2 → Whisper or Claude audio API to transcribe → Claude to extract task fields
- [ ] Photo / image capture — `expo-image-picker` + `expo-camera`, upload to R2 → Claude vision to extract task fields. Handles *any* photo: receipt, screenshot of an email, screenshot of a WhatsApp message, paper letter — same path.
- [ ] AI extraction prompt(s) tuned for Held's voice (plain language, precision > recall)
- [ ] Server-authoritative task state, cross-device sync (mobile pulls on cold launch + foreground + pull-to-refresh)
- [ ] Daily notification body updates live from server snapshot on each app foreground

**Out of scope (later phases):**
- Any 3rd-party connector (Gmail, Slack, WhatsApp, SMS, Jira, letter OCR pipeline — phase 3)
- Server-driven push notifications (phase 3+ for paid tier)
- Monetization / paywall (phase 4)

### Phase 3 — 3rd-party connectors (status: not started)

**Goal:** automated ingestion from common sources, building on the same AI extraction the manual capture path already proved out. Gmail first; expand based on user pull.

**In scope:**
- [ ] Gmail OAuth with refresh tokens encrypted in D1
- [ ] Gmail Pub/Sub watch + webhook endpoint into the existing extraction pipeline
- [ ] Single batched daily housekeeping cron (token refresh, Pub/Sub watch renewal across all users) — *not* a per-user cron
- [ ] Slack Event API webhook (next likely)
- [ ] WhatsApp via Meta Cloud API, SMS via Twilio (later in phase 3 or deferred)

**Out of scope:**
- Per-user cron (we use webhooks; cron only for housekeeping)
- A dedicated letter OCR pipeline — phase 2's photo capture path covers letters already

### Phase 4 — Monetization (status: not started)

**Goal:** premium subscription, sustainable business model. Free tier remains usable indefinitely; premium adds, doesn't gate the core promise.

**In scope:**
- [ ] In-app purchase via App Store / Play Store, abstracted through RevenueCat
- [ ] Premium feature line — TBD based on first user feedback (candidates: more connectors, longer history, smarter scheduling, server-driven push)

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
- [x] `deadline` is required on `Task` (matches eventual backend reality); mom got a deadline
- [x] WHEN slot strictly shows deadline; addedAt moved into source line via `composeSource()`
- [x] Tasks sorted within each section: urgent first, then deadline ascending
- [x] Swipe-right → `/postpone` modal (tomorrow / next week / pick-a-date pills, instant-commit)
- [x] Swipe-left → `/detail` modal (source, title, deadline, raw "where this came from" context, mark-done + postpone actions at bottom)
- [x] `context` field on Task with mocked email/SMS/WhatsApp/Slack/letter copy for the five sample tasks
- [x] `postpone(id, deadline)` store action that updates deadline + re-categorizes

**Next up — closes phase 1:**
- [ ] Build the dev client (`npx expo run:ios` locally, or `eas build --profile development --platform ios`) and verify MMKV persistence on device
- [ ] **(deferred to end of phase 1)** i18n pass — set up `i18next` + English catalog + translations for Turkish, Dutch, German, Spanish, Portuguese, Italian. Wait until English copy is locked.

**Then phase 2 kicks off:**
- [ ] Scaffold `held-api/` (Cloudflare Workers + Hono + D1 + R2)
- [ ] Sign in with Apple + Google via Better Auth
- [ ] Wire existing text-add flow to backend
- [ ] Voice capture flow (`expo-av` → upload → Whisper/Claude audio → extract)
- [ ] Photo capture flow (`expo-image-picker`/`expo-camera` → upload → Claude vision → extract)

## Decisions log

Reverse-chronological. Each entry: date, decision, reasoning, alternatives considered. (Decisions are historical and don't take checkboxes.)

- **2026-05-18** — **MMKV via Zustand `persist` middleware + JSON reviver for Date fields. `partialize` excludes `pendingDismissId`.** Reasoning: per global standard ("`react-native-mmkv` for app data. Avoid AsyncStorage"). MMKV v4 is Nitro-modules-based and needs `react-native-nitro-modules` peer (legacy-peer-deps mode skipped installing it; added explicitly). Date fields serialize to ISO strings via `Date#toJSON`; the persist `reviver` runs per key/value pair on parse and restores `deadline` / `addedAt` back to `Date` — explicit per-field handling beats trying to JSON.parse with class metadata. `pendingDismissId` is transient by design — restarting the app finalizes any in-flight undo, matching the contract that undo is a 5s in-memory window. Alternative considered: `expo-sqlite` (works in Expo Go, no dev client needed) — rejected because the global standard names MMKV; sqlite's query API is overkill for a single task list.
- **2026-05-16** — **Phases reordered: capture-first, connectors-later. Monetization moves to phase 4.** Reasoning: 3rd-party connectors (Gmail OAuth, Slack Event API, Meta Business verification for WhatsApp, Twilio for SMS) carry significant integration and platform-approval complexity — Meta verification alone is multi-week. Manual capture (text / voice / photo) ships value on day one for any user without setup, validates the AI extraction quality independently, and the photo path also covers letters / receipts / screenshots of other apps, eliminating the need for a separate OCR pipeline. Connectors become "automation on top" once capture is proven. Phase 2 = backend + auth + manual capture + AI. Phase 3 = connectors. Phase 4 = monetization. Alternative considered: ship a half-built capture in mobile-only v1 (capture but no AI) — rejected because the FEEL we're testing IS the AI's interpretation of the input; capture without AI is misleading.
- **2026-05-16** — **Webhooks-first for connector ingestion; no per-user cron.** Reasoning: per-user cron would mean N × frequency executions per cycle (most of them wasted because no new data) and scales poorly. Webhooks fire only when something actually happens, so cost scales with message volume not user count. Single batched housekeeping cron for OAuth-token refresh + Gmail Pub/Sub watch renewal across all users. Daily 8am notification stays device-local (already shipped), no server cron involved.
- **2026-05-16** — **Gestures flipped to convention: tap = open detail, swipe-right = mark done, swipe-left = postpone. Reveal-on-swipe affordances added.** Reasoning: novice user feedback (partner) flagged the brief's tap=done as unintuitive. Most apps treat tap as "show me more" — and surprise mark-done erodes trust, even with undo. Conventional pattern matches Mail / Things / Reminders muscle memory. Lost: the "tap to finish" satisfaction the brief was betting on; the strike-through animation that made tap-done feel earned. Gained: zero-surprise discoverability for first-time users, plus self-documenting gestures via the hint backdrop ("done" / "postpone" peek out from behind the row as it drags). Alternative considered: keep tap=done and add a first-launch coaching overlay — rejected because coaching is a workaround for an unintuitive default. If you have to teach a gesture, the gesture is wrong.
- **2026-05-16** — **Effort estimate (`effort?: number` on Task) is shown in detail view only; not on the row.** Reasoning: the home row is already carrying title + when + source; adding effort risks chrome on a screen the wireframe deliberately kept sparse. Detail view is the right home for "more info you might need". Revisit only if users find themselves opening detail just to answer "is this a quick one?". Phrased in Held's voice: "takes about 5 minutes" / "takes about an hour", hedged with "about" because it's an AI estimate. Also documented the category logic alongside this change: `categorize()` derives category from deadline for manual adds, but AI-extracted tasks can set `category` independently to elevate something for importance (which is why "Pay garbage tax — in 3 weeks" lives in Today).
- **2026-05-15** — **Notification body shows dynamic count + bullet list of today's tasks.** Reasoning: a static "here's what needs you today" is less useful than the actual list. Notifications can render multi-line bodies with `\n`; unicode bullets (•) give a styled-list look without native styling. Content is snapshot at schedule time (cold launch), not at fire-time — backgrounded recompute isn't reliable on mobile. Acceptable for v1 since the count is correct at last app open; once MMKV lands, we can reschedule on every state change to stay current.
- **2026-05-15** — **Daily reminder is local-only, scheduled via `expo-notifications` at 8am, quiet by default (no sound, no badge).** Reasoning: the brief says "local notification only" — no server, no push tokens, no APNs/FCM keys, no backend dependency. `expo-notifications` schedules a recurring daily trigger that the device fires; works in Expo Go SDK 54 (only remote push was dropped from Expo Go in SDK 53+). Quiet defaults match the brief's "no urgency theater" principle. Body is static ("here's what needs you today") for v1 — dynamic count requires persistence (MMKV) so we can recompute on schedule rather than at fire-time. Alternative considered: a custom Android channel with HIGH importance for more visibility — rejected because Held's whole proposition is calm.
- **2026-05-15** — **No user-set-time UI in v1; default 8am only.** Reasoning: the brief says "user-set time, default 8am". Default is the most important part; the picker UI is a layer that adds chrome (settings affordance), and the brief is anti-chrome ("quiet by default", no projects/tags/filters). Best home for the picker, when we add it: a bottom sheet opened from a tap on the date header — least intrusive affordance and the date is already semantically a "time" anchor.
- **2026-05-11** — **Three gestures, not two: tap = done, swipe-right = postpone, swipe-left = detail.** Reasoning: the brief's "two gestures, that's the whole interaction model" became three because the original "swipe to snooze = just hide" was barely functional and we needed somewhere for the detail view to live. Tap-to-done is preserved (brief's design intent: the most common action should be the fastest gesture). Swipe-right is upgraded from hide to "postpone with picker" — same today/tomorrow/pick-a-date pills as add, so the mental model is symmetric. Swipe-left is the new detail gesture — horizontal symmetry with right reads as a paired set, and we avoid long-press (which feels heavy for a calm app) or row affordances (visual noise). Alternative considered: tap = open detail with done on a swipe — rejected because the brief explicitly bets that completion is the most common action and should be a single tap; undo (5s) catches accidents.
- **2026-05-11** — **Detail view = modal route with title, source, deadline, raw context, and mark-done + postpone actions at the bottom.** Reasoning: the principle says "source is always visible — trust mechanism." The detail view is where that trust pays off: the raw email subject + snippet, the SMS body, the WhatsApp message text. The two actions at the bottom (mark done filled, postpone outlined) let the user resolve the item without swiping again. Postpone from detail uses `router.replace()` to swap detail for postpone — no flash of home in between.
- **2026-05-11** — **Postpone modal uses instant-commit on pill tap (no submit button).** Reasoning: postpone is a quick action; users should be able to swipe → tap → done. The add modal needs a submit because the user is composing text; the postpone modal has no text input and pill = decision. Custom date picker still requires a "postpone" tap on iOS (since the wheel picker fires onChange on every spin), but the two preset pills commit immediately. Trade-off: no way to back out after tapping a pill except re-postponing — acceptable given the action is reversible by re-swiping.
- **2026-05-11** — **`deadline` is now required on `Task` (not optional).** Reasoning: the phase 2 backend's whole job is AI extraction — every emitted task will carry an inferred deadline. Modeling deadline as optional in v1 mocks was creating inconsistent display logic ("tomorrow" vs. "added yesterday" in the same slot) that wouldn't exist in production. Required matches the real model. Mom's task (which had no deadline) got `deadline: today` since she's waiting on a reply — reasonable AI inference.
- **2026-05-11** — **WHEN slot strictly shows deadline; addedAt moves into source line.** Reasoning: the slot was carrying two different concepts depending on the task (deadline-flavor vs. age-flavor), which read inconsistent across rows. Now WHEN is always "when is it due" and the source line carries channel context. `composeSource()` appends recency only when the source has no meta of its own — `whatsapp` → `whatsapp · yesterday`, but `letter · gemeente` stays as-is. Sources with their own meta (sender / channel) win over recency since they're more informative.
- **2026-05-11** — **Sort tasks within sections: urgent first, then deadline ascending.** Reasoning: the wireframe order (urgent interview → garbage tax → mom) wasn't arbitrary — it's what the AI would order by importance. Manual order (newest-added first) was fine for a fully-empty list but breaks as soon as users have a few items and expect "what's most pressing" at the top. Urgent override matters because some tasks need attention even when their deadline is distant (the interview case).
- **2026-05-11** — **i18n deferred to end of phase 1.** Reasoning: the calm voice IS the product (e.g., "Go enjoy your Monday", "we'll let you know when something needs you"). These don't key-swap cleanly into Turkish/Dutch/German/Spanish/Portuguese/Italian (all 7 target languages, all Latin-script, no RTL surprises) — they need native speakers recreating the *feel*, not literal translation. Doing i18n now means re-translating every iteration of unstable copy. Better as one focused translation pass once English copy stabilizes. Light scaffold (i18next + English-only catalog) was offered as a middle ground but declined for now.
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
- **2026-05-10** — **v1 is fully mocked: no backend, no auth, no real connectors, no AI extraction.** Reasoning: the product's worth is in the feeling of the UI — the calm, the plain language, the empty state. We need to nail that before any data pipeline. Real AI + sync land in phase 2; real connectors land in phase 3 (re-prioritized — see 2026-05-16 entry).
- **2026-05-10** — **Zustand for cross-screen state, `useState` for everything else. No Redux, no React Query in v1.** Reasoning: per global mobile standard. The app has few cross-screen needs in v1 anyway.

## Open questions

- [x] ~~**Header date**~~ — resolved 2026-05-11. Header now uses `format(new Date(), 'EEEE · MMMM d').toLowerCase()`. Empty-state hint is `Go enjoy your {EEEE}.`.
- [ ] **Swipe-hint affordance** — the wireframe shows a subtle gradient + "swipe →" on the third task as a teaching cue. Skipped in the first build because the swipe gesture isn't wired yet. Open: when swipe-to-snooze lands, permanent visual hint vs. once-on-first-run vs. pure discovery?
- [x] ~~**Daily notification default time**~~ — resolved 2026-05-15. Default 8am is scheduled via `expo-notifications`; the user-set-time UI is deferred. When we add the UI, the natural home is a small bottom sheet opened from a tap on the date header (least intrusive affordance).
- [ ] **Dynamic notification body** — v1 ships with a static title ("here's what needs you today"). Once MMKV + persistence land, recompute the live count at schedule time and reschedule when the count changes (foreground → reschedule with current count). Background tasks aren't reliable enough on mobile to recompute at fire-time.
- [ ] **Custom Android notification icon** — currently the OS uses the app icon rendered monochrome. Acceptable for v1; add a dedicated small-icon asset (`./assets/images/notification-icon.png`) when we do the design pass before EAS preview builds.
- [ ] **Snooze semantics** — for v1 it just hides. Open: hide forever, resurface tomorrow, or resurface next week? Default first cut: hide for the current session only (in-memory). MMKV persistence comes with the dev-client work.
- [x] ~~**Undo for swipe-to-snooze too?**~~ — moot. Swipe-right is now postpone (non-destructive: task moves to a new deadline, stays visible); the user can re-postpone or open detail to verify. Undo applies only to tap-to-done.
- [x] ~~**Greeting copy generation**~~ — resolved 2026-05-11. `numberWord(n)` helper covers 0–9 (digits beyond); singular/plural noun + verb handled inline. Revisit if we ever need >9 items in a section (unlikely in v1).
- [ ] **Visual rendering of the wireframe in future sessions** — the in-session computer-use access prompt timed out last time. Consider a Claude Preview `launch.json` with `python3 -m http.server` against `docs/` so future sessions can screenshot the rendered design.
