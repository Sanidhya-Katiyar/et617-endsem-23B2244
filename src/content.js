// content.js — EVERYTHING YOU MAY WANT TO CHANGE LIVE IS HERE:
// learner-facing text, questions, model answers, feedback, misconception rules, thresholds and material data.
// Change a question / feedback line / threshold in this file only; the components read from it.

// ---------- THRESHOLDS (adaptivity rules) ----------
export const THRESHOLDS = {
  diagnosticOlympiadScore: 3, // warm-up score (out of 3) needed for the Olympiad track
  streakForHarder: 2,         // correct answers in a row that unlock the harder bonus question
  hintsForWorkedExample: 2,   // hints used on one problem before we offer a worked comparison
  struggleSeconds: 180,       // seconds in the lab before we offer a worked comparison
  rushTrials: 3,              // "rushing" = at least this many trials...
  rushSeconds: 60,            // ...within this many seconds, with no hints
  minTrialsForChallenge: 3,   // trials needed before the Conclusion phase unlocks
  timeDiffPercent: 15,        // two results "differ" if their times differ by more than this %
}

// ---------- INQUIRY CYCLE (Pedaste et al., 2015): 5 phases with a minute budget that sums to 10 min (C4) ----------
export const PHASES = [
  { id: 'orientation', name: 'Orientation', screen: 'hook', minutes: 1.5 },
  { id: 'conceptualisation', name: 'Conceptualisation', screen: 'hypothesis', minutes: 1.5 },
  { id: 'investigation', name: 'Investigation', screen: 'lab', minutes: 4 },
  { id: 'conclusion', name: 'Conclusion', screen: 'challenge', minutes: 2 },
  { id: 'discussion', name: 'Discussion', screen: 'summary', minutes: 1 },
]

// ---------- PHYSICS + MATERIALS ----------
export const PHYSICS = { room: 25, melt: 60, maxTime: 300, surfaceLoss: 10 } // °C, °C, s, W/m²K
export const MATERIALS = {
  copper: { name: 'Copper', k: 400, rho: 8960, c: 385 },
  aluminium: { name: 'Aluminium', k: 237, rho: 2700, c: 900 },
  steel: { name: 'Steel', k: 50, rho: 7850, c: 490 },
  glass: { name: 'Glass', k: 1, rho: 2500, c: 840 },
  wood: { name: 'Wood', k: 0.15, rho: 600, c: 1700 },
}
// Rod radius in metres for each cross-section option.
export const AREAS = { thin: { name: 'Thin', r: 0.002 }, medium: { name: 'Medium', r: 0.005 }, thick: { name: 'Thick', r: 0.01 } }

// ---------- VARIABLES the learner can test ----------
export const VARIABLES = [
  ['material', 'Material of the rod'],
  ['length', 'Length of the rod'],
  ['area', 'Cross-section (thickness)'],
  ['sourceT', 'Temperature of the heat source'],
]

// ---------- ORIENTATION: concept intro (Explorer track) ----------
// Concept intro, in small chunks shown one at a time (cognitive load). No formula yet.
export const INTRO = [
  '1/3 · Heat always flows from hotter to colder, until both are at the same temperature. After a night on the table, both spoons have reached room temperature.',
  '2/3 · Materials pass heat along at very different rates. A metal passes energy from particle to particle quickly; wood passes it slowly. This "conduction rate" is what you will investigate.',
  '3/3 · Your skin does not sense temperature. It senses how fast heat leaves your hand. Something that pulls heat away fast feels cold. Can the shape of an object change how fast heat moves too? Find out in the lab.',
]

// ---------- ORIENTATION: diagnostic ----------
export const DIAGNOSTIC = [
  { q: 'First: which one passes heat along fastest?', options: ['Copper', 'Glass', 'Wood'], answer: 'Copper' },
  { q: 'Second: we heat one end of a 1 m rod and a 2 m rod of the same metal. Which far end warms first?', options: ['The 1 m rod', 'Both at once', 'The 2 m rod'], answer: 'The 1 m rod' },
  { q: 'Third: what makes heat flow through a rod faster?', options: ['A bigger temperature difference', 'A longer rod', 'Nothing, only the material'], answer: 'A bigger temperature difference' },
]

