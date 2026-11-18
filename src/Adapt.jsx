// Adapt.jsx — everything ADAPTIVE lives here:
//   PROFILE:     a 3-question diagnostic picks the Explorer or the Olympiad track
//   PERFORMANCE: an M1/M2 answer gets a remediation card + retry question; 2 correct in a row unlocks a harder question
//   INTERACTION: (used in Lab.jsx) 2+ hints or a long time → worked comparison; rushing with no hints → harder challenge
import { useState } from 'react'
import { DIAGNOSTIC, THRESHOLDS } from './content.js'

// The small "Why am I seeing this?" note shown whenever the app adapts.
export function Why({ children }) {
  return <div className="why"><b>Why am I seeing this?</b> {children}</div>
}

// Rule: 3/3 correct → Olympiad track (skips the basic intro, gets number tasks). Otherwise → Explorer track.
export function Diagnostic({ onDone }) {
  const [answers, setAnswers] = useState([])
  const i = answers.length
  const pick = (opt) => {
    const next = [...answers, opt]
    setAnswers(next)
    if (next.length === DIAGNOSTIC.length) {
      const score = next.filter((a, k) => a === DIAGNOSTIC[k].answer).length
      onDone(score >= THRESHOLDS.diagnosticOlympiadScore ? 'olympiad' : 'explorer', score, next)
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

