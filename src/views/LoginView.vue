<script setup>
import { reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import WebcamPreview from '../components/WebcamPreview.vue'
import { useSessionStore } from '../stores/session.js'
import { md5 } from '../utils/md5.js'

const sessionStore = useSessionStore()
const router = useRouter()

const form = reactive({
  participant_id: '',
  session_id: '',
})

/** Local time as YYYY-MM-DDTHH:mm:ss (no timezone suffix). */
function localTimestamp(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0')
  return (
    `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}` +
    `T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
  )
}

function handleFaceDetected() {
  if (form.participant_id === '' && form.session_id === '') {
    form.participant_id = 'P-' + localTimestamp()
    form.session_id = md5(form.participant_id + ':' + Date.now())
    sessionStore.setSession(form.participant_id, form.session_id)
  }
}

const canBegin = computed(() => form.participant_id !== '' && form.session_id !== '')

function handleSubmit() {
  sessionStore.setSession(form.participant_id, form.session_id)
  router.push('/intake')
}
</script>

<template>
  <main class="login-layout">
    <!-- Left panel: webcam -->
    <section class="panel panel-camera" aria-label="Webcam preview">
      <WebcamPreview @face-detected="handleFaceDetected" />
    </section>

    <!-- Right panel: login form -->
    <section class="panel panel-form">
      <div class="form-card">
        <h1 class="form-title">Session Login</h1>

        <form @submit.prevent="handleSubmit" novalidate>
          <div class="field">
            <label for="participant_id">Participant ID</label>
            <input
              id="participant_id"
              v-model="form.participant_id"
              type="text"
              autocomplete="off"
              required
              placeholder="e.g. P-2026-01-31T14:05:09"
            />
          </div>

          <div class="field">
            <label for="session_id">Session ID</label>
            <input
              id="session_id"
              v-model="form.session_id"
              type="text"
              autocomplete="off"
              required
              placeholder="Auto-generated"
            />
          </div>

          <button type="submit" class="btn-submit" :disabled="!canBegin">Begin Session</button>
        </form>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* ── TRON / BlazePod theme ── */
.login-layout {
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100%;
  background: #050810;
  font-family: 'Exo 2', sans-serif;
  /* faint cyan grid */
  background-image:
    linear-gradient(rgba(0, 229, 255, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 229, 255, 0.07) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* Equal-width panels */
.panel {
  flex: 1 1 0;
  min-width: 0;
}

.panel-camera {
  display: flex;
  align-items: stretch;
  padding: 1.5rem;
  background: #0a0f1e;
  border-right: 1px solid rgba(0, 229, 255, 0.18);
}

.panel-form {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: transparent;
}

/* Form card */
.form-card {
  width: 100%;
  max-width: 360px;
  background: #0d1526;
  border: 1px solid rgba(0, 229, 255, 0.18);
  border-top: 3px solid #ff6b00;
  border-radius: 6px;
  padding: 2rem;
  box-shadow:
    0 0 12px rgba(0, 229, 255, 0.5),
    0 0 28px rgba(0, 229, 255, 0.2);
}

.form-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 1.75rem;
  color: #00e5ff;
  text-shadow:
    0 0 12px rgba(0, 229, 255, 0.5),
    0 0 28px rgba(0, 229, 255, 0.2);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 1.25rem;
}

.field label {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.7rem;
  font-weight: 400;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7a99;
}

.field input {
  padding: 0.625rem 0.75rem;
  border: 1px solid rgba(0, 229, 255, 0.18);
  border-radius: 4px;
  font-family: 'Exo 2', sans-serif;
  font-size: 1rem;
  background: #111d35;
  color: #e8eaf0;
  outline: none;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.field input::placeholder {
  color: #6b7a99;
}

.field input:focus {
  border-color: rgba(0, 229, 255, 0.5);
  box-shadow: 0 0 0 2px rgba(255, 107, 0, 0.25);
}

.btn-submit {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #ff6b00;
  color: #fff;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition:
    box-shadow 0.2s,
    opacity 0.15s;
  box-shadow:
    0 0 12px rgba(255, 107, 0, 0.6),
    0 0 30px rgba(255, 107, 0, 0.25);
}

.btn-submit:hover:not(:disabled) {
  box-shadow:
    0 0 18px rgba(255, 107, 0, 0.8),
    0 0 40px rgba(255, 107, 0, 0.35);
}

.btn-submit:focus-visible {
  outline: 2px solid #ff6b00;
  outline-offset: 3px;
}

.btn-submit:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