// ---------- CONCLUSION: challenge questions ----------
export const QUESTIONS = [
  {
    id: 'q1', type: 'mcq', text: 'Q1. The metal spoon and the wooden spoon have both been on the table all night. Which is colder?',
    model: 'Both are at room temperature. The metal feels colder because it conducts heat away from your hand faster.',
    options: [
      { text: 'The metal spoon', flag: 'M1', fb: "That's misconception M1. Overnight, both spoons reach room temperature, so a thermometer would read the same for each. Metal only *feels* colder because it pulls heat out of your skin faster. Remember copper in the lab." },
      { text: 'The wooden spoon', fb: "Wood isn't colder either: both are at room temperature. Wood actually feels warmer because it takes heat from your hand slowly." },
      { text: 'Both are the same temperature', correct: true, fb: 'Right. Both are at room temperature, and the difference you feel is the rate of heat flow out of your hand.' },
    ],
  },
  {
    id: 'q2', type: 'mcq', text: 'Q2. In the lab, a medium copper rod 10 cm long (source 100 °C) took about 31 s. About how long would the same rod take if it were 20 cm long?',
    model: 'About 125 s (×4). Diffusion time grows with length².',
    options: [
      { text: 'About 31 s, the same', flag: 'M2', fb: "That's M2: length does matter. Heat has to warm every extra slice of rod along the way. Test copper 10 cm vs 20 cm in the lab with everything else held constant." },
      { text: 'About 62 s, double', fb: "Close (longer is slower), but it isn't proportional. Heat spreads by diffusion, and twice the distance takes about four times as long." },
      { text: 'About 125 s, four times', correct: true, fb: 'Yes, about ×4. The time grows with length² (the lab gives 31 s → 133 s).' },
      { text: 'About 15 s, half', fb: 'A longer rod gives heat further to travel, so it must take longer, not less time.' },
    ],
  },
  {
    id: 'q3', type: 'numeric', text: 'Q3. If you double the length of any rod and keep everything else the same, the time for the far end to reach 60 °C becomes roughly how many times longer?',
    model: 'About 4 times (time ∝ L²). Any answer from 3.5 to 4.5 is accepted.',
    check: (x) => {
      if (x >= 3.5 && x <= 4.5) return { correct: true, fb: 'Excellent. Twice the length gives about 4× the time, because diffusion time scales with L².' }
      if (x <= 1.3) return { flag: 'M2', fb: "That's M2: length changes the time a lot. Compare two lab trials that differ only in length." }
      if (x > 1.3 && x < 3.5) return { fb: "Longer does mean slower, but it isn't linear. Compare copper at 10 cm and 20 cm in your table: what's the ratio?" }
      return { fb: 'Too big. Check your 10 cm and 20 cm copper trials and work out the ratio of their times.' }
    },
  },
  {
    id: 'q4', type: 'rank', text: 'Q4. Rank the materials from FASTEST to SLOWEST heat conduction along a rod.',
    start: ['steel', 'wood', 'copper', 'glass', 'aluminium'],
    answer: ['copper', 'aluminium', 'steel', 'glass', 'wood'],
    model: 'Copper (k = 400) > aluminium (237) > steel (50) > glass (1) > wood (0.15).',
  },
  {
    id: 'q5', type: 'mcq', text: 'Q5. Two copper rods, both 20 cm long, with source at 100 °C. One is thin and one is thick. Which far end reaches 60 °C first?',
    model: 'The thick rod. It carries more heat per second (rate ∝ area) and loses a smaller share to the air.',
    options: [
      { text: 'Same time: only the material matters', flag: 'M2', fb: "That's M2: thickness matters too. A thicker rod is like a wider pipe for heat. Test thin vs thick copper in the lab with everything else fixed." },
      { text: 'The thick rod', correct: true, fb: 'Yes. More cross-section carries more heat per second, and less of it leaks to the air (lab: thick 127 s vs thin 160 s).' },
      { text: 'The thin rod: there is less metal to heat up', fb: 'Tempting, but a thin rod also carries less heat per second and loses more to the air for its size.' },
    ],
  },
  {
    id: 'q6', type: 'written', text: 'Q6. In one or two sentences, explain why the metal spoon FEELS colder than the wooden spoon even though they have been in the same room all night.',
    model: 'Both spoons are at the same (room) temperature. Metal is a good conductor, so it carries heat away from my warm hand much faster than wood does, and my skin senses that fast heat loss as "cold".',
  },
]

