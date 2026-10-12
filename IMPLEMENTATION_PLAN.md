# SMILE Wrapper Application — Implementation Plan

## Problem Statement

Four standalone browser-based screening tools (SMILE-FA, Speech Signal Lab, PLR Screener, Pronator Drift) need to be unified into a single Vue 3 wrapper with a guided-dashboard onboarding flow, shared participant intake, and a combined summary screen — while preserving each module's core analysis logic as isolated sub-modules with clear boundaries.

## Requirements

- **Single deployment** on Vue 3 + Vite + TypeScript; replaces standalone apps as primary delivery
- **Guided dashboard**: patient progresses through Face → Speech → Pupil → Arm in sequence from a hub screen; can pause/resume; modules individually accessible
- **Shared intake once**: name, gender, YOB, PDPA consent, symptom onset collected in wrapper; module-specific fields (confounders, safety confirmation) remain inside each module
- **Pronator-drift**: UI ported to Vue; analysis engine (`src/analysis/`, `src/cv/`, `src/config/`) kept as-is
- **Other three modules**: Vanilla JS logic preserved and wrapped as isolated Vue components
- **Combined summary**: patient-facing FAST-style traffic-light panel + clinician report card behind a toggle
- **PLR on same device**: included in flow with capability detection and graceful degradation on non-Android/no-torch devices

---

## Background

| Step | Module | Current stack | Analysis engine | Camera/hardware |
|---|---|---|---|---|
| 1 | smile-fa | Vanilla JS, no build, ES modules | MediaPipe Face Landmarker, face-api.js | Front camera |
| 2 | speechsignal | Vanilla JS, no build, ES modules | Custom DSP, Web Audio API, Web Workers | Microphone |
| 3 | pupil-plr-screener | Vanilla JS + optional Vite | MediaPipe Face Landmarker (iris) | Rear camera + LED torch |
| 4 | pronator-drift | React 19 + TypeScript + Vite | MediaPipe Pose + Hand, Web Workers | Front camera |

All four are fully client-side, no backend. All use in-memory state. All emit a result object on completion.

**Integration strategy by module:**

- `smile-fa`: Vanilla JS modules imported into a Vue SFC via dynamic `import()`. Vue owns the DOM shell; the JS engine mounts into a `<div ref>` that Vue provides.
- `speechsignal`: Same pattern — Vanilla JS modules imported into a Vue SFC wrapper.
- `pupil-plr-screener`: Same pattern — `app/*.js` modules imported into a Vue SFC wrapper.
- `pronator-drift`: React UI screens **ported to Vue SFCs**. All TypeScript under `src/analysis/`, `src/cv/`, `src/config/`, `src/session/`, `src/audio/` copied verbatim and imported by the new Vue screens — zero rewrite of the analysis layer.

**Shared session store (Pinia):** Holds participant intake, module sequence, per-module result, and session-level state. Each module reads participant data from the store on mount and writes its result back on completion.

---

## Proposed Solution

```
smile-wrapper/
├── src/
│   ├── main.ts
│   ├── App.vue                    # Root: router-view + emergency banner
│   ├── router/index.ts            # Vue Router routes
│   ├── stores/
│   │   └── session.ts             # Pinia store: intake + sequence + results
│   ├── views/
│   │   ├── HomeView.vue
│   │   ├── IntakeView.vue
│   │   ├── HubView.vue            # Guided dashboard
│   │   ├── SummaryView.vue        # Traffic-light + clinician report
│   │   └── modules/
│   │       ├── SmileFaView.vue    # Step 1 — Facial Asymmetry
│   │       ├── SpeechView.vue     # Step 2 — Speech Signal
│   │       ├── PlrView.vue        # Step 3 — Pupil PLR
│   │       └── PronatorView.vue   # Step 4 — Pronator Drift
│   ├── components/
│   │   ├── ModuleCard.vue
│   │   ├── ProgressStepper.vue
│   │   ├── EmergencyBanner.vue
│   │   ├── TrafficLightPanel.vue
│   │   └── ClinicianReport.vue
│   ├── modules/
│   │   ├── smilefa/               # smile-fa JS source (copied + patched)
│   │   ├── speechsignal/          # speechsignal JS source (copied + patched)
│   │   ├── plr/                   # PLR JS source (copied + patched)
│   │   └── pronator/              # pronator analysis TS + CV (copied verbatim)
│   │       ├── analysis/
│   │       ├── cv/
│   │       ├── config/
│   │       ├── session/
│   │       ├── audio/
│   │       └── screens/           # NEW: Vue SFC ports of React screens
│   └── assets/
│       └── tokens.css
├── public/
│   └── models/
├── package.json
└── vite.config.ts
```

