// Adapt.jsx — everything ADAPTIVE lives here:
//   PROFILE:     a 3-question diagnostic picks the Explorer or the Olympiad track
//   PERFORMANCE: an M1/M2 answer gets a remediation card + retry question; 2 correct in a row unlocks a harder question
//   INTERACTION: (used in Lab.jsx) 2+ hints or a long time → worked comparison; rushing with no hints → harder challenge
import { useState } from 'react'

// The small "Why am I seeing this?" note shown whenever the app adapts.
export function Why({ children }) {
  return <div className="why">🤖 <b>Why am I seeing this?</b> {children}</div>
}

// ---------- PROFILE: diagnostic ----------
const DIAGNOSTIC = [
  { q: 'First: which one passes heat along fastest?', options: ['Copper', 'Glass', 'Wood'], answer: 'Copper' },
  { q: 'Second: we heat one end of a 1 m rod and a 2 m rod of the same metal. Which far end warms first?', options: ['The 1 m rod', 'Both at once', 'The 2 m rod'], answer: 'The 1 m rod' },
  { q: 'Third: what makes heat flow through a rod faster?', options: ['A bigger temperature difference', 'A longer rod', 'Nothing, only the material'], answer: 'A bigger temperature difference' },
]

// Rule: 3/3 correct → Olympiad track (skips the basic intro, gets number tasks). Otherwise → Explorer track.
export function Diagnostic({ onDone }) {
  const [answers, setAnswers] = useState([])
  const i = answers.length
  const pick = (opt) => {
    const next = [...answers, opt]
    setAnswers(next)
    if (next.length === DIAGNOSTIC.length) {
      const score = next.filter((a, k) => a === DIAGNOSTIC[k].answer).length
      onDone(score === 3 ? 'olympiad' : 'explorer', score, next)
    }
  }
  if (i >= DIAGNOSTIC.length) return null
  return (
    <div className="card">
      <h3>Quick warm-up ({i + 1}/3)</h3>
      <p>Let's see where you stand, so we can pick your track.</p>
      <p><b>{DIAGNOSTIC[i].q}</b></p>
      <div className="row">{DIAGNOSTIC[i].options.map((o) => <button key={o} className="secondary" onClick={() => pick(o)}>{o}</button>)}</div>
    </div>
  )
}

// ---------- PERFORMANCE: remediation for each misconception ----------
export const REMEDIATION = {
  M1: {
    card: <>Let's fix this. <span className="key">Same room → same temperature.</span> Metal feels cold because it <b>carries heat away from your hand fast</b>. Your skin feels heat <i>leaving</i>, not the temperature.</>,
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
    card: <>Let's fix this. <span className="key">Shape matters too.</span> Heat has to warm every slice of the rod on the way. A <b>longer</b> rod has more slices. A <b>thicker</b> rod is a wider path.</>,
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
