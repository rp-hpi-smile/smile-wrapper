<template>
  <!-- Mount point for the pronator React app -->
  <div ref="mount" id="pronator-app"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCameraGuard } from '@/composables/useCameraGuard'
// Stops the camera if the React app left a stream running.
useCameraGuard()

const mount = ref(null)

onMounted(async () => {
  const { init } = await import('@/modules/pronator/src/main.tsx')
  init(mount.value)
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
