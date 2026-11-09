# Investigation Report: SmileFa S0 → S1 Transition Bug

**Date:** 2026-11-09  
**Scope:** `smile-wrapper` — `SmileFaView.vue` and `smilefa/js/` module

---

## Summary Answer

**S0 does not transition to S1 because the Vue wrapper deliberately sets `skipConsent: true`, which hardwires the Start button to jump directly to S2 (camera setup), bypassing S1 (consent/participant-data screen) entirely.**

This is not a broken event binding or a state-machine error — it is an intentional architectural choice made in `app.js init()` that is **incomplete**: the intent was that the wrapper would collect participant data via Pinia before calling `init()`, so S1 could safely be skipped. But that Pinia integration is currently commented out as `// TODO (Task 4)`, meaning participant metadata is never injected, S1 is silently skipped, and the user never sees the consent/data-entry step.

If the user expects to see S1, the fix is to either:
1. Remove `skipConsent: true` (restores S1 in the wrapper), or
2. Complete the Task 4 Pinia integration and accept that S1 is skipped in favour of wrapper-provided data.

---

## Evidence

### 1. What are S0 and S1?

`S0`, `S1`, … `S6` are **screen-level states** in a flat, custom state machine implemented in `state.js`. They are not Vue components, routes, or a framework router — they are plain HTML `<section>` elements toggled visible/hidden by the `hidden` attribute.

**`state.js` — screen router** (`src/modules/smilefa/js/state.js`, lines 30–37):
```js
export function showScreen(screen) {
  state.screen = screen
  document.querySelectorAll('.screen[data-screen]').forEach((el) => {
    el.hidden = el.dataset.screen !== screen
  })
  for (const fn of listeners) fn(screen)
}
```

CSS rule that hides non-active screens (`app.css`, line 31):
```css
.screen[hidden] { display: none; }
```

- **S0 (`#s0-welcome`)** — Welcome screen: language selector + mode radio + Start button.
- **S1 (`#s1-consent`)** — Consent + participant data (name, gender, YoB, confounders).
- **S2 (`#s2-setup`)** — Camera quality gate.
- S3–S6 — Test, public result, clinician view, history.

All six `<section>` elements are rendered statically in `SmileFaView.vue` (lines 17–270). `showScreen()` operates on them via global `document.querySelectorAll`.

---

### 2. What is supposed to trigger S0 → S1?

In the **standalone** (non-wrapper) flow, `boot()` in `app.js` calls:
```js
initWelcome({ onBeginSetup: startSetup })   // no skipConsent flag
```

`wireStart` in `welcome.js` (lines 51–65) then attaches a click listener to `#btn-start` that calls `showScreen('s1')`:

```js
// welcome.js lines 51–65
function wireStart(hooks) {
  const start = document.getElementById('btn-start')
  if (!start) return
  if (hooks && hooks.skipConsent) {
    // Vue wrapper mode: skip S1 — go straight to S2
    start.addEventListener('click', () => {
      showScreen('s2')
      hooks.onBeginSetup()
    })
  } else {
    start.addEventListener('click', () => showScreen('s1'))  // ← standalone path
  }
}
```

The **S0 → S1** path only exists in the `else` branch, i.e., when `skipConsent` is falsy.

---

### 3. Where does language selection feed into that trigger?

Language selection in `wireLanguage()` (`welcome.js`, lines 26–36) is **independent** of the Start button:

```js
buttons.forEach((btn) => {
  btn.addEventListener('click', async () => {
    await setLanguage(btn.dataset.lang)   // updates i18n dict + localStorage
    state.lang = getLang()
    setVoiceLang(state.lang)
    markActive()
  })
})
```

Selecting a language only updates `state.lang`, `localStorage`, and re-applies translations. It does **not** trigger any state transition. It has no gate on the Start button (no `disabled` toggling based on language choice). Language selection therefore does not interfere with the S0 → S1 transition — they are independent listeners.

---

### 4. Why is the transition not happening?

**Root cause — `app.js` `init()`, line 85:**

```js
// app.js lines 74–95 (the Vue wrapper entry point)
export async function init(mountElement, options = {}) {
  ...
  // Show S0 so the user can pick language. Wire Start to skip S1 (consent
  // was already collected by the wrapper) and go straight to S2 (camera setup).
  initWelcome({ onBeginSetup: startSetup, skipConsent: true })   // ← S1 bypass
  ...
}
```

