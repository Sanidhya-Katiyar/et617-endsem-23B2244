// Challenge.jsx — Level 4: interpret results. Six questions in four formats (MCQ, numeric, ranking, written)
// with feedback written for the correct answer and for misconceptions M1 and M2, then an Olympiad extension.
import { useState } from 'react'
import { Why } from './Adapt.jsx'
import { QUESTIONS, EXTENSION, REMEDIATION, BONUS, checkWritten, THRESHOLDS } from './content.js'
import { getFeedback, SourceBadge } from './ai.jsx'

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
              {!done && <><button className="secondary small" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">Up</button>
                <button className="secondary small" disabled={i === 4} onClick={() => move(i, 1)} aria-label="Move down">Down</button></>}
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
            <SourceBadge result={answer} /><span className="verdict">{answer.correct ? 'Correct' : answer.flag ? `${answer.flag} pattern` : 'Not yet'}</span>{answer.fb}
          </p>
          <p style={{ fontSize: 14 }}><b>Model answer:</b> {q.model}</p>
        </>
      )}
    </div>
  )
}

// MISCONCEPTION DISCOVERY: her prediction next to the actual result, so she spots the mismatch herself FIRST.
// The resolution only appears after she clicks "What do we notice?".
function Discovery({ state, update, log }) {
  const { trials, hook, hypothesis } = state
  const names = { length: 'Length', area: 'Thickness' }
  const said = { metal: 'The metal spoon is colder', wood: 'The wooden spoon is colder', same: 'Both are the same temperature' }
  const evidence = (v) => {
    for (let i = 0; i < trials.length; i++) for (let j = i + 1; j < trials.length; j++) {
      const diff = ['material', 'length', 'area', 'sourceT'].filter((k) => trials[i][k] !== trials[j][k])
      if (diff.length === 1 && diff[0] === v) {
        const t = (x) => (x.reachTime === null ? 'never' : x.reachTime + ' s')
        return `${trials[i][v]} → ${t(trials[i])}, ${trials[j][v]} → ${t(trials[j])}`
      }
    }
    return null
  }
  const m1 = hook.answer === 'metal'
  const m2vars = ['length', 'area'].filter((v) => !hypothesis.vars.includes(v))
  const reveal = () => { update({ discovered: true }); log('discovery', { m1, m2vars }) }

  return (
    <div className="card" >
      <div className="label">Prediction vs result</div>
      <table>
        <thead><tr><th></th><th>You predicted</th><th>What actually happened</th></tr></thead>
        <tbody>
          <tr className={m1 ? 'highlight' : ''}><td>Spoons</td><td>{said[hook.answer] || '-'}</td><td>Thermometer: metal <b>25 °C</b>, wood <b>25 °C</b></td></tr>
          {['length', 'area'].map((v) => (
            <tr key={v} className={m2vars.includes(v) && evidence(v) ? 'highlight' : ''}>
              <td>{names[v]}</td><td>{hypothesis.vars.includes(v) ? 'Matters' : "Doesn't matter"}</td>
              <td>{evidence(v) ? <>Your fair test: <b>{evidence(v)}</b></> : <i>No fair test yet. Try one in the lab!</i>}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!state.discovered ? <p><b>Compare the two columns.</b> Do they match? <button onClick={reveal}>What do we notice?</button></p> : (
        <div>
          {m1 && <p className="remedy"><span className="key">Spoons:</span> you predicted the metal is colder, but the thermometer reads the same. The metal only <b>feels</b> colder because it pulls heat from your hand faster.</p>}
          {m2vars.map((v) => evidence(v) && <p key={v} className="remedy"><span className="key">{names[v]}:</span> you said it doesn't matter, but your own fair test changed the time. Shape matters, not just material.</p>)}
          {!m1 && m2vars.every((v) => !evidence(v)) && <p className="good">Your predictions match your evidence. Nice work, scientist!</p>}
        </div>
      )}
    </div>
  )
}

export function Challenge({ state, update, log, go }) {
  const answers = state.challenge
  const streak = state.streak || 0
  const onAnswer = (q, value, result) => {
    const newStreak = result.correct ? streak + 1 : 0
    update({ challenge: { ...answers, [q.id]: { value, ...result } }, streak: newStreak, bonus: state.bonus || newStreak >= THRESHOLDS.streakForHarder })
    log('answer', { question: q.id, value, correct: !!result.correct, source: result.source })
    if (result.flag) {
      log('misconception_flag', { id: result.flag, question: q.id })
      log('adaptation', { rule: 'performance_remediation', misconception: result.flag })
    }
    if (newStreak >= THRESHOLDS.streakForHarder && !state.bonus) log('adaptation', { rule: 'performance_harder', streak: newStreak })
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
      <div className="label">Phase 4 · Conclusion</div>
      <h1>Olympiad challenge</h1>
      <p>Let's put your lab results to work. Think like an Olympiad examiner. Score: {score}/{QUESTIONS.length}. Want to check something? <button className="secondary" onClick={() => go('lab')}>Back to lab</button></p>
      <Discovery state={state} update={update} log={log} />
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
          <h3>Olympiad extension: Fourier's law (for fast finishers)</h3>
          {EXTENSION.map((q) => <Question key={q.id} q={q} answer={answers[q.id]} onAnswer={onAnswer} />)}
          <button onClick={() => go('summary')}>Next phase: Discussion →</button>
        </>
      )}
    </div>
  )
}
