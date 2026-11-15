import { defineStore } from 'pinia'
import { ref } from 'vue'

function newModuleStatus() {
  return { smilefa: 'idle', speech: 'idle', plr: 'idle', pronator: 'idle' }
}

export const useSessionStore = defineStore('session', () => {
  const participant_id = ref('')
  const session_id = ref('')
  const full_name = ref('')
  const dob = ref('')
  const sex = ref('')

  // Per-module completion status shown as a badge in the hub nav.
  // idle = not finished, sent = Sheets send triggered, done = finished, nothing sent.
  const moduleStatus = ref(newModuleStatus())

  function setModuleStatus(name, status) {
    if (name in moduleStatus.value) moduleStatus.value[name] = status
  }

  function setSession(pid, sid) {
    participant_id.value = pid
    session_id.value = sid
    moduleStatus.value = newModuleStatus()
  }

  function setIntake(data) {
    full_name.value = data.full_name
    dob.value = data.dob
    sex.value = data.sex
  }

  return {
    participant_id,
    session_id,
    full_name,
    dob,
    sex,
    moduleStatus,
    setModuleStatus,
    setSession,
    setIntake,
  }
})
