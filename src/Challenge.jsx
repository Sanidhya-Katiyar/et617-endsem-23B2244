// Challenge.jsx — Level 4: interpret results. Six questions in four formats (MCQ, numeric, ranking, written)
// with feedback written for the correct answer and for misconceptions M1 and M2, then an Olympiad extension.
import { useState } from 'react'
import { REMEDIATION, BONUS, Why } from './Adapt.jsx'
import { getFeedback, SourceBadge } from './ai.jsx'

const QUESTIONS = [
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

const EXTENSION = [
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

// Rubric check for the written spoon explanation.
function checkWritten(text) {
  const t = text.toLowerCase()
  const same = /same|equal|room temp/.test(t)
  const conduct = /conduct|heat away|faster|quick|draw|pull|transfer|takes? (the )?heat|absorb/.test(t)
  if (same && conduct) return { correct: true, fb: 'Full marks on the rubric. You said ✓ same temperature and ✓ metal conducts heat away from your hand faster.' }
  if (!same && /metal (is|was|spoon is) colder|colder than (the )?wood/.test(t))
    return { flag: 'M1', fb: "That's M1: the metal is not actually colder; both are at room temperature. Explain what the metal does to the heat in your hand instead." }
  if (same) return { fb: "Half there. You have ✓ same temperature, but what does metal do to the heat from your hand that wood doesn't?" }
  if (conduct) return { fb: "Half there. You have ✓ conduction, but what is true about the two spoons' actual temperatures?" }
  return { fb: 'Your answer needs two ideas: what the spoons\' temperatures are, and how fast each one carries heat away from your hand.' }
}

function Question({ q, answer, onAnswer }) {
  const [value, setValue] = useState(q.type === 'rank' ? q.start : '')
  const [busy, setBusy] = useState(false)
  const submitWritten = async () => {
    setBusy(true)
    const result = await getFeedback('spoon', value, {}, checkWritten)
    setBusy(false)
    onAnswer(q, value, result)
  }
  const done = answer !== undefined

  const move = (i, d) => {
    const next = [...value]
    ;[next[i], next[i + d]] = [next[i + d], next[i]]
    setValue(next)
  }
  const submitRank = () => {
    const right = value.filter((m, i) => m === q.answer[i]).length
    onAnswer(q, value, right === 5
      ? { correct: true, fb: "Perfect order. Notice that aluminium has a lower density, so in the lab it's almost as fast as copper." }
      : { fb: `${right}/5 in the right place. The k values are listed in the lab's material menu, or you can race the materials in the lab under identical conditions.` })
  }

  return (
    <div className="card">
      <p>{q.text}</p>
      {q.type === 'mcq' && (
        <div className="row">
          {q.options.map((o, i) => (
            <button key={i} className={done && answer.value === o.text ? '' : 'secondary'} disabled={done}
              onClick={() => onAnswer(q, o.text, { correct: !!o.correct, flag: o.flag, fb: o.fb })}>{o.text}</button>
          ))}
        </div>
      )}
      {q.type === 'numeric' && (
        <div className="row">
          <input type="number" step="any" value={done ? answer.value : value} disabled={done} onChange={(e) => setValue(e.target.value)} style={{ width: 120 }} />
          <button disabled={done || value === ''} onClick={() => onAnswer(q, Number(value), q.check(Number(value)))}>Check</button>
        </div>
      )}
      {q.type === 'rank' && (
        <div>
          {(done ? answer.value : value).map((m, i) => (
            <div key={m} className="row" style={{ margin: 4 }}>
              <b style={{ width: 24 }}>{i + 1}.</b><span style={{ width: 100, textTransform: 'capitalize' }}>{m}</span>
              {!done && <><button className="secondary" disabled={i === 0} onClick={() => move(i, -1)}>▲</button>
                <button className="secondary" disabled={i === 4} onClick={() => move(i, 1)}>▼</button></>}
            </div>
          ))}
          {!done && <button onClick={submitRank}>Check order</button>}
        </div>
      )}
      {q.type === 'written' && (
        <div>
          <textarea rows="3" value={done ? answer.value : value} disabled={done} onChange={(e) => setValue(e.target.value)} />
          <button disabled={busy || done || value.trim().length < 10} onClick={submitWritten}>{busy ? 'Checking…' : 'Submit explanation'}</button>
        </div>
      )}
      {done && (
        <>
          <p className={answer.correct ? 'good' : answer.flag ? 'bad' : 'warn'}>
            <SourceBadge result={answer} />{answer.correct ? '✓ ' : answer.flag ? `✗ (${answer.flag}) ` : '△ '}{answer.fb}
          </p>
          <p style={{ fontSize: 14 }}><b>Model answer:</b> {q.model}</p>
        </>
      )}
    </div>
  )
}

export function Challenge({ state, update, log, go }) {
  const answers = state.challenge
  const streak = state.streak || 0
  const onAnswer = (q, value, result) => {
    const newStreak = result.correct ? streak + 1 : 0
    update({ challenge: { ...answers, [q.id]: { value, ...result } }, streak: newStreak, bonus: state.bonus || newStreak >= 2 })
    log('answer', { question: q.id, value, correct: !!result.correct, source: result.source })
    if (result.flag) {
      log('misconception_flag', { id: result.flag, question: q.id })
      log('adaptation', { rule: 'performance_remediation', misconception: result.flag })
    }
    if (newStreak >= 2 && !state.bonus) log('adaptation', { rule: 'performance_harder', streak: newStreak })
  }
  const allDone = QUESTIONS.every((q) => answers[q.id])
  const score = QUESTIONS.filter((q) => answers[q.id]?.correct).length

  // after each question: remediation card + retry if it showed M1/M2 (only the first time for each misconception)
  const firstFlagged = {}
  QUESTIONS.forEach((q) => { const f = answers[q.id]?.flag; if (f && !firstFlagged[f]) firstFlagged[f] = q.id })
  const afterQuestion = (q) => {
    const flag = answers[q.id]?.flag
    if (!flag || firstFlagged[flag] !== q.id) return null
    const r = REMEDIATION[flag]
    return (
      <div className="remedy">
        <Why>Your answer showed misconception <b>{flag}</b>, so here's a short fix and a similar question to try.</Why>
        <p>{r.card}</p>
        <Question q={r.retry} answer={answers[r.retry.id]} onAnswer={onAnswer} />
      </div>
    )
  }

  return (
    <div>
      <h2>🏆 Level 4: Olympiad Challenge</h2>
      <p>Use your lab results. Score: {score}/{QUESTIONS.length}. Want to check something? <button className="secondary" onClick={() => go('lab')}>Back to lab</button></p>
      {QUESTIONS.map((q) => (
        <div key={q.id}>
          <Question q={q} answer={answers[q.id]} onAnswer={onAnswer} />
          {afterQuestion(q)}
        </div>
      ))}
      {state.bonus && (
        <div className="remedy">
          <Why>You got 2 right in a row, so here's a harder Olympiad question.</Why>
          <Question q={BONUS} answer={answers.bonus} onAnswer={onAnswer} />
        </div>
      )}
      {(allDone || state.track === 'olympiad') && (
        <>
          <h3>⚡ Olympiad extension: Fourier's law (for fast finishers)</h3>
          {EXTENSION.map((q) => <Question key={q.id} q={q} answer={answers[q.id]} onAnswer={onAnswer} />)}
          <button onClick={() => go('summary')}>Level 5: Debrief and badges →</button>
        </>
      )}
    </div>
  )
}
