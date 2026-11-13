import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import type { ParticipantPrefill } from './types/index'
import './index.css'
import './styles/accessibility.css'

/**
 * Mount the pronator React app into `container`.
 * Called by PronatorView.vue after the host element is in the DOM.
 *
 * @param initialParticipant Optional values used to pre-fill the participant form.
 */
export function init(container: HTMLElement, initialParticipant?: ParticipantPrefill) {
  const root = createRoot(container)
  root.render(
    <StrictMode>
      <App initialParticipant={initialParticipant} />
    </StrictMode>,
  )
  // Lets the host unmount the app so effect cleanups (camera release) run.
  return () => root.unmount()
}
