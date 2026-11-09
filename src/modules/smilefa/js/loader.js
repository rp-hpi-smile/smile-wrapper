/**
 * SMILE-FA — loader.js
 *
 * Loads third-party libraries. @mediapipe/tasks-vision is imported from npm
 * (bundled by Vite); WASM is fetched from the CDN at runtime (browsers cache
 * it after the first load). face-api and Chart.js fall back to CDN.
 *
 * Also provides the HTTPS / secure-origin check required before camera access.
 *
 * @module loader
 */

/* ---- Pinned versions -------------------------------------------------- */
export const VERSIONS = Object.freeze({
  tasksVision: '0.10.22-rc.20250304',
  faceApi: '1.7.14',
  chartJs: '4.5.0',
})

/* ---- CDN URLs --------------------------------------------------------- */
const CDN = Object.freeze({
  // WASM runtime files — must match the npm package version exactly.
  tasksVisionWasm: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSIONS.tasksVision}/wasm`,
  tasksVisionBundle: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSIONS.tasksVision}/vision_bundle.mjs`,
  faceApi: `https://cdn.jsdelivr.net/npm/@vladmandic/face-api@${VERSIONS.faceApi}/dist/face-api.esm.js`,
  faceApiModels: `https://cdn.jsdelivr.net/npm/@vladmandic/face-api@${VERSIONS.faceApi}/model`,
  chartJs: `https://cdn.jsdelivr.net/npm/chart.js@${VERSIONS.chartJs}/dist/chart.umd.js`,
  faceLandmarkerModel:
    'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
})

/** Where each asset was loaded from, for diagnostics. */
export const loadSource = {}

/* ======================================================================
 * Secure-origin check (R1.1, R1.3)
 * ==================================================================== */

export function isSecureContextForCamera() {
  const { protocol, hostname } = window.location
  if (protocol === 'https:') return true
  const local = ['localhost', '127.0.0.1', '::1', '[::1]']
  if (protocol === 'http:' && local.includes(hostname)) return true
  return typeof window.isSecureContext === 'boolean' ? window.isSecureContext : false
}

export function assertSecureContextForCamera() {
  if (isSecureContextForCamera()) return
  const detail =
    window.location.protocol === 'file:'
      ? 'Opening via file:// is not supported. Serve over HTTPS or http://localhost.'
      : 'Camera access requires a secure origin (HTTPS).'
  throw new Error(`${detail} Deploy to GitHub Pages or run a local dev server.`)
}

/* ======================================================================
 * MediaPipe Tasks Vision
 * ==================================================================== */

/**
 * Load @mediapipe/tasks-vision.
 *
 * JS: imported from the npm package so Vite bundles it.
 * WASM: always fetched from the CDN at runtime — WASM binaries cannot be
 *       bundled by Vite and must come from a URL. The CDN version is pinned
 *       to match the npm package so the JS+WASM pair is always consistent.
 *       Browsers cache the WASM response after the first load.
 *
 * @returns {Promise<{ vision: any, wasmBase: string }>}
 */
export async function loadTasksVision() {
  let vision
  try {
    vision = await import('@mediapipe/tasks-vision')
    loadSource.tasksVision = 'npm'
  } catch (err) {
    console.warn('[loader] npm @mediapipe/tasks-vision unavailable, using CDN bundle', err)
    vision = await import(/* @vite-ignore */ CDN.tasksVisionBundle)
    loadSource.tasksVision = 'cdn'
  }
  // WASM always comes from CDN regardless of JS source.
  return { vision, wasmBase: CDN.tasksVisionWasm }
}

/**
 * Resolve the Face Landmarker model URL.
 * Prefers the local copy in public/models/ (served by Vite/the deploy).
 * Falls back to the MediaPipe CDN.
 *
 * @returns {Promise<string>}
 */
export async function resolveFaceLandmarkerModel() {
  const base = import.meta.env.BASE_URL ?? '/'
  const localUrl = `${window.location.origin}${base}models/face_landmarker.task`
  try {
    const res = await fetch(localUrl, { method: 'HEAD' })
    if (res.ok) {
      loadSource.faceLandmarkerModel = 'local'
      return localUrl
    }
  } catch {
    /* fall through to CDN */
  }
  loadSource.faceLandmarkerModel = 'cdn'
  return CDN.faceLandmarkerModel
}

/* ======================================================================
 * face-api.js
 * ==================================================================== */

export async function loadFaceApi() {
  const faceapi = await import(/* @vite-ignore */ CDN.faceApi)
  loadSource.faceApi = 'cdn'
  return { faceapi: faceapi.default ?? faceapi, modelUrl: CDN.faceApiModels }
}

/* ======================================================================
 * Chart.js
 * ==================================================================== */

export async function loadChartJs() {
  if (window.Chart) {
    loadSource.chartJs = loadSource.chartJs ?? 'cached'
    return window.Chart
  }
  return new Promise((resolve, reject) => {
    const el = document.createElement('script')
    el.src = CDN.chartJs
    el.async = true
    el.onload = () => {
      loadSource.chartJs = 'cdn'
      if (!window.Chart) reject(new Error('Chart.js loaded but window.Chart is undefined'))
      else resolve(window.Chart)
    }
    el.onerror = () => reject(new Error('Failed to load Chart.js from CDN'))
    document.head.appendChild(el)
  })
}

/* ======================================================================
 * Diagnostics
 * ==================================================================== */

export function describeVersions() {
  const src = (k) => loadSource[k] ?? 'not-loaded'
  return [
    `mp-tasks-vision-${VERSIONS.tasksVision}(${src('tasksVision')})`,
    `faceapi-${VERSIONS.faceApi}(${src('faceApi')})`,
    `chartjs-${VERSIONS.chartJs}(${src('chartJs')})`,
  ].join(' ')
}
