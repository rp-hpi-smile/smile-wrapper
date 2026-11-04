import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSessionStore = defineStore('session', () => {
  const participant_id = ref('')
  const session_id = ref('')

  function setSession(pid, sid) {
    participant_id.value = pid
    session_id.value = sid
  }

  return { participant_id, session_id, setSession }
})
