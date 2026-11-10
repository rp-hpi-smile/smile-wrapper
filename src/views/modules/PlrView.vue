<template>
  <div ref="mount" id="plr-app" class="plr-app"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import '@/modules/plr/styles.css'

const mount = ref(null)

onMounted(async () => {
  const { init } = await import('@/modules/plr/app/main.js')
  init(mount.value)
})

onUnmounted(() => {
  // The PLR module removes its own resize listener via init(); nothing else
  // to clean up at the moment, but this lifecycle hook is here as a hook
  // point for future teardown (e.g. stopping the camera when navigating away).
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
