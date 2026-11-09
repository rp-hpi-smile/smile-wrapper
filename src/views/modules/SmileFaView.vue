<template>
  <!-- rotate overlay: smilefa requires landscape ≥ 1024×768 -->
  <div id="rotate-overlay" class="rotate-overlay" role="alertdialog" aria-live="assertive">
    <div class="rotate-overlay__card">
      <div class="rotate-overlay__icon" aria-hidden="true">⟳</div>
      <h2>Please rotate to landscape</h2>
      <p>This screen works in landscape on a tablet or desktop (minimum 1024×768).</p>
    </div>
  </div>

  <!-- App root — mirrors smilefa/index.html structure -->
  <main ref="mount" id="smilefa-app" class="app" aria-live="polite">
    <!-- S0 Welcome (shown first — user picks language, then Start → S2 setup) -->
    <section id="s0-welcome" class="screen" data-screen="s0" aria-label="Welcome">
      <div class="col col--left">
        <h2 data-i18n="s0.language">Language</h2>
        <div
          id="language-select"
          class="language-select"
          role="group"
          aria-label="Language selection"
        >
          <button class="lang-btn" data-lang="en" type="button">English</button>
          <button class="lang-btn" data-lang="zh" type="button">中文</button>
          <button class="lang-btn" data-lang="ms" type="button">Bahasa Melayu</button>
          <button class="lang-btn" data-lang="ta" type="button">தமிழ்</button>
        </div>
      </div>
      <div class="col col--center col--center-hero">
        <p class="brand-eyebrow" data-i18n="brand.eyebrow">SMILE</p>
        <h1 class="brand-title" data-i18n="s0.title">Facial Asymmetry Screen</h1>
        <p class="brand-sub" data-i18n="s0.subtitle">A screening aid — not a diagnostic device.</p>
        <button id="btn-start" class="btn btn--primary btn--lg" type="button" data-i18n="s0.start">
          Start
        </button>
        <div class="mode-select" role="group" aria-label="Mode">
          <label class="radio"
            ><input type="radio" name="mode" value="self_screen" checked />
            <span data-i18n="s0.mode.self">Self-screen</span></label
          >
          <label class="radio"
            ><input type="radio" name="mode" value="assisted" />
            <span data-i18n="s0.mode.assisted">Assisted</span></label
          >
        </div>
      </div>
      <div class="col col--right">
        <h2 data-i18n="s0.about">About</h2>
        <p class="disclaimer" data-i18n="s0.disclaimer">
          This tool measures facial movement asymmetry. It does not diagnose stroke. If symptoms are
          sudden, call 995 now.
        </p>
      </div>
    </section>

    <!-- S1 Consent (hidden — wrapper handles consent) -->
    <section
      id="s1-consent"
      class="screen"
      data-screen="s1"
      aria-label="Consent and symptoms"
      hidden
    >
      <div class="col col--center">
        <fieldset class="fieldset">
          <legend>Symptoms &amp; history</legend>
          <label class="check"
            ><input type="checkbox" id="m12-consent" />
            <span>I understand and consent (PDPA)</span></label
          >
          <label class="check"
            ><input type="checkbox" id="consent-datashare" />
            <span
              >I consent to de-identified results being sent to a secure research spreadsheet</span
            ></label
          >
          <label class="field" for="participant-name">Full name</label>
          <input
            type="text"
            id="participant-name"
            class="select"
            placeholder="Your full name"
            autocomplete="name"
          />
          <span class="field">Gender</span>
          <div class="radio-row" role="group" aria-label="Gender">
            <label class="radio"
              ><input type="radio" name="gender" value="male" /> <span>Male</span></label
            >
            <label class="radio"
              ><input type="radio" name="gender" value="female" /> <span>Female</span></label
            >
            <label class="radio"
              ><input type="radio" name="gender" value="prefer_not" />
              <span>Prefer not to say</span></label
            >
          </div>
          <label class="field" for="participant-yob">Year of birth</label>
          <input
            type="number"
            id="participant-yob"
            class="select"
            min="1900"
            max="2100"
            step="1"
            placeholder="e.g. 1985"
          />
          <label class="field" for="m10-onset">Sudden symptoms now?</label>
          <select id="m10-onset" class="select">
            <option value="none">No</option>
            <option value="sudden_now">Yes — sudden, now</option>
            <option value="earlier">Earlier</option>
            <option value="unknown">Unknown</option>
          </select>
          <fieldset class="confounders">
            <legend>Confounders</legend>
            <label class="check"
              ><input type="checkbox" name="m11" value="glasses" /> <span>Glasses</span></label
            >
            <label class="check"
              ><input type="checkbox" name="m11" value="facial_hair" />
              <span>Facial hair</span></label
            >
            <label class="check"
              ><input type="checkbox" name="m11" value="dentures_braces" />
              <span>Dentures / braces</span></label
            >
            <label class="check"
              ><input type="checkbox" name="m11" value="prev_palsy" />
              <span>Previous facial palsy</span></label
            >
            <label class="check"
              ><input type="checkbox" name="m11" value="prev_stroke" />
              <span>Previous stroke</span></label
            >
            <label class="check"
              ><input type="checkbox" name="m11" value="botox_filler" />
              <span>Recent Botox / filler</span></label
            >
            <label class="check"
              ><input type="checkbox" name="m11" value="facial_surgery" />
              <span>Facial surgery</span></label
            >
          </fieldset>
          <button id="btn-to-setup" class="btn btn--primary" type="button" disabled>
            Continue
          </button>
        </fieldset>
      </div>
    </section>

    <!-- S2 Setup -->
    <section id="s2-setup" class="screen" data-screen="s2" aria-label="Setup" hidden>
      <div class="col col--left">
        <h2>Quality checks</h2>
        <ul id="gate-checklist" class="gate-list" aria-live="polite">
          <li data-gate="face">
            <span class="gate-tick" aria-hidden="true">•</span> Face detected
          </li>
          <li data-gate="distance"><span class="gate-tick" aria-hidden="true">•</span> Distance</li>
          <li data-gate="pose"><span class="gate-tick" aria-hidden="true">•</span> Head pose</li>
          <li data-gate="lighting">
            <span class="gate-tick" aria-hidden="true">•</span> Lighting level
          </li>
          <li data-gate="lighting_balance">
            <span class="gate-tick" aria-hidden="true">•</span> Lighting balance
          </li>
          <li data-gate="fps"><span class="gate-tick" aria-hidden="true">•</span> Frame rate</li>
        </ul>
      </div>
      <div class="col col--center">
        <div class="camera-stage">
          <video id="setup-video" class="camera-video" playsinline muted></video>
          <canvas id="setup-overlay" class="camera-overlay"></canvas>
          <div class="guide-oval" aria-hidden="true"></div>
        </div>
        <button id="btn-begin-test" class="btn btn--primary" type="button" disabled>
          Begin test
        </button>
      </div>
      <div class="col col--right">
        <h2>Tips</h2>
        <ul class="tips">
          <li>Face an even light source; avoid side lighting.</li>
          <li>Remove glasses if possible.</li>
          <li>Fill the oval; sit upright.</li>
        </ul>
        <label class="field" for="video-file">Offline: load a video file</label>
        <input type="file" id="video-file" accept="video/*" class="select" />
      </div>
    </section>

    <!-- S3 Test -->
    <section id="s3-test" class="screen" data-screen="s3" aria-label="Test" hidden>
      <div class="col col--left">
        <h2>Phases</h2>
        <ol id="phase-list" class="phase-list"></ol>
        <div class="quality-meter" aria-label="Measurement quality">
          <span class="quality-meter__label">Quality</span>
          <div class="quality-meter__bar">
            <div id="quality-fill" class="quality-meter__fill"></div>
          </div>
        </div>
      </div>
      <div class="col col--center">
        <div class="camera-stage">
          <video id="test-video" class="camera-video" playsinline muted></video>
          <canvas id="test-overlay" class="camera-overlay"></canvas>
          <div id="countdown-ring" class="countdown-ring" aria-hidden="true"></div>
        </div>
        <p id="instruction" class="instruction" aria-live="assertive"></p>
        <img id="pictogram" class="pictogram" alt="" />
      </div>
      <div class="col col--right">
        <h2>Expression</h2>
        <canvas id="emotion-chart" class="chart"></canvas>
        <canvas id="commissure-chart" class="chart chart--mini"></canvas>
        <canvas id="brow-chart" class="chart chart--mini"></canvas>
      </div>
    </section>

    <!-- S4 Public result -->
    <section
      id="s4-public"
      class="screen screen--result"
      data-screen="s4"
      aria-label="Result"
      hidden
    >
      <header class="result-header">
        <div class="result-header__brand">
          <span class="result-header__logo">SMILE</span>
          <span class="result-header__sub">Facial Asymmetry Screen</span>
        </div>
        <div class="result-header__org">Republic Polytechnic</div>
      </header>
      <div class="result-grid">
        <div class="result-card result-card--verdict">
          <div id="indicator" class="indicator" role="status" data-state="green">
            <span class="indicator__dot" aria-hidden="true"></span>
            <span id="indicator-label" class="indicator__label"></span>
          </div>
          <div class="score-ring" aria-label="Asymmetry score">
            <svg viewBox="0 0 120 120" width="150" height="150">
              <circle class="score-ring__track" cx="60" cy="60" r="52" />
              <circle id="score-ring-fill" class="score-ring__fill" cx="60" cy="60" r="52" />
            </svg>
            <div class="score-ring__label">
              <span id="score-value" class="score-ring__value">0</span>
              <span class="score-ring__unit">SMILE-FAI</span>
            </div>
          </div>
          <p id="public-message" class="public-message"></p>
          <p id="affected-side" class="affected-side"></p>
        </div>
        <div class="result-card result-card--diagram">
          <h3 class="result-card__title">Affected region</h3>
          <div id="face-diagram" class="face-diagram" aria-label="Affected region diagram"></div>
        </div>
        <div class="result-card result-card--details">
          <a href="tel:995" id="emergency-cta" class="emergency-cta" role="button">
            <span class="emergency-cta__icon" aria-hidden="true">☎</span>
            <span class="emergency-cta__text">If symptoms are sudden, call 995 now</span>
          </a>
          <h3 class="result-card__title">Key measurements</h3>
          <ul id="key-metrics" class="key-metrics"></ul>
          <h3 class="result-card__title">Interpretation</h3>
          <ul id="interpretation" class="interpretation"></ul>
          <div class="result-actions">
            <button id="btn-repeat" class="btn btn--primary" type="button">Repeat test</button>
            <button id="btn-save-baseline" class="btn btn--outline" type="button">
              Save as baseline
            </button>
            <button id="btn-clinician" class="btn-link" type="button">Clinician view →</button>
          </div>
        </div>
      </div>
      <p class="result-footer">
        Screening aid, not a diagnostic device. Research use only. Thresholds provisional.
      </p>
    </section>

    <!-- S5 Clinician view -->
    <section
      id="s5-clinician"
      class="screen screen--full"
      data-screen="s5"
      aria-label="Clinician view"
      hidden
    >
      <div class="clin-topbar">
        <button id="btn-clin-back" class="btn btn--ghost" type="button">← Back to result</button>
        <div class="clin-topbar__actions">
          <button id="btn-export-json" class="btn" type="button">Export JSON</button>
          <button id="btn-export-csv" class="btn" type="button">Export CSV</button>
          <button id="btn-print" class="btn" type="button">Print report</button>
        </div>
      </div>
      <div class="tabs" role="tablist">
        <button class="tab" role="tab" aria-selected="true" data-tab="summary">Summary</button>
        <button class="tab" role="tab" aria-selected="false" data-tab="metrics">Metrics</button>
        <button class="tab" role="tab" aria-selected="false" data-tab="emotion">Emotion</button>
      </div>
      <div class="tab-panels">
        <div class="tab-panel" data-panel="summary"></div>
        <div class="tab-panel" data-panel="metrics" hidden></div>
        <div class="tab-panel" data-panel="emotion" hidden></div>
      </div>
    </section>

    <!-- S6 History -->
    <section id="s6-history" class="screen" data-screen="s6" aria-label="History" hidden>
      <div class="col col--left">
        <h2>Sessions</h2>
        <ul id="session-list" class="session-list"></ul>
      </div>
      <div class="col col--center">
        <h2>Baseline trends</h2>
        <canvas id="trend-chart" class="chart"></canvas>
      </div>
      <div class="col col--right">
        <button id="btn-export-all" class="btn" type="button">Export all</button>
        <button id="btn-delete-all" class="btn btn--danger" type="button">Delete all data</button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import '@/modules/smilefa/css/app.css'

