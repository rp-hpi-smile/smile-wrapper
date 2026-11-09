/* ==========================================================================
   library.js — embedding entry point for SpeechView.vue.

   Replaces main.js + router hash-navigation with a self-contained mount/
   destroy API that never reads or writes location.hash, so it coexists with
   Vue Router's hash history without conflict.

   Usage:
     import { mountSpeech, destroySpeech } from '.../library.js'
     const api = await mountSpeech(mainEl, liveEl)
     // api.navigate('record')
     destroySpeech()
   ========================================================================== */

import { state } from './state.js';
import {
  register,
  setNavigate, clearNavigate,
  announce,
} from './router.js';

import * as session from '../routes/session.js';
import * as record  from '../routes/record.js';
import * as results from '../routes/results.js';
import * as method  from '../routes/method.js';

// Internal state — reset on each mount so re-navigation always starts fresh.
let _mountEl  = null;
let _liveEl   = null;
let _current  = null;   // { name, mod }

// --------------------------------------------------------------------------
// Core render — identical logic to router.js handle() but driven by name
// directly, never by location.hash.
// --------------------------------------------------------------------------
async function renderRoute(name) {
  const routes = { session, record, results, method };
  if (!routes[name]) name = 'session';

  if (_current?.mod?.teardown) {
    try { _current.mod.teardown(); } catch (e) { console.error(e); }
  }

  const mod = routes[name];
  _mountEl.innerHTML = '';

  const page = document.createElement('div');
  page.className = 'page';
  page.setAttribute('role', 'region');
  page.setAttribute('aria-label', mod.title || name);
  _mountEl.appendChild(page);

  try {
    await mod.render(page);
  } catch (e) {
    console.error(e);
    page.innerHTML =
      '<div class="panel"><div class="ptitle">Error</div><p>' +
      'Something went wrong rendering this screen. Check the console.</p></div>';
  }

  _current = { name, mod };
  document.title = 'SMILE Speech Signal Lab \u2014 ' + (mod.title || name);

  // Update nav aria-current within the speech shell only.
  _mountEl.closest('.speech-shell')
    ?.querySelectorAll('nav.routes a[data-route]')
    .forEach(a => {
      a.dataset.route === name
        ? a.setAttribute('aria-current', 'page')
        : a.removeAttribute('aria-current');
    });

  // Focus the page heading for keyboard / SR users.
  const h = page.querySelector('h1, [tabindex="-1"]');
  if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: false }); }

  announce((mod.title || name) + ' screen');
}

// --------------------------------------------------------------------------
// Public API
// --------------------------------------------------------------------------

/**
 * Mount the speech module into the given DOM elements.
 *
 * @param {HTMLElement} mainEl  - the <main> render target
 * @param {HTMLElement} liveEl  - the polite aria-live region
 * @returns {{ navigate(name: string): Promise<void> }}
 */
export async function mountSpeech(mainEl, liveEl) {
  _mountEl = mainEl;
  _liveEl  = liveEl;
  _current = null;

  // Runtime context detection — mirrors main.js
  state.secureContext = window.isSecureContext;
  state.fileMode = location.protocol === 'file:';
  if (
    state.fileMode ||
    !state.secureContext ||
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    state.fileMode =
      state.fileMode || !state.secureContext || !navigator.mediaDevices;
  }

  // Register all routes.
  register('session', session);
  register('record',  record);
  register('results', results);
  register('method',  method);

  // Override go() in router.js so route modules (session, record, …) that
  // call go('record') drive renderRoute() instead of writing location.hash.
  setNavigate(navigate);

  // Unload warning — safe to add multiple times; browsers deduplicate.
  window.addEventListener('beforeunload', beforeUnload);

  // Render the initial route.
  await renderRoute('session');

  return { navigate };
}

/**
 * Navigate to a named speech route without touching location.hash.
 * @param {string} name  session | record | results | method
 */
export async function navigate(name) {
  if (!_mountEl) return;
  await renderRoute(name);
}

/**
 * Tear down the speech module — stops active route loops, removes listeners.
 * Call from Vue's onUnmounted.
 */
export function destroySpeech() {
  if (_current?.mod?.teardown) {
    try { _current.mod.teardown(); } catch (e) { console.error(e); }
  }
  _current  = null;
  _mountEl  = null;
  _liveEl   = null;
  clearNavigate();
  window.removeEventListener('beforeunload', beforeUnload);
}

function beforeUnload(e) {
  if (!state.exported && Object.keys(state.audio).length) {
    e.preventDefault();
    e.returnValue =
      'Recordings have not been exported. They exist only in memory and will be lost.';
    return e.returnValue;
  }
}
