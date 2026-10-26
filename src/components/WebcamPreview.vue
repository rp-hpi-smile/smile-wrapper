<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision'

const emit = defineEmits(['face-detected'])

const videoEl = ref(null)
const canvasEl = ref(null)
const errorMsg = ref(null)
let stream = null
let faceDetector = null
let rafId = null
let hasEmitted = false

function startDetectionLoop() {
  function loop() {
    if (videoEl.value && videoEl.value.readyState >= 2 && faceDetector) {
      const result = faceDetector.detectForVideo(videoEl.value, performance.now())

      if (canvasEl.value) {
        const canvas = canvasEl.value
        const ctx = canvas.getContext('2d')
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (result.detections.length > 0) {
          const scaleX = canvas.width / videoEl.value.videoWidth
          const scaleY = canvas.height / videoEl.value.videoHeight

          ctx.strokeStyle = '#00ff00'
          ctx.lineWidth = 2

          for (const detection of result.detections) {
            const { originX, originY, width, height } = detection.boundingBox
            ctx.strokeRect(originX * scaleX, originY * scaleY, width * scaleX, height * scaleY)
          }
        }
      }

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
  if (canvasEl.value) {
    const canvas = canvasEl.value
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
})
</script>

<template>
  <div class="webcam-preview">
    <div v-if="!errorMsg" class="video-container">
      <video ref="videoEl" autoplay playsinline muted aria-label="Webcam preview" />
      <canvas ref="canvasEl" class="face-overlay" />
    </div>
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

.video-container {
  position: relative;
  width: 100%;
  height: 100%;
}

video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.face-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.webcam-error {
  color: #fff;
  font-size: 0.875rem;
  text-align: center;
  padding: 1rem;
}
</style>