const mount = ref(null)

onMounted(async () => {
  // setParticipant could be called here with data from the Pinia session store,
  // e.g.: setParticipant(sessionStore.intake)
  // Wired up fully in Task 4 once the Pinia store is in place.
  const { init, setParticipant } = await import(/* @vite-ignore */ '@/modules/smilefa/js/app.js')

  // TODO (Task 4): inject participant data from Pinia before init
  // const sessionStore = useSessionStore()
  // setParticipant(sessionStore.intake)

  await init(mount.value, {
    onComplete: (result) => {
      // TODO (Task 4): write result to Pinia and navigate to hub
      // sessionStore.results.smilefa = result
      // router.push('/hub')
      console.log('[SmileFaView] test complete', result)
    },
  })
})

onUnmounted(() => {
  // Clean up the global wrapper callback to avoid stale references.
  if (window.__smileWrapper) {
    delete window.__smileWrapper.onSmileFaComplete
  }
})
</script>

<style>
/*
 * Cancel the hub's 2rem content padding so the smilefa 3-column grid
 * fills the full content-pane width edge-to-edge.
 *
 * The hub .content has `flex: 1; padding: 2rem` but no `overflow: hidden`,
 * so negative margins safely pull #smilefa-app out to the padding edges.
 * calc(100% + 4rem) restores the full width (2rem reclaimed on each side).
 *
 * Height: smilefa's own `.app { height: 100vh }` rule handles vertical
 * sizing already — no override needed here.
 */
#smilefa-app {
  margin: -2rem;
  width: calc(100% + 4rem);
  min-width: 1024px;
}
</style>