`skipConsent: true` is unconditionally passed. In `wireStart`, this selects the wrapper branch and the Start button is wired to `showScreen('s2')` directly — S1 is never called.

**Contributing gap — `SmileFaView.vue`, lines 21–29:**

```js
onMounted(async () => {
  const { init, setParticipant } = await import('@/modules/smilefa/js/app.js')

  // TODO (Task 4): inject participant data from Pinia before init
  // const sessionStore = useSessionStore()
  // setParticipant(sessionStore.intake)

  await init(mount.value, { onComplete: ... })
})
```

`setParticipant()` is never called. The justification for skipping S1 (participant data already collected) does not hold — no data flows in from Pinia. The module proceeds to S2 with empty `state.meta` (no name, gender, YoB, or consent flag).

**Sequence of events when the user presses Start in the wrapper:**

1. `onMounted` → `init()` → `initWelcome({ skipConsent: true })` — Start button wired to `showScreen('s2') + startSetup()`.
2. User selects language — updates locale only, no state change.
3. User clicks Start — `showScreen('s2')` runs immediately (S0 hides, S2 shows), then `startSetup()` runs.
4. S1 is **never referenced**. The user goes from S0 directly to S2 (camera setup).

There is no broken event binding. The listener on `#btn-start` fires correctly. S1 is skipped by design — the design is just incomplete.

---

### 5. Exact fix needed

There are two valid fixes depending on product intent:

#### Option A — Restore S1 in the wrapper (simplest, correct if consent must be shown in the wrapper context)

Remove `skipConsent: true` from the `init()` call in `app.js`, and wire S1's "Continue" button (already implemented in `wireConsent`) to call `startSetup()`.

**File:** `src/modules/smilefa/js/app.js`, line 85

Change:
```js
initWelcome({ onBeginSetup: startSetup, skipConsent: true })
```

To:
```js
initWelcome({ onBeginSetup: startSetup })
```

This restores S0 → S1 → S2 in the wrapper, using the full consent + participant-data flow already implemented in `wireConsent`. No other changes needed; `wireConsent` already calls `hooks.onBeginSetup()` (which is `startSetup`) when "Continue" is clicked and all fields are valid.

#### Option B — Complete the Task 4 Pinia integration (correct if S1 should remain skipped)

Complete the `setParticipant()` call in `SmileFaView.vue` by reading participant data from the Pinia session store before calling `init()`. This path is already scaffolded (commented out, lines 23–26 of `SmileFaView.vue`). The `setParticipant` function is fully implemented in `state.js` (lines 47–61). Until that data flow exists, `skipConsent: true` leaves the module with an empty `state.meta`, which corrupts the result metadata (participant name, YoB, gender, consentDataShare are all null/empty).

---

## File and Symbol Index

| File | Relevant symbol / lines | Role in the bug |
|------|------------------------|-----------------|
| `src/modules/smilefa/js/app.js` | `init()`, line 85 | Sets `skipConsent: true` unconditionally → bypasses S1 |
| `src/modules/smilefa/js/ui/welcome.js` | `wireStart()`, lines 51–65 | Branches on `skipConsent`; only the `else` branch calls `showScreen('s1')` |
| `src/modules/smilefa/js/state.js` | `showScreen()`, lines 30–37 | The screen router; toggles `[hidden]` on all `.screen[data-screen]` sections |
| `src/views/modules/SmileFaView.vue` | `onMounted`, lines 21–29 | `setParticipant()` call is commented out (TODO Task 4) |
| `src/modules/smilefa/js/i18n.js` | `wireLanguage()` (called from `welcome.js`) | Language selection is independent; not part of the transition trigger |

---

## Conclusions

- S0 → S1 is intentionally skipped in wrapper mode via `skipConsent: true`.
- The Start button listener IS correctly attached; the button IS firing.
- The transition that fires is S0 → S2, not S0 → S1.
- S1 being skipped is incomplete because `setParticipant()` (which justifies the skip) has never been wired up.
- **Recommended fix:** Remove `skipConsent: true` from `app.js init()` (Option A) until the Pinia integration is complete. This is a one-line change that restores the expected flow and preserves all existing S1 logic.