export const EXTENSION = [
  {
    id: 'x1', type: 'mcq', text: 'Olympiad extension 1. Fourier\'s law: rate of heat flow H = k·A·ΔT / L. Rod B has twice the conductivity k and twice the length L of rod A (same A and ΔT). What is H_B / H_A?',
    model: 'H ∝ k/L, so (2k)/(2L) gives the same rate: H_B / H_A = 1.',
    options: [
      { text: '1/4', fb: 'k is in the numerator and L in the denominator, so each doubling cancels the other.' },
      { text: '1/2', fb: 'Check again: doubling k doubles H, and doubling L halves it.' },
      { text: '1', correct: true, fb: 'Correct. The two effects cancel out exactly.' },
      { text: '2', fb: "You've counted the change in k but not the change in L. Length is in the denominator." },
      { text: '4', fb: 'A longer rod reduces the heat flow; it does not increase it.' },
    ],
  },
  {
    id: 'x2', type: 'numeric', text: 'Olympiad extension 2. A copper rod (k = 400) is swapped for a steel rod (k = 50) of the same shape, with the same ΔT. The steady rate of heat flow becomes × what? (decimal)',
    model: '50 / 400 = 0.125',
    check: (x) => (x >= 0.11 && x <= 0.14
      ? { correct: true, fb: 'Correct: H ∝ k, so 50/400 = 0.125.' }
      : { fb: 'H is proportional to k, with A, ΔT and L unchanged. Work out the ratio of the two k values.' }),
  },
]

// ---------- PERFORMANCE: remediation for each misconception ----------
export const REMEDIATION = {
  M1: {
    card: "Let's fix this. Same room means same temperature. Metal feels cold because it carries heat away from your hand fast. Your skin feels heat leaving, not the temperature.",
    retry: {
      id: 'retry_M1', type: 'mcq', text: 'Retry: an iron railing and a wooden bench sit outside all night at 15 °C. We touch a thermometer to each. What do they read?',
      model: 'Both read 15 °C. The iron only feels colder.',
      options: [
        { text: 'Iron reads lower', flag: 'M1', fb: 'Not quite. A thermometer does not feel heat leaving, it just reads the temperature. Both have been sitting in the same air.' },
        { text: 'Both read 15 °C', correct: true, fb: 'Yes! Same air, same temperature. The iron just feels colder.' },
        { text: 'Wood reads lower', fb: 'Both have been in the same air all night. What would a thermometer show?' },
      ],
    },
  },
  M2: {
    card: "Let's fix this. Shape matters too. Heat has to warm every slice of the rod on the way. A longer rod has more slices. A thicker rod is a wider path.",
    retry: {
      id: 'retry_M2', type: 'mcq', text: 'Retry: two copper rods, 10 cm and 30 cm, same thickness, same flame. Which far end melts its wax first?',
      model: 'The 10 cm rod. The heat has less rod to cross.',
      options: [
        { text: 'Both at the same time', flag: 'M2', fb: 'Look at your lab table again. Find two copper trials where only the length changed.' },
        { text: 'The 10 cm rod', correct: true, fb: 'Yes! Less rod to cross means a faster arrival.' },
        { text: 'The 30 cm rod', fb: 'Would the heat get there sooner if it had further to travel?' },
      ],
    },
  },
}

