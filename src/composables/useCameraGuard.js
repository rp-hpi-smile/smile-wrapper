import { onBeforeUnmount } from 'vue'

/**
 * Camera ownership for module views (SmileFa, PLR, Pronator).
 *
 * Each guarded view opens a "scope". While a scope is active, every stream
 * returned by navigator.mediaDevices.getUserMedia is recorded against it. When
 * the view unmounts, the scope stops all of its streams, including streams
 * that resolve *after* unmount (permission prompt or device open still pending
 * when the user navigated away). Those late streams are what used to keep the
 * camera busy so the next view could not open it.
 */

let currentScope = null
let hookInstalled = false

// Errors Chrome (notably Android) raises when the camera device is still being
// released by a previous owner. Retrying after a short delay usually succeeds.
const TRANSIENT_ERRORS = new Set(['NotReadableError', 'TrackStartError', 'AbortError'])
const RETRY_DELAYS_MS = [300, 700, 1500]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function stopStream(stream) {
  stream.getTracks().forEach((track) => {
    if (track.readyState === 'live') track.stop()
  })
}

function installGetUserMediaHook() {
  if (hookInstalled) return
  const md = typeof navigator !== 'undefined' ? navigator.mediaDevices : undefined
  if (!md || typeof md.getUserMedia !== 'function') return
  hookInstalled = true

  const original = md.getUserMedia.bind(md)

  md.getUserMedia = async function guardedGetUserMedia(constraints) {
    // Capture the scope at call time: the request belongs to the view that
    // made it, even if another view is mounted by the time it resolves.
    const scope = currentScope
    let stream
    for (let attempt = 0; ; attempt++) {
      try {
        stream = await original(constraints)
        break
      } catch (err) {
        const retryable =
          TRANSIENT_ERRORS.has(err?.name) &&
          attempt < RETRY_DELAYS_MS.length &&
          !(scope && scope.disposed)
        if (!retryable) throw err
        await sleep(RETRY_DELAYS_MS[attempt])
      }
    }

    if (scope) {
      if (scope.disposed) {
        // View is gone: release immediately. The caller gets ended tracks,
        // which is harmless because its UI no longer exists.
        stopStream(stream)
      } else {
        scope.streams.add(stream)
      }
    }
    return stream
  }
}

/**
 * Stop every live MediaStream track attached to a <video> element in the
 * document. Document-wide on purpose: Pronator appends its hidden <video> to
 * document.body, outside the view's mount element. This is safe because only
 * one module view is mounted at a time.
 */
export function stopLiveCameraTracks() {
  document.querySelectorAll('video').forEach((video) => {
    const stream = video.srcObject
    if (stream instanceof MediaStream) stopStream(stream)
    video.srcObject = null
  })
}

/** Call from a view's setup to release all camera streams it opened on unmount. */
export function useCameraGuard() {
  installGetUserMediaHook()

  const scope = { streams: new Set(), disposed: false }
  currentScope = scope

  // onBeforeUnmount, not onUnmounted: the view's DOM is still attached here,
  // so videos inside the mount element can still be found.
  onBeforeUnmount(() => {
    scope.disposed = true
    scope.streams.forEach(stopStream)
    scope.streams.clear()
    stopLiveCameraTracks()
    if (currentScope === scope) currentScope = null
  })
}
