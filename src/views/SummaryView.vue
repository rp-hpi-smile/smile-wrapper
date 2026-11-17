<script setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useSessionStore } from '../stores/session.js'

const sessionStore = useSessionStore()
const { participant_id, session_id, full_name, dob, sex, moduleStatus } = storeToRefs(sessionStore)

const sessionData = computed(() => ({
  participant_id: participant_id.value,
  session_id: session_id.value,
  full_name: full_name.value,
  dob: dob.value,
  sex: sex.value,
  moduleStatus: moduleStatus.value,
}))

function reloadApp() {
  window.location.reload()
}
</script>

<template>
  <section class="summary">
    <h1>Summary</h1>
    <p>Placeholder for the dashboard summarising results of all modules.</p>

    <h2>Session</h2>
    <dl>
      <template v-for="(value, key) in sessionData" :key="key">
        <template v-if="key !== 'moduleStatus'">
          <dt>{{ key }}</dt>
          <dd>{{ value || '—' }}</dd>
        </template>
      </template>
    </dl>

    <h2>Module status</h2>
    <dl>
      <template v-for="(status, name) in moduleStatus" :key="name">
        <dt>{{ name }}</dt>
        <dd>{{ status }}</dd>
      </template>
    </dl>

    <h2>Raw store data</h2>
    <pre>{{ JSON.stringify(sessionData, null, 2) }}</pre>

    <button type="button" @click="reloadApp">New Participant</button>
  </section>
</template>

<style scoped>
.summary {
  padding: 1rem;
}
dl {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.25rem 1rem;
}
dt {
  font-weight: 600;
}
dd {
  margin: 0;
}
pre {
  background: rgba(128, 128, 128, 0.15);
  padding: 0.75rem;
  overflow: auto;
}
</style>
