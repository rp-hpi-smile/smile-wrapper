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
      'Wei', 'Mei', 'Ahmad', 'Nurul', 'Raj', 'Priya', 'James', 'Sarah', 'Li', 'Aisha',
      'David', 'Fatimah'
    ]
    const lastNames = [
      'Tan', 'Lim', 'Abdullah', 'Singh', 'Kumar', 'Wong', 'Lee', 'Rahman', 'Chen', 'Smith',
      'Ng', 'Hassan'
    ]

    // DOB: age 18–80
    const now = new Date()
    const ageYears = randInt(18, 80)
    const dob = new Date(
      now.getFullYear() - ageYears,
      randInt(0, 11),
      randInt(1, 28)
    )
    const dobStr = [
      dob.getFullYear(),
      String(dob.getMonth() + 1).padStart(2, '0'),
      String(dob.getDate()).padStart(2, '0'),
    ].join('-')

    // Malaysian mobile: +60-1X-XXXXXXXX
    // Second digit of subscriber number: 1–9 for variety
    const mobilePrefix = pick(['10', '11', '12', '13', '14', '16', '17', '18', '19'])
    const mobileSuffix = String(randInt(1000000, 9999999)).padStart(7, '0')
    const contact_number = `+60-${mobilePrefix}-${mobileSuffix}`

    const systolic = randInt(100, 140)
    const diastolic = randInt(60, 90)

    return {
      full_name: `${pick(firstNames)} ${pick(lastNames)}`,
      dob: dobStr,
      sex: pick(['Male', 'Female', 'Other']),
      ethnicity: pick(['Chinese', 'Malay', 'Indian', 'Caucasian', 'Mixed', 'Other']),
      contact_number,
      height: randInt(150, 190),
      weight: randInt(50, 100),
      blood_pressure: `${systolic}/${diastolic} mmHg`,
      heart_rate: randInt(55, 100),
      spo2: randInt(95, 100),
    }
  }

  return { generateRandomData }
}
