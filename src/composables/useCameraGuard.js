import { onBeforeUnmount } from 'vue'

/**
 * Stop every live MediaStream track attached to a <video> element in the
 * document. Safety net for module views (SmileFa, PLR, Pronator) that own their
 * own camera: if the module fails to release its stream when the user navigates
 * away, the camera (and PLR's torch) would otherwise stay on.
 *
 * Document-wide on purpose: Pronator appends its hidden <video> to
 * document.body, outside the view's mount element. This is safe because only
 * one module view is mounted at a time.
 */
export function stopLiveCameraTracks() {
  document.querySelectorAll('video').forEach((video) => {
    const stream = video.srcObject
    if (stream instanceof MediaStream) {
      stream.getTracks().forEach((track) => {
        if (track.readyState === 'live') track.stop()
      })
    }
    video.srcObject = null
  })
}

/** Call from a view's setup to stop leftover camera tracks on unmount. */
export function useCameraGuard() {
  // onBeforeUnmount, not onUnmounted: the view's DOM is still attached here,
  // so videos inside the mount element can still be found.
  onBeforeUnmount(stopLiveCameraTracks)
}
