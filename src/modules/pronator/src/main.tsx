import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import type { ParticipantPrefill } from './types/index'
// Global stylesheets (html/body/#root/button rules) are loaded as text and
// attached only while the app is mounted, so they don't leak into the other
// views of the host app after navigating away.
import indexCss from './index.css?inline'
import accessibilityCss from './styles/accessibility.css?inline'

/** Attach CSS text as <style> elements; returns a function that removes them. */
function attachStyles(cssTexts: string[]): () => void {
  const els = cssTexts.map((css) => {
    const el = document.createElement('style')
    el.setAttribute('data-view-style', 'pronator')
    el.textContent = css
    document.head.appendChild(el)
    return el
  })
  return () => els.forEach((el) => el.remove())
}

/**
 * Mount the pronator React app into `container`.
 * Called by PronatorView.vue after the host element is in the DOM.
 *
 * @param initialParticipant Optional values used to pre-fill the participant form.
 * @returns Unmount function: tears down React (camera release) and its styles.
 */
export function init(container: HTMLElement, initialParticipant?: ParticipantPrefill) {
  const detachStyles = attachStyles([indexCss, accessibilityCss])
  const root = createRoot(container)
  root.render(
    <StrictMode>
      <App initialParticipant={initialParticipant} />
    </StrictMode>,
  )
  // Lets the host unmount the app so effect cleanups (camera release) run.
  return () => {
    root.unmount()
    detachStyles()
  }
}
