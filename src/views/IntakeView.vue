<script setup>
import { reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session.js'
import { useRandomIntake } from '../composables/useRandomIntake.js'

const router = useRouter()
const sessionStore = useSessionStore()
const { generateRandomData } = useRandomIntake()

const form = reactive({
  full_name: '',
  dob: '',
  sex: '',
})

// All fields must be non-empty strings (or non-zero numbers converted to string)
const isFormComplete = computed(() => Object.values(form).every((v) => String(v).trim() !== ''))

let dataGenerated = false

watch(
  [() => sessionStore.participant_id, () => sessionStore.session_id],
  ([pid, sid]) => {
    if (pid && sid && !dataGenerated) {
      const data = generateRandomData()
      Object.assign(form, data)
      dataGenerated = true
    }
  },
  { immediate: true },
)

function handleSave() {
  if (!isFormComplete.value) return
  sessionStore.setIntake(form)
  router.push({ name: 'hub' })
}
</script>

<template>
  <main class="intake-layout">
    <!-- Header -->
    <header class="intake-header">
      <div class="photo-placeholder" aria-label="Photo placeholder">
        <span class="photo-label">Photo</span>
      </div>
      <div class="session-info">
        <div class="info-row">
          <span class="info-label">Participant ID</span>
          <span class="info-value">{{ sessionStore.participant_id || '—' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Session ID</span>
          <span class="info-value">{{ sessionStore.session_id || '—' }}</span>
        </div>
      </div>
    </header>

    <!-- Two-column form -->
    <form class="intake-form" @submit.prevent="handleSave" novalidate>
      <div class="form-grid">
        <!-- Left column: Demographics -->
        <fieldset class="form-section">
          <legend>Demographics</legend>

          <div class="field">
            <label for="full_name">Full Name</label>
            <input id="full_name" v-model="form.full_name" type="text" autocomplete="name" />
          </div>

          <div class="field">
            <label for="dob">Date of Birth</label>
            <input id="dob" v-model="form.dob" type="date" />
          </div>

          <div class="field">
            <label for="sex">Sex</label>
            <select id="sex" v-model="form.sex">
              <option value="" disabled>Select…</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </fieldset>
      </div>

      <!-- Footer -->
      <footer class="form-footer">
        <button type="submit" class="btn-save" :disabled="!isFormComplete">Save</button>
      </footer>
    </form>
  </main>
</template>

<style scoped>
/* ── TRON / BlazePod theme ── */
.intake-layout {
  min-height: 100vh;
  padding: 2rem;
  background: #050810;
  color: #e8eaf0;
  font-family: 'Exo 2', sans-serif;
  /* faint cyan grid */
  background-image:
    linear-gradient(rgba(0, 229, 255, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 229, 255, 0.07) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* Header */
.intake-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-bottom: 1.25rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(0, 229, 255, 0.18);
}

.photo-placeholder {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 4px;
  background: #111d35;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0, 229, 255, 0.18);
}

.photo-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7a99;
  user-select: none;
}

.session-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.info-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.65rem;
  font-weight: 400;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7a99;
  min-width: 110px;
}

.info-value {
  font-family: 'Exo 2', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: #00e5ff;
  text-shadow: 0 0 8px rgba(0, 229, 255, 0.4);
}

/* Form grid */
.intake-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: minmax(0, 480px);
  gap: 2rem;
}

/* Fieldset / legend */
.form-section {
  background: #0d1526;
  border: 1px solid rgba(0, 229, 255, 0.18);
  border-top: 3px solid #ff6b00;
  border-radius: 6px;
  padding: 1.25rem 1.5rem;
  margin: 0;
  box-shadow:
    0 0 12px rgba(0, 229, 255, 0.5),
    0 0 28px rgba(0, 229, 255, 0.2);
}

.form-section legend {
  padding: 0 0.5rem;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #00e5ff;
  text-shadow: 0 0 8px rgba(0, 229, 255, 0.4);
}

/* Fields */
.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 1.1rem;
}

.field:last-child {
  margin-bottom: 0;
}

.field label {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.65rem;
  font-weight: 400;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7a99;
}

.field input,
.field select {
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
  width: 100%;
  box-sizing: border-box;
}

.field input::placeholder {
  color: #6b7a99;
}

.field input:focus,
.field select:focus {
  border-color: rgba(0, 229, 255, 0.5);
  box-shadow: 0 0 0 2px rgba(255, 107, 0, 0.25);
}

/* Select arrow retint */
.field select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2300e5ff'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2rem;
}

/* Select options */
.field select option {
  background: #111d35;
  color: #e8eaf0;
}

/* Input with unit */
.input-with-unit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-with-unit input {
  flex: 1;
}

.unit {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.65rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6b7a99;
  white-space: nowrap;
}

/* Footer */
.form-footer {
  display: flex;
  justify-content: flex-end;
}

.btn-save {
  padding: 0.75rem 2.5rem;
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

.btn-save:hover:not(:disabled) {
  box-shadow:
    0 0 18px rgba(255, 107, 0, 0.8),
    0 0 40px rgba(255, 107, 0, 0.35);
}

.btn-save:focus-visible {
  outline: 2px solid #ff6b00;
  outline-offset: 3px;
}

.btn-save:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
