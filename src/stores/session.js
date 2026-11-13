import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSessionStore = defineStore('session', () => {
  const participant_id = ref('')
  const session_id = ref('')
  const full_name = ref('')
  const dob = ref('')
  const sex = ref('')

  function setSession(pid, sid) {
    participant_id.value = pid
    session_id.value = sid
  }

  function setIntake(data) {
    full_name.value = data.full_name
    dob.value = data.dob
    sex.value = data.sex
  }

  return { participant_id, session_id, full_name, dob, sex, setSession, setIntake }
})
