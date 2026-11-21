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

const SAFETY_ITEMS = [
  { id: 'safe-sit-stand', label: 'I can safely sit or stand for the duration of the test' },
  { id: 'clear-space', label: 'I have clear space around me' },
  { id: 'device-stable', label: 'My device is securely placed on a stable surface' },
  { id: 'no-arm-pain', label: 'I am not experiencing pain when raising my arms' },
  {
    id: 'stop-if-unwell',
    label: 'I understand to stop if feeling unwell, dizzy, unstable, or uncomfortable',
  },
]

// Safety confirmations (not persisted with the intake data)
const confirmed = reactive(Object.fromEntries(SAFETY_ITEMS.map((i) => [i.id, false])))
const allConfirmed = computed(() => SAFETY_ITEMS.every((i) => confirmed[i.id]))

// All fields must be non-empty strings and all safety items confirmed
const isFormComplete = computed(
  () => Object.values(form).every((v) => String(v).trim() !== '') && allConfirmed.value,
)

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

      <div class="urgent-warning" role="alert" aria-live="assertive">
        <span class="urgent-warning-icon" aria-hidden="true">⚠</span>
        <div>
          <strong class="urgent-warning-heading"
            >STOP immediately and seek emergency medical attention if you experience:</strong
          >
          <ul class="urgent-warning-list">
            <li>Sudden weakness or numbness on one side</li>
            <li>Difficulty speaking or understanding speech</li>
            <li>Sudden severe headache</li>
            <li>Sudden vision problems</li>
            <li>Loss of balance or coordination</li>
          </ul>
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

        <!-- Right column: Safety confirmation -->
        <div class="safety-column">
          <fieldset class="form-section">
            <legend>Safety Checklist</legend>
            <label v-for="item in SAFETY_ITEMS" :key="item.id" class="check-row">
              <input v-model="confirmed[item.id]" type="checkbox" />
              <span>{{ item.label }}</span>
            </label>
          </fieldset>

          <p class="seated-recommendation">
            We recommend performing this test while seated if you are uncertain about your balance.
          </p>
        </div>
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
  grid-template-columns: minmax(0, 480px) minmax(0, 560px);
  gap: 2rem;
  align-items: start;
  justify-content: center;
}

@media (max-width: 1100px) {
  .form-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* Safety column */
.safety-column {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.urgent-warning {
  flex: 1;
  max-width: 560px;
  margin-left: auto;
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: rgba(255, 40, 60, 0.12);
  border: 1px solid #ff2d4a;
  border-radius: 6px;
  color: #ffd9de;
}

.urgent-warning-icon {
  font-size: 1.5rem;
  color: #ff2d4a;
}

.urgent-warning-heading {
  display: block;
  margin-bottom: 0.5rem;
  color: #ff5c73;
}

.urgent-warning-list {
  margin: 0;
  padding-left: 1.25rem;
}

.check-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.9rem;
  cursor: pointer;
  line-height: 1.4;
}

.check-row:last-child {
  margin-bottom: 0;
}

.check-row input {
  flex-shrink: 0;
  width: 1.1rem;
  height: 1.1rem;
  margin-top: 0.2rem;
  accent-color: #00e5ff;
}

.seated-recommendation {
  margin: 0;
  color: #6b7a99;
  font-size: 0.9rem;
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
