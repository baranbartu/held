# Held

> Held holds what's on your mind, so you don't have to.

A mobile app that gives people one calm place to see everything that needs them — emails, messages, letters, all of it — so they can stop holding it in their head. Not a task manager. A worry-offloader.

For project context, principles, and architecture, see [`CLAUDE.md`](./CLAUDE.md).
For the living plan, status, and decisions log, see [`PROJECT_PLAN.md`](./PROJECT_PLAN.md).
For the visual reference, see [`docs/wireframe.html`](./docs/wireframe.html).

## Layout

```
held/
├── docs/         # design references (wireframe.html)
├── held-app/     # React Native + Expo mobile app (phase 1)
└── held-api/     # Cloudflare Workers + Hono backend (phase 2, not yet scaffolded)
```

## Mobile app — `held-app/`

### Prerequisites

- Node 20.19.5 (via nvm)
- Expo Go on a phone, or an iOS simulator / Android emulator
- An `EXPO_TOKEN` in your environment for EAS builds (not needed for `expo start`)

### Run locally

```sh
cd held-app
npm install
npm start          # opens Expo dev tools; scan QR with Expo Go
npm run ios        # opens iOS simulator
npm run android    # opens Android emulator
```

### Verify

```sh
npm run typecheck  # tsc --noEmit
npm run lint       # expo lint
npm run format     # prettier --write .
```

### EAS builds

```sh
eas build --profile development   # dev client
eas build --profile preview       # internal share (APK on Android)
eas build --profile production    # release-grade bundle (not submitted to stores)
```

Builds are for testing only — store submission is out of scope for v1.

## Phase 1 status

In progress. Everything is mocked locally: no backend, no auth, no real connectors, no AI extraction. The goal of phase 1 is to nail the *feeling* of the product — the calm, the plain language, the empty state — before wiring real data.

See [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) for full status and decisions log.
