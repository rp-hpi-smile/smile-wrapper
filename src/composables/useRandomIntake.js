// c:\Users\james_ng2\Repositories\smile-wrapper\src\composables\useRandomIntake.js

export function useRandomIntake() {
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
  }

  function generateRandomData() {
    const firstNames = [
      'Wei',
      'Mei',
      'Ahmad',
      'Nurul',
      'Raj',
      'Priya',
      'James',
      'Sarah',
      'Li',
      'Aisha',
      'David',
      'Fatimah',
    ]
    const lastNames = [
      'Tan',
      'Lim',
      'Abdullah',
      'Singh',
      'Kumar',
      'Wong',
      'Lee',
      'Rahman',
      'Chen',
      'Smith',
      'Ng',
      'Hassan',
    ]

    // DOB: age 18–80
    const now = new Date()
    const ageYears = randInt(18, 80)
    const dob = new Date(now.getFullYear() - ageYears, randInt(0, 11), randInt(1, 28))
    const dobStr = [
      dob.getFullYear(),
      String(dob.getMonth() + 1).padStart(2, '0'),
      String(dob.getDate()).padStart(2, '0'),
    ].join('-')

    return {
      full_name: `${pick(firstNames)} ${pick(lastNames)}`,
      dob: dobStr,
      sex: pick(['Male', 'Female', 'Other', 'Prefer not to say']),
    }
  }

  return { generateRandomData }
}
