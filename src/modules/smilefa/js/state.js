/**
 * SMILE-FA — state.js
 *
 * Tiny shared app state + screen router. No framework. The router toggles the
 * [hidden] attribute on <section.screen> elements (design.md §2 state machine).
 *
 * @module state
 */

export const SCREENS = ['s0', 's1', 's2', 's3', 's4', 's5', 's6']

/** @type {{screen:string, mode:string, lang:string, session:object|null, result:object|null}} */
export const state = {
  screen: 's0',
  mode: 'self_screen',
  lang: 'en',
  meta: { m10: 'none', m11: [], consent: false },
  session: null,
  result: null,
}

const listeners = new Set()

/** Subscribe to screen changes. @param {(screen:string)=>void} fn */
export function onScreenChange(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/**
 * Show one screen, hide the rest.
 * @param {string} screen
 */
export function showScreen(screen) {
  state.screen = screen
  document.querySelectorAll('.screen[data-screen]').forEach((el) => {
    el.hidden = el.dataset.screen !== screen
  })
  for (const fn of listeners) fn(screen)
}

/**
 * Pre-fill state.meta from the wrapper's Pinia intake object.
 * Call this before init() so the module skips its own intake screens.
 * @param {{ name?:string, gender?:string, yearOfBirth?:number, lang?:string, symptomOnset?:string, confounders?:string[], consentDataShare?:boolean }} intake
 */
export function setParticipant(intake) {
  if (!intake) return
  if (intake.name !== undefined) state.meta.participantName = intake.name
  if (intake.gender !== undefined) state.meta.gender = intake.gender
  if (intake.yearOfBirth !== undefined) state.meta.yearOfBirth = intake.yearOfBirth
  if (intake.lang !== undefined) state.lang = intake.lang
  if (intake.symptomOnset !== undefined) state.meta.m10 = intake.symptomOnset
  if (intake.confounders !== undefined) state.meta.m11 = intake.confounders
  if (intake.consentDataShare !== undefined) state.meta.consentDataShare = intake.consentDataShare
  // Mark consent as given — wrapper already collected it.
  state.meta.consent = true
}
