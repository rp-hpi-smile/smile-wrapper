/**
 * SMILE-FA — config.js
 *
 * Loads the JSON config files (landmarks, thresholds, protocol) once and caches
 * them. Uses fetch (works on GitHub Pages) rather than import assertions.
 *
 * @module config
 */

// Resolve config paths relative to this module file, not the document URL,
// so they work correctly when mounted inside the Vue wrapper.
const CONFIG_BASE = new URL('../config/', import.meta.url).href

let cache = null

/**
 * Load all configs. Cached after first call.
 * @returns {Promise<{landmarks:object, thresholds:object, protocol:object}>}
 */
export async function loadConfigs() {
  if (cache) return cache
  const [landmarks, thresholds, protocol, integrations] = await Promise.all([
    fetch(CONFIG_BASE + 'landmarks.json', { cache: 'no-store' }).then((r) => r.json()),
    fetch(CONFIG_BASE + 'thresholds.json', { cache: 'no-store' }).then((r) => r.json()),
    fetch(CONFIG_BASE + 'protocol.json', { cache: 'no-store' }).then((r) => r.json()),
    // Optional integrations config (Google Sheets etc.); tolerate absence.
    fetch(CONFIG_BASE + 'integrations.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
  ])
  cache = { landmarks, thresholds, protocol, integrations }
  return cache
}