### Sequence Flow

```
HomeView
  → IntakeView (Name · Gender · YOB · Consent · Symptoms)
    → HubView (Guided Dashboard)
        → Step 1: SmileFaView  (Facial Asymmetry)  → result → HubView
        → Step 2: SpeechView   (Speech Signal)      → result → HubView
        → Step 3: PlrView      (Pupil PLR)          → result → HubView
        → Step 4: PronatorView (Pronator Drift)     → result → HubView
    → SummaryView (Traffic Light + Clinician Report)
```

### Data Flow

```
IntakeView → Pinia session store
                  ↓ participant data injected on mount
    SmileFaView → SpeechView → PlrView → PronatorView
                  ↓ result written on completion
             Pinia session store
                  ↓
           SummaryView (reads all 4 results)
```

---

## Task Breakdown

### Task 1: Scaffold the Vue wrapper project

- **Objective**: Create the Vue 3 + Vite + TypeScript project with all dependencies, folder structure, routing skeleton, and Pinia store.
- **Implementation**:
  - `npm create vue@latest smile-wrapper` with TypeScript, Vue Router, Pinia options selected
  - Install: `vite`, `vue-router`, `pinia`, `@mediapipe/tasks-vision`
  - Create folder structure as above
  - Define `router/index.ts` with placeholder routes: `/`, `/intake`, `/hub`, `/modules/smilefa`, `/modules/speech`, `/modules/plr`, `/modules/pronator`, `/summary`
  - Stub `stores/session.ts` Pinia store with typed `intake`, `sequence` (ordered: `smilefa → speech → plr → pronator`), `results` fields
  - Copy SMILE design tokens (`tokens.css`, `app.css` from speechsignal as the most complete baseline) into `assets/`
  - Add `EmergencyBanner.vue` (always-visible 995 banner) to `App.vue`
- **Tests**: Vitest smoke test — router instantiates, all routes resolve, store initialises with correct sequence order and empty results
- **Demo**: `npm run dev` starts the app; navigating to each route renders a placeholder; Pinia DevTools shows empty session store with `sequence: ['smilefa', 'speech', 'plr', 'pronator']`

---

### Task 2: Shared participant intake form (IntakeView)

