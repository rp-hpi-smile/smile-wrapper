<template>
  <!-- Mount point for the pronator React app -->
  <div ref="mount" id="pronator-app"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

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
 */
#pronator-app {
  margin: -2rem;
  min-width: 1024px;
  min-height: 100%;
  overflow-y: auto;
}
</style>
