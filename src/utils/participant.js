// Helpers for turning the session store's intake data (full_name, dob, sex)
// into the shapes the Pronator and SmileFA modules expect.

/** Parse 'YYYY-MM-DD' into a Date at local midnight, or null if invalid. */
function parseDob(dob) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob || '')
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}

/** Age in whole years today, or undefined when dob is missing/invalid. */
export function ageFromDob(dob, now = new Date()) {
  const d = parseDob(dob)
  if (!d) return undefined
  let age = now.getFullYear() - d.getFullYear()
  const hadBirthday =
    now.getMonth() > d.getMonth() ||
    (now.getMonth() === d.getMonth() && now.getDate() >= d.getDate())
  if (!hadBirthday) age -= 1
  return age
}

/** Year of birth, or undefined when dob is missing/invalid. */
export function yearOfBirthFromDob(dob) {
  const d = parseDob(dob)
  return d ? d.getFullYear() : undefined
}

/** Store sex -> Pronator gender value. */
export function toPronatorGender(sex) {
  return {
    Male: 'male',
    Female: 'female',
    Other: 'other',
    'Prefer not to say': 'prefer_not_to_say',
  }[sex]
}

/** Store sex -> PLR gender value (PLR uses the same values as Pronator). */
export const toPlrGender = toPronatorGender

/** Store sex -> Speech sex value (Speech keeps its original 'm' / 'f' codes). */
export function toSpeechSex(sex) {
  return {
    Male: 'm',
    Female: 'f',
    Other: 'other',
    'Prefer not to say': 'prefer_not_to_say',
  }[sex]
}

/**
 * Store sex -> SmileFA gender value. SmileFA has no 'Other' option, so it maps
 * to 'Prefer not to say'.
 */
export function toSmileFaGender(sex) {
  return {
    Male: 'male',
    Female: 'female',
    Other: 'prefer_not',
    'Prefer not to say': 'prefer_not',
  }[sex]
}
