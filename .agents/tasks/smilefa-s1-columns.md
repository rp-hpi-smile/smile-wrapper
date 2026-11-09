# Investigation Report: S1 Screen — Left and Right Columns Not Displayed

## Summary Answer

The S1 screen in `SmileFaView.vue` is missing its `col--left` and `col--right` column `<div>` elements entirely. The Vue template only renders a single `<div class="col col--center">`, so the CSS three-column grid (which applies to every `.screen`) has nothing to place in the left and right columns. The original `index.html` has all three columns; the Vue port omitted two of them when translating the markup.

A secondary, related issue: the Vue template is also missing the `#emergency-banner` `<div>` that `wireConsent()` in `welcome.js` tries to show/hide when the user selects "sudden symptoms now". Because the element does not exist, that branch silently no-ops, which is safe but means the emergency alert can never render.

---

## Evidence

### 1. Intended three-column layout (CSS)

File: `src/modules/smilefa/css/app.css`, lines ~110–120

```css
.screen {
  height: 100%;
  display: grid;
  grid-template-columns: var(--col-left) var(--col-center) var(--col-right);
  /* = 1.1fr  1.6fr  1.1fr */
  gap: var(--gap);
  align-items: stretch;
}
```

Every `.screen` is a CSS grid with three named column fractions. The columns are populated by child elements with classes `.col--left`, `.col--center`, and `.col--right` — there is no modifier on `.col` itself that assigns a grid column, so the browser's auto-placement algorithm fills columns left-to-right in DOM order.

### 2. What index.html defines for S1 (the reference markup)

File: `src/modules/smilefa/index.html`, lines 57–100

```html
<section id="s1-consent" class="screen" data-screen="s1" ...>
  <div class="col col--left">           <!-- LEFT column -->
    <h2 data-i18n="s1.consent">Consent</h2>
    <p class="consent-text" data-i18n="s1.consentText">
      Processing happens on this device. No video or images leave the browser.
    </p>
  </div>
  <div class="col col--center">         <!-- CENTER column -->
    <fieldset class="fieldset"> … </fieldset>
  </div>
  <div class="col col--right">          <!-- RIGHT column -->
    <div id="emergency-banner" class="emergency-banner" role="alert" hidden>
      <strong data-i18n="emergency.title">Call 995 now</strong>
      <p data-i18n="emergency.fast">FAST: …</p>
    </div>
  </div>
</section>
```

Three columns: left = consent intro text, center = the form fieldset, right = emergency 995 banner (shown/hidden by JS when `m10-onset` = `sudden_now`).

### 3. What SmileFaView.vue actually renders for S1

File: `src/views/modules/SmileFaView.vue`, lines ~60–130

```html
<section id="s1-consent" class="screen" data-screen="s1" aria-label="Consent and symptoms" hidden>
  <div class="col col--center">
    <fieldset class="fieldset">
      …
    </fieldset>
  </div>
</section>
```

Only `col--center` is present. `col--left` and `col--right` are absent.

**Effect:** The grid has three column tracks but only one child `<div>`. That single div occupies the first track (auto-placement, `grid-column: 1`). Tracks 2 and 3 are empty — visually: the center form content is squashed into the left-most 1.1 fr column instead of its intended 1.6 fr center column, and the other two column areas are blank space. From a user perspective this looks like "missing columns".

### 4. CSS does not hide the columns — the elements are absent

No CSS rule hides `.col--left` or `.col--right` on the S1 screen. The `app.css` `.screen[hidden] { display: none; }` rule applies to the entire section when it is the inactive screen, but once S1 is shown (hidden attribute removed by `showScreen('s1')`), the grid is fully live. There is no `display:none`, `visibility:hidden`, `width:0`, or `overflow:hidden` on `.col` or its children. The columns simply do not exist in the DOM.

### 5. CSS scoping — not a factor

The `<style>` block in `SmileFaView.vue` is **unscoped** (no `scoped` attribute). The only rule it adds is:

```css
#smilefa-app { margin: -2rem; min-width: 1024px; }
```

This pulls the app to the full content-pane width — it does not affect column visibility. The bulk of the styling comes from `src/modules/smilefa/css/app.css` imported in `<script setup>` via `import '@/modules/smilefa/css/app.css'`, which applies globally. Scoping is not the issue.

### 6. JS show/hide — not a factor

`showScreen()` in `state.js` toggles `.hidden` on `.screen[data-screen]` elements:

```js
document.querySelectorAll('.screen[data-screen]').forEach((el) => {
  el.hidden = el.dataset.screen !== screen
})
```

This operates at the `<section>` level, not on the column `<div>` elements inside. No code in `welcome.js`, `app.js`, or `state.js` calls `show`/`hide` on `.col--left` or `.col--right` directly.

The only JS that touches a child element of S1's right column is the `emergency-banner` logic in `welcome.js` line ~83:

```js
const banner = document.getElementById('emergency-banner')
// …
if (banner) banner.hidden = state.meta.m10 !== 'sudden_now'
```

The `if (banner)` null-check means this silently no-ops when the element is missing, so it does not cause an error — but the element is absent from the Vue template, so the emergency 995 alert will never show.

---

## Root Cause

The Vue template in `SmileFaView.vue` was written with only `col--center` for S1. The `col--left` (consent intro text) and `col--right` (emergency 995 banner with `id="emergency-banner"`) were not ported from the canonical `index.html`.

---

## Exact Fix

In `src/views/modules/SmileFaView.vue`, replace the S1 `<section>` content to match the three-column structure from `index.html`:

**Current** (lines ~60–130 of `SmileFaView.vue`):

```html
<section
  id="s1-consent"
  class="screen"
  data-screen="s1"
  aria-label="Consent and symptoms"
  hidden
>
  <div class="col col--center">
    <fieldset class="fieldset">
      …
    </fieldset>
  </div>
</section>
```

**Required change:** Wrap the existing `col--center` fieldset with two sibling columns:

1. Add `<div class="col col--left">` before `col--center` containing the consent description text:

```html
<div class="col col--left">
  <h2 data-i18n="s1.consent">Consent</h2>
  <p class="consent-text" data-i18n="s1.consentText">
    Processing happens on this device. No video or images leave the browser.
  </p>
</div>
```

2. Keep `col--center` with the existing fieldset content unchanged.

3. Add `<div class="col col--right">` after `col--center` containing the emergency banner:

```html
<div class="col col--right">
  <div id="emergency-banner" class="emergency-banner" role="alert" hidden>
    <strong data-i18n="emergency.title">Call 995 now</strong>
    <p data-i18n="emergency.fast">
      FAST: Face drooping, Arm weakness, Speech difficulty — Time to call 995.
    </p>
  </div>
</div>
```

No CSS changes are needed. No JS changes are needed. The three-column grid and the `emergency-banner` JS in `wireConsent()` already expect exactly this structure; the markup just needs to match the canonical `index.html` model.

---

## File/Symbol Reference Table

| File | Relevant lines | Issue |
|---|---|---|
| `src/views/modules/SmileFaView.vue` | S1 `<section>` block (~60–130) | Missing `col--left` and `col--right` divs |
| `src/modules/smilefa/index.html` | Lines 57–100 | Reference/canonical three-column S1 markup |
| `src/modules/smilefa/css/app.css` | `.screen` rule (~110–120) | Three-column grid — correct, no change needed |
| `src/modules/smilefa/js/ui/welcome.js` | `wireConsent()`, `banner` const (~83) | `getElementById('emergency-banner')` silently no-ops because element is absent |
| `src/modules/smilefa/js/state.js` | `showScreen()` | Operates on `<section>`, not on column divs — not the cause |