// ---------- PERFORMANCE: harder question after 2 correct in a row ----------
export const BONUS = {
  id: 'bonus', type: 'numeric', text: 'Olympiad bonus: a rod takes 30 s to melt the far bead at 10 cm. Same rod material and setup, but 30 cm long. About how many seconds?',
  model: 'Time ∝ L², so 3× the length gives 9× the time: about 270 s.',
  check: (x) => (x >= 220 && x <= 320
    ? { correct: true, fb: 'Brilliant. 3× the length gives 3² = 9× the time.' }
    : x < 120 ? { fb: 'Think about the doubling question. Was the time ×2 or ×4? Now apply the same rule to ×3.' }
      : { fb: 'Close idea. Time grows with length². What is 3²?' }),
}

// ---------- RUBRICS (offline feedback when the AI is unavailable) ----------
// Rubric check for the written spoon explanation.
export function checkWritten(text) {
  const t = text.toLowerCase()
  const same = /same|equal|room temp/.test(t)
  const conduct = /conduct|heat away|faster|quick|draw|pull|transfer|takes? (the )?heat|absorb/.test(t)
  if (same && conduct) return { correct: true, fb: 'Full marks on the rubric. You named both ideas: same temperature, and metal conducts heat away from your hand faster.' }
  if (!same && /metal (is|was|spoon is) colder|colder than (the )?wood/.test(t))
    return { flag: 'M1', fb: "That's M1: the metal is not actually colder; both are at room temperature. Explain what the metal does to the heat in your hand instead." }
  if (same) return { fb: "Half there. You have the same-temperature idea, but what does metal do to the heat from your hand that wood doesn't?" }
  if (conduct) return { fb: "Half there. You have the conduction idea, but what is true about the two spoons' actual temperatures?" }
  return { fb: 'Your answer needs two ideas: what the spoons\' temperatures are, and how fast each one carries heat away from your hand.' }
}

// Offline keyword checker for the lab conclusion (used when the AI is unavailable). It never states the answer.
export function checkConclusion(text) {
  const t = text.toLowerCase()
  const length = /length|long|short/.test(t), area = /thick|thin|area|cross|width/.test(t), material = /material|copper|metal|wood|steel|glass|alumin/.test(t)
  if (length && area && material) return { correct: true, fb: 'You named three variables. Which row in your table is the fair test that proves each one?' }
  if (!length && !area) return { flag: 'M2', fb: 'Your conclusion talks only about the material. Did any of your fair tests change something else? What happened then?' }
  return { fb: "Good start. Is there a variable you haven't tested on its own yet? What would a fair test of it look like?" }
}

// ---------- LAB: hint ladders for unsuccessful experiments (never state the rule) ----------
export const HINTS = {
  confounded: (n, list) => [
        `Between trial ${n - 1} and trial ${n} you changed: ${list}. The result changed, but which change caused it? Can you tell?`,
        'Choose ONE variable to test. Set the other three exactly as they were in your previous trial, then run again.',
        'Compare the two highlighted rows. Count how many columns differ. How many should differ in a fair test?',
      ],
  noResult: (n, hasRef) => [
        "The wax at the far end didn't melt in 5 minutes. Is that a failed experiment, or is it data? What does it tell you about this setup?",
        'Keep three settings the same and change just one that you think could help heat arrive sooner. Then compare the two results.',
        hasRef ? 'Compare the highlighted rows. Which setting is different, and how did the result change?'
          : 'Look at the far-end graph: is the temperature still rising at 5 min, or has it levelled off below 60 °C? What does each case suggest?',
      ],
  contradicts: (varName) => [
            `Your hypothesis says the ${varName} does not matter. Do all of your results agree with that?`,
            `Find two trials where ONLY the ${varName} was different and everything else was held constant. Those make a fair test.`,
            'Compare the highlighted rows. What does the difference in results say about your hypothesis? You can revise it any time.',
          ],
}
