<template>
  <!-- Mount point for the pronator React app -->
  <div ref="mount" id="pronator-app"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useCameraGuard } from '@/composables/useCameraGuard'
import { useSessionStore } from '@/stores/session.js'
import { ageFromDob, toPronatorGender } from '@/utils/participant.js'
// Stops the camera if the React app left a stream running.
useCameraGuard()

const mount = ref(null)
const sessionStore = useSessionStore()

let unmountApp = null
let disposed = false

onMounted(async () => {
  const { init } = await import('@/modules/pronator/src/main.tsx')
  // User may have navigated away while the module was loading.
  if (disposed || !mount.value) return
  // Pre-fill the participant form from the intake saved in the session store.
  // Undefined values are left blank for the participant to complete.
  unmountApp = init(mount.value, {
    name: sessionStore.full_name || undefined,
    gender: toPronatorGender(sessionStore.sex),
    age: ageFromDob(sessionStore.dob),
  })
})

// Unmount the React root so its cleanups release the camera and CV worker.
// Without this the old app stays alive (and may keep holding the camera).
onBeforeUnmount(() => {
  disposed = true
  unmountApp?.()
  unmountApp = null
})
</script>

<style>
/*
 * Pull the pronator app edge-to-edge inside the hub content pane,
 * matching the approach used by PlrView and SmileFaView.
 *
 * The inner React app uses min-height: 100vh on several elements which
 * blows out the scroll container when embedded. We neutralise those here
 * and let the Hub's .content pane own the scroll.
 */
#pronator-app {
  margin: -2rem;
  min-width: 1024px;
}

/* React root: fill the wrapper, don't expand to 100vh */
#pronator-app #root {
  min-height: unset;
  align-items: flex-start;
}

/* App shell: allow content to grow naturally, not clip with overflow:hidden */
#pronator-app .app {
  min-height: unset;
  overflow: visible;
}

/* Portrait container: remove the 100vh lock */
#pronator-app .app__portrait-container {
  min-height: unset;
}

/* Compatibility gate: same fix */
#pronator-app .compatibility-gate {
  min-height: unset;
}
</style>
