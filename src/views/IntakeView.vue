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
  ethnicity: '',
  contact_number: '',
  height: '',
  weight: '',
  blood_pressure: '',
  heart_rate: '',
  spo2: '',
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
  console.log('Intake form saved', {
    participant_id: sessionStore.participant_id,
    session_id: sessionStore.session_id,
    ...form,
  })
  router.push({ name: 'smilefa' })
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
            </select>
          </div>

          <div class="field">
            <label for="ethnicity">Ethnicity</label>
            <input id="ethnicity" v-model="form.ethnicity" type="text" />
          </div>

          <div class="field">
            <label for="contact_number">Contact Number</label>
            <input
              id="contact_number"
              v-model="form.contact_number"
              type="tel"
              autocomplete="tel"
            />
          </div>
        </fieldset>

        <!-- Right column: Vital Signs & Physical Measurements -->
        <fieldset class="form-section">
          <legend>Vital Signs &amp; Physical Measurements</legend>

          <div class="field">
            <label for="height">Height</label>
            <div class="input-with-unit">
              <input id="height" v-model="form.height" type="number" min="0" step="0.1" />
              <span class="unit">cm</span>
            </div>
          </div>

          <div class="field">
            <label for="weight">Weight</label>
            <div class="input-with-unit">
              <input id="weight" v-model="form.weight" type="number" min="0" step="0.1" />
              <span class="unit">kg</span>
            </div>
          </div>

          <div class="field">
            <label for="blood_pressure">Blood Pressure</label>
            <input
              id="blood_pressure"
              v-model="form.blood_pressure"
              type="text"
              placeholder="e.g. 120/80 mmHg"
            />
          </div>

          <div class="field">
            <label for="heart_rate">Heart Rate</label>
            <div class="input-with-unit">
              <input id="heart_rate" v-model="form.heart_rate" type="number" min="0" />
              <span class="unit">bpm</span>
            </div>
          </div>

          <div class="field">
            <label for="spo2">Oxygen Saturation</label>
            <div class="input-with-unit">
              <input id="spo2" v-model="form.spo2" type="number" min="0" max="100" />
              <span class="unit">%</span>
            </div>
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
.intake-layout {
  min-height: 100vh;
  padding: 2rem;
  background: var(--color-background, #fff);
  color: var(--color-text, #111);
  font-family: inherit;
}

/* Header */
.intake-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-bottom: 1.25rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--color-border, #e0e0e0);
}

.photo-placeholder {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 6px;
  background: var(--color-background-mute, #e8e8e8);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border, #ccc);
}

.photo-label {
  font-size: 0.8rem;
  color: var(--color-text-soft, #888);
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
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-soft, #888);
  min-width: 100px;
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-heading, #111);
}

/* Form grid */
.intake-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

/* Fieldset / legend */
.form-section {
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: 8px;
  padding: 1.25rem 1.5rem;
  margin: 0;
}

.form-section legend {
  padding: 0 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-soft, #666);
  text-transform: uppercase;
  letter-spacing: 0.04em;
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
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text, #333);
}

.field input,
.field select {
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--color-border, #ccc);
  border-radius: 6px;
  font-size: 1rem;
  background: var(--color-background-soft, #fafafa);
  color: var(--color-text, #111);
  outline-offset: 2px;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
}

.field input:focus,
.field select:focus {
  border-color: var(--color-primary, #4a90d9);
  outline: 2px solid var(--color-primary, #4a90d9);
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
  font-size: 0.875rem;
  color: var(--color-text-soft, #888);
  white-space: nowrap;
}

/* Footer */
.form-footer {
  display: flex;
  justify-content: flex-end;
}

.btn-save {
  padding: 0.75rem 2rem;
  background: var(--color-primary, #4a90d9);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-save:hover {
  opacity: 0.88;
}

.btn-save:focus-visible {
  outline: 2px solid var(--color-primary, #4a90d9);
  outline-offset: 3px;
}

.btn-save:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
