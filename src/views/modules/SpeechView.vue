<template>
  <div class="speech-shell">

    <!-- Top navigation bar — mirrors speech/index.html structure -->
    <header class="topbar">
      <div class="topbar-in">
        <a class="brand" href="#" aria-label="SMILE Speech Signal Lab — home"
           @click.prevent="go('session')">
          <b>SMILE</b>
          <span>
            <i>Speech Signal Lab</i>
            <small>Motor speech &amp; prosody measurement</small>
          </span>
        </a>
        <nav class="routes" aria-label="Primary">
          <a href="#" data-route="session" @click.prevent="go('session')">
            <span class="step">1</span> Session
          </a>
          <a href="#" data-route="record" @click.prevent="go('record')">
            <span class="step">2</span> Record
          </a>
          <a href="#" data-route="results" @click.prevent="go('results')">
            <span class="step">3</span> Results
          </a>
          <a href="#" data-route="method" @click.prevent="go('method')">
            <span class="step">4</span> Method
          </a>
        </nav>
      </div>
    </header>

    <!-- Emergency banner — always visible, in normal block flow below topbar -->
    <div class="emergency" role="alert">
      <div class="emergency-in">
        <div>
          <b>Not a stroke test and not a medical device.</b>
          This reports acoustic measurements and how far they sit from reference ranges.
          No threshold here is clinically validated. Sudden face droop, arm weakness or
          new speech difficulty — do not record.
        </div>
        <div class="call">Call 995 now</div>
      </div>
    </div>

    <!-- Route render target -->
    <main ref="mainRef" id="speech-main" tabindex="-1"></main>

    <!-- Polite live region for route-change announcements -->
    <div ref="liveRef" class="visually-hidden" aria-live="polite" aria-atomic="true"></div>
    <div class="visually-hidden" aria-live="assertive" aria-atomic="true"></div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import '@/modules/speech/src/styles/tokens.css'
import '@/modules/speech/src/styles/app.css'
import '@/modules/speech/src/styles/routes.css'
import { mountSpeech, destroySpeech, navigate } from '@/modules/speech/src/app/library.js'

const mainRef = ref(null)
const liveRef = ref(null)

async function go(name) {
  await navigate(name)
}

onMounted(async () => {
  await mountSpeech(mainRef.value, liveRef.value)
})

onUnmounted(() => {
  destroySpeech()
})
</script>

<style>
.speech-shell {
  display: flex;
  flex-direction: column;
  min-width: 1024px;
}

/* Emergency banner sits in normal flow; keep z-index just below sticky topbar */
.speech-shell .emergency {
  position: relative;
  z-index: 39;
}

.topbar-in {
  margin-top: -2rem;
}
</style>
