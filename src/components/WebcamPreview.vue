<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision'

const emit = defineEmits(['face-detected'])

const videoEl = ref(null)
const errorMsg = ref(null)
let stream = null
let faceDetector = null
let rafId = null
let hasEmitted = false

function startDetectionLoop() {
  function loop() {
    if (videoEl.value && videoEl.value.readyState >= 2 && faceDetector) {
      const result = faceDetector.detectForVideo(videoEl.value, performance.now())
      if (!hasEmitted && result.detections.length > 0) {
        hasEmitted = true
        emit('face-detected')
      }
    }
    rafId = requestAnimationFrame(loop)
  }
  rafId = requestAnimationFrame(loop)
}

async function handlePlay() {
  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm',
    )
    faceDetector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
    })
    startDetectionLoop()
  } catch (err) {
    errorMsg.value = 'Face detector unavailable: ' + err.message
  }
}

onMounted(async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    if (videoEl.value) {
      videoEl.value.srcObject = stream
      videoEl.value.addEventListener('play', handlePlay, { once: true })
    }
  } catch (err) {
    errorMsg.value = 'Camera unavailable: ' + err.message
  }
})

onBeforeUnmount(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  if (faceDetector) {
    faceDetector.close()
    faceDetector = null
  }
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
  }
})
</script>

<template>
  <div class="webcam-preview">
    <video v-if="!errorMsg" ref="videoEl" autoplay playsinline muted aria-label="Webcam preview" />
    <div v-else class="webcam-error" role="alert">{{ errorMsg }}</div>
  </div>
</template>

<style scoped>
.webcam-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.webcam-error {
  color: #fff;
  font-size: 0.875rem;
  text-align: center;
  padding: 1rem;
}
</style>
