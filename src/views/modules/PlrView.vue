<template>
  <div ref="mount" id="plr-app" class="plr-app"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import '@/modules/plr/styles.css'
import { useCameraGuard } from '@/composables/useCameraGuard'
import { useSessionStore } from '@/stores/session.js'
import { ageFromDob, toPlrGender } from '@/utils/participant.js'
// Stops the rear camera (and torch) if the module left a stream running.
useCameraGuard()

const mount = ref(null)
const sessionStore = useSessionStore()

let plr = null
let disposed = false

onMounted(async () => {
  plr = await import('@/modules/plr/app/main.js')
  // User may have navigated away while the module was loading.
  if (disposed || !mount.value) return
  // Pre-fill the subject details from the intake saved in the session store.
  // Undefined values are left blank for the operator to complete.
  plr.init(mount.value, {
    name: sessionStore.full_name || undefined,
    age: ageFromDob(sessionStore.dob),
    gender: toPlrGender(sessionStore.sex),
  })
})

onBeforeUnmount(() => {
  // Stop the protocol loop, tracker, torch and camera, and drop listeners.
  disposed = true
  plr?.destroy()
})
</script>

<style>
/*
 * Let the PLR app fill the full content pane, mirroring the smilefa approach.
 * The hub .content has `flex: 1; padding: 2rem` — negative margins pull the
 * PLR container out to the padding edges.
 */
#plr-app {
  margin: -2rem;
  min-width: 1024px;
  min-height: calc(100vh - var(--hub-topbar-height, 0px));
}
</style>
