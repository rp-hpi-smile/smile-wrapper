/**
 * Mount-scoped stylesheets for embedded modules.
 *
 * A plain `import './x.css'` is injected once by Vite and never removed, so a
 * module's global rules (html/body, `canvas { background }`, `video { ... }`,
 * generic class names like `.card` / `.pill`) keep applying to every view
 * visited afterwards. Speech's `canvas { background: var(--bg) }`, for
 * example, turned every later camera overlay canvas opaque, hiding the video.
 *
 * Import the CSS with `?inline` instead and attach it only while the module is
 * on screen.
 *
 * @param {string[]} cssTexts CSS source strings (from `import css from './x.css?inline'`)
 * @param {string} id Identifier written to data-view-style (for debugging)
 * @returns {() => void} Removes the injected <style> elements
 */
export function attachViewStyles(cssTexts, id) {
  const els = cssTexts.map((css) => {
    const el = document.createElement('style')
    el.setAttribute('data-view-style', id)
    el.textContent = css
    document.head.appendChild(el)
    return el
  })
  return () => els.forEach((el) => el.remove())
}
