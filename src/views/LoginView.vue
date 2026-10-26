<script setup>
import { reactive, computed } from 'vue'
import WebcamPreview from '../components/WebcamPreview.vue'

const form = reactive({
  participant_id: '',
  session_id: '',
})

function handleFaceDetected() {
  if (form.participant_id === '' && form.session_id === '') {
    form.participant_id = 'P-' + String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
    form.session_id = 'S-' + String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
  }
}

const canBegin = computed(() => form.participant_id !== '' && form.session_id !== '')

function handleSubmit() {
  // Emit or route on successful login
  console.log('Login submitted', { ...form })
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
              placeholder="e.g. P-001"
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
              placeholder="e.g. S-001"
            />
          </div>

          <button type="submit" class="btn-submit" :disabled="!canBegin">Begin Session</button>
        </form>
      </div>
    </section>
  </main>
</template>

<style scoped>
.login-layout {
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100%;
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
  background: #111;
}

.panel-form {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--color-background, #fff);
}

/* Form card */
.form-card {
  width: 100%;
  max-width: 360px;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.75rem;
  color: var(--color-heading, #111);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 1.25rem;
}

.field label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text, #333);
}

.field input {
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--color-border, #ccc);
  border-radius: 6px;
  font-size: 1rem;
  background: var(--color-background-soft, #fafafa);
  color: var(--color-text, #111);
  outline-offset: 2px;
  transition: border-color 0.15s;
}

.field input:focus {
  border-color: var(--color-primary, #4a90d9);
  outline: 2px solid var(--color-primary, #4a90d9);
}

.btn-submit {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: var(--color-primary, #4a90d9);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-submit:hover {
  opacity: 0.88;
}

.btn-submit:focus-visible {
  outline: 2px solid var(--color-primary, #4a90d9);
  outline-offset: 3px;
}

.btn-submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
