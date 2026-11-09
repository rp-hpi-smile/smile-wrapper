/**
 * SMILE-FA — config.js
 *
 * Provides the JSON config files (landmarks, thresholds, protocol, integrations)
 * as static ES module imports so Vite bundles them at build time.
 * No fetch needed — eliminates runtime URL resolution issues in the Vue wrapper.
 *
 * @module config
 */

import landmarks from '../config/landmarks.json'
import thresholds from '../config/thresholds.json'
import protocol from '../config/protocol.json'
import integrations from '../config/integrations.json'

let cache = null

/**
 * Load all configs. Cached after first call.
 * @returns {Promise<{landmarks:object, thresholds:object, protocol:object, integrations:object|null}>}
 */
export async function loadConfigs() {
  if (cache) return cache
  cache = { landmarks, thresholds, protocol, integrations }
  return cache
}