- **Objective**: Build the wrapper-level intake form that collects global fields and writes them to the Pinia session store.
- **Implementation**:
  - `IntakeView.vue`: name (text), gender (select), year of birth (number), language (select — 10 options from speechsignal's `SCRIPTS`), PDPA consent checkbox, data-sharing consent checkbox, symptom onset selector (none / sudden_now / earlier / unknown)
  - Symptom onset `sudden_now` triggers `EmergencyBanner` into prominent mode
  - On submit: write to Pinia `session.intake`; push to `/hub`
  - `HomeView.vue`: SMILE branding, programme description, sequence preview (Face → Speech → Pupil → Arm), Start button → `/intake`
  - Form validation: name non-empty, gender selected, YOB valid (1900–current year), consent required
  - `ProgressStepper.vue` stub (4 steps, none active)
- **Tests**: Vitest + Vue Test Utils — form blocks submit when required fields missing; 995 banner appears on `sudden_now`; valid submission writes correct shape to store and navigates to `/hub`
- **Demo**: Full intake form renders; submits with test data; lands on hub stub with participant name visible in store

---

### Task 3: Hub view — guided dashboard with module cards

- **Objective**: Build the central hub that sequences the four modules (Face → Speech → Pupil → Arm), tracks completion status, and routes the patient into each module.
- **Implementation**:
  - `HubView.vue`: reads `session.sequence` (`['smilefa', 'speech', 'plr', 'pronator']`) and `session.results` from Pinia; renders four `ModuleCard` components in that order
  - `ModuleCard.vue`: props — `moduleId`, `title`, `description`, `status` (`idle | active | complete | skipped | error`), `indicator` (green/amber/red/grey); emits `start`
  - Sequence logic: "Next" is the first `idle` module; completed cards show their headline indicator; active card is highlighted
  - "Start next" advances to the next module route; "Revisit" on completed cards allows re-entry
  - `ProgressStepper.vue` fully wired with step labels: **1 Face · 2 Speech · 3 Pupil · 4 Arm**
  - "View summary" button appears once all four modules have a result (complete or skipped)
  - "Skip this module" per card (marks as `skipped`, result = `null`)
- **Tests**: Vitest + Vue Test Utils — hub highlights correct next module in the Face→Speech→Pupil→Arm order; completed modules show indicator; skip works; "View summary" only appears when all four have a status
- **Demo**: Hub renders with all four cards idle in correct order; clicking "Start" on card 1 navigates to SmileFaView; returning marks it complete; hub reflects updated state with Speech as next

---

### Task 4: Integrate smile-fa as a Vue module view (Step 1 — Face)

- **Objective**: Mount the smile-fa Vanilla JS engine inside `SmileFaView.vue`, inject participant data, suppress its own intake screens (S0/S1), and emit its result to the Pinia store on completion.
- **Implementation**:
  - Copy `smile-fa/js/` → `src/modules/smilefa/`; copy `smile-fa/config/` and `smile-fa/css/`
  - `SmileFaView.vue`: provides `<div ref="mount">`; on `onMounted`, dynamically imports `smilefa/js/app.js`, initialises it pointing at the mount ref
  - Patch `smilefa/js/state.js`: export `setParticipant(intake)` to pre-fill `state.meta` from Pinia intake (name, gender, YOB, consent, lang, m10); call before `boot()`
  - Patch `smilefa/js/app.js`: replace `showScreen('s0')` with `showScreen('s2')` (skip welcome and consent screens since wrapper handled them); hide S0/S1 DOM sections
  - Patch `smilefa/js/ui/results.js`: after `renderPublicResult`, call `window.__smileWrapper?.onSmileFaComplete(result)`; `SmileFaView.vue` registers this callback, writes result to `session.results.smilefa`, routes to `/hub`
  - Map smile-fa's `C11_indicator` → hub card `indicator`
- **Tests**: Vitest — `setParticipant` correctly maps Pinia intake to smile-fa state; result callback writes correct indicator to store
- **Demo**: Hub Step 1 → SmileFaView loads at camera setup (no welcome/consent) → complete test → returns to hub with Face indicator shown; Speech card highlighted as next

---

### Task 5: Integrate speechsignal as a Vue module view (Step 2 — Speech)

- **Objective**: Mount the speechsignal Vanilla JS engine inside `SpeechView.vue`, inject participant data, suppress the `/session` intake route, and emit its result to Pinia on completion.
- **Implementation**:
  - Copy `speechsignal/src/` → `src/modules/speechsignal/`
  - `SpeechView.vue`: provides `<main ref="mount">`; on `onMounted`, imports `speechsignal/src/app/main.js`; passes mount ref as root element
  - Patch `speechsignal/src/app/state.js`: export `setParticipantFromIntake(intake)` — sets `state.meta.participant` (name), `state.meta.age` (derived from YOB), `state.meta.sex`, `state.lang`; call before `start()`
  - Patch `speechsignal/src/app/router.js`: start directly at `record` route (skip `session` intake); keep `results` and `method` routes
  - Patch `speechsignal/src/routes/results.js`: detect wrapper via `window.__smileWrapper` and call `onSpeechComplete(state.res)` after render; `SpeechView.vue` writes result to `session.results.speech`, maps `deviationIndex` to indicator, routes to `/hub`
  - Language: `session.intake.lang` drives `state.lang` in speechsignal; language selector in the session route is bypassed
- **Tests**: Vitest — `setParticipantFromIntake` maps correctly; result callback fires with correct shape; deviation index → indicator mapping covers all bands
- **Demo**: Hub Step 2 → SpeechView loads at recording screen (not session setup) → record tasks → results shown → returns to hub with Speech indicator; Pupil card highlighted as next

---

### Task 6: Integrate pupil-plr-screener as a Vue module view (Step 3 — Pupil)

- **Objective**: Mount the PLR Vanilla JS engine inside `PlrView.vue` with device-capability detection, inject participant data, and emit its result to Pinia on completion.
- **Implementation**:
  - Copy `pupil-plr-screener/app/` → `src/modules/plr/`
  - `PlrView.vue`: on `onMounted`, runs `detectCapabilities()` from `plr/capabilities.js`; if `!torchSupported`, renders a Vue capability-warning card ("Android Chrome required for LED torch") with Skip and Demo mode options; otherwise mounts PLR app into `<div ref>`
  - Patch `plr/main.js`: accept `onComplete(result)` callback via `window.__smileWrapper?.onPlrComplete`; `finishSession()` calls it; `PlrView.vue` writes result to `session.results.plr`
  - Patch `plr/main.js`: replace `boot()` with `bootWithConfig(config)` accepting externally-provided config — skips intro/settings screens
  - Hub card capability states: torch available → normal; torch unavailable + demo mode → ⚠ badge; skipped → grey
- **Tests**: Vitest — torch available mock → normal mount; torch unavailable mock → warning card + skip button visible; result callback writes to store with correct indicator
- **Demo**: Hub Step 3 on Android Chrome → PLR capture screen directly; on desktop → capability warning with Skip/Demo options; completing or skipping returns to hub; Arm card highlighted as next

---

### Task 7: Port pronator-drift UI screens to Vue (Step 4 — Arm)

- **Objective**: Replace React screens with Vue SFCs while keeping the entire TypeScript analysis engine verbatim.
- **Implementation**:
  - Copy `pronator-drift-app/src/analysis/`, `cv/`, `config/`, `session/`, `audio/`, `types/` → `src/modules/pronator/` (`.tsx` → `.ts` for non-UI files)
  - Create `src/modules/pronator/screens/` with Vue SFC equivalents:
    - `WelcomeScreen.vue` — suppressed; wrapper handles welcome
    - `ParticipantInfoScreen.vue` — suppressed; reads from Pinia instead
    - `SafetyConfirmationScreen.vue` — kept (module-specific)
    - `CameraSetupScreen.vue`, `InstructionScreen.vue`, `PositionValidationScreen.vue`, `CalibrationScreen.vue`, `AssessmentScreen.vue`, `CompletionScreen.vue`, `ResultsScreen.vue`, `FailureScreen.vue`
  - `PronatorView.vue`: Vue state machine starting at `safetyConfirmation`; reads participant from Pinia; on results completion writes `PronatorDriftAssessment` to `session.results.pronator` and routes to `/hub`
  - `AssessmentSessionContext` pattern replicated as Vue `provide/inject`
  - Port `BrowserCompatibilityGate` as a Vue component
- **Tests**: Vitest + Vue Test Utils — state machine transitions from `safetyConfirmation` through to `results`; participant pre-populated from store; result written on completion; adapt existing property-based tests (`.property.test.ts`) to Vitest
- **Demo**: Hub Step 4 → PronatorView at safety confirmation (no welcome/intake) → camera setup → calibration → 30s assessment → results → returns to hub with Arm indicator; all four steps complete; "View Summary" button appears

---

### Task 8: Combined summary view

- **Objective**: Build `SummaryView` with the patient-facing FAST traffic-light panel (Face / Speech / Pupil / Arm) and the printable/exportable clinician report.
- **Implementation**:
  - `TrafficLightPanel.vue`: four rows in sequence order — **Face** (SMILE-FAI + pattern), **Speech** (deviation index + slur count), **Pupil** (symmetric/asymmetric/demo/skipped), **Arm** (drift indicator + pronation); each row shows coloured indicator dot, headline metric, and `unreliable`/`skipped` flag; non-diagnostic language throughout; colour never carries meaning alone
  - `ClinicianReport.vue`: participant details strip (name, gender, YOB, date/time); one section per module in sequence order with key metrics table; combined JSON/CSV export (all four results merged with intake); Print button (`window.print()` with print CSS)
  - `SummaryView.vue`: "Patient view" (traffic-light default) / "Clinician view" toggle; "Repeat a module" returns to hub; "New session" clears store and returns to `/`
  - Combined export schema: `{ session: { id, createdAt, intake }, results: { smilefa, speech, plr, pronator } }`
  - 995 emergency reminder prominently at top of summary
- **Tests**: Vitest — `TrafficLightPanel` renders rows in Face→Speech→Pupil→Arm order with correct indicator colours; skipped modules render grey; clinician report renders all four sections in order; JSON export produces correct schema; print triggers `window.print()`
- **Demo**: Complete all four modules (or use seeded mock results); summary shows traffic-light in correct sequence order; toggle to clinician view shows full report with participant details; Export JSON downloads combined file

---

### Task 9: Navigation, accessibility, and cross-cutting concerns

- **Objective**: Wire navigation guards, keyboard focus management, emergency banner behaviour, language propagation, and responsive layout.
- **Implementation**:
  - Vue Router guards: block `/hub` and module routes if intake not complete; block `/summary` if no results; redirect to `/` on stale state
  - Focus management: `router.afterEach` moves focus to first `<h1>` in new view
  - `EmergencyBanner.vue`: visible on every route; high-prominence mode when `session.intake.symptomOnset === 'sudden_now'`
  - Language propagation: `session.intake.lang` change triggers `setVoiceLang` in each active module
  - Responsive layout: minimum 1024×768 landscape for Face/Arm/Speech (front camera modules) with portrait rotation overlay; PLR is portrait-phone-friendly (rear camera)
  - Accessibility: WCAG 2.1 AA for focus order, contrast, ARIA landmarks across all views
  - `onBeforeUnload` guard: warns if session has unsaved results
- **Tests**: Vitest + Vue Test Utils — navigation guard blocks `/hub` without intake; focus moves to `<h1>` on route change; emergency banner prominence switches on `sudden_now`
- **Demo**: Full keyboard-only navigation end-to-end; portrait phone shows rotate overlay for Face/Speech/Arm screens; PLR works in portrait; 995 banner always visible

---

### Task 10: Build pipeline, deployment, and repository sync documentation

- **Objective**: Configure Vite for production build, set up GitHub Pages deployment, and document how to keep source modules in sync with upstream repositories.
- **Implementation**:
  - `vite.config.ts`: `base: './'`; Web Worker format `'es'`; resolve alias `@` → `src/`
  - `package.json` scripts: `dev`, `build`, `preview`, `test`, `test:e2e`
  - GitHub Actions workflow: build → deploy to GitHub Pages
  - `SYNC.md`: documents which directories in `src/modules/` come from which upstream repo and every patch applied (the `setParticipant` bridge functions, `onComplete` callbacks, skipped-screen changes) — enables clean upstream merges
  - Vitest config for the full project; Playwright e2e for the happy path (intake → Face → Speech → Pupil → Arm → summary)
  - `VITE_SHEETS_WEBAPP_URL` environment variable passed through to all four modules' existing sheet export functions
- **Tests**: Playwright e2e happy-path smoke test; `npm run build` produces no TypeScript errors; all four module source trees included in the bundle
- **Demo**: `npm run build` succeeds; `dist/` opens over a static server with all four modules functional in correct sequence order; GitHub Actions deploys to Pages
