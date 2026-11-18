// Lab.jsx — the virtual rod lab: controls, animated rod with wax beads, far-end graph, trials table,
// "predict before you run" mode, and detection of UNSUCCESSFUL experiments with graded Socratic hints.
import { useEffect, useState } from 'react'
import { simulate, MATERIALS, AREAS, MELT, ROOM, MAX_TIME } from './sim.js'
import { VARIABLES } from './Screens.jsx'
import { Why } from './Adapt.jsx'
import { getFeedback, SourceBadge } from './ai.jsx'

const DEFAULT_SETUP = { material: 'copper', length: 20, area: 'medium', sourceT: 100 }
const VAR_NAME = Object.fromEntries(VARIABLES.map(([id, text]) => [id, text.toLowerCase()]))
const BEADS = [1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6, 1]

const fmtTime = (s) => (s === null ? 'did not reach in 5 min' : `${Math.floor(s / 60)}m ${s % 60}s`)
const tempColor = (T) => `hsl(${Math.max(0, 240 * (1 - (T - ROOM) / 125))}, 85%, 50%)`
const changedVars = (a, b) => VARIABLES.map(([id]) => id).filter((v) => a[v] !== b[v])
const differs = (a, b) => (a.reachTime === null) !== (b.reachTime === null) ||
  (a.reachTime !== null && Math.abs(a.reachTime - b.reachTime) > 0.15 * Math.min(a.reachTime, b.reachTime))

// Looks at the trials and returns the problem with the latest one (or null). It never gives the answer.
export function findProblem(trials, hypVars) {
  const n = trials.length
  if (n === 0) return null
  const last = trials[n - 1]
  if (last.changed.length > 1) {
    const list = last.changed.map((v) => VAR_NAME[v]).join(', ')
    return {
      type: 'confounded', title: 'Confounded experiment: more than one variable changed', rows: [n - 2, n - 1],
      hints: [
        `Between trial ${n - 1} and trial ${n} you changed: ${list}. The result changed, but which change caused it? Can you tell?`,
        'Choose ONE variable to test. Set the other three exactly as they were in your previous trial, then run again.',
        'Compare the two highlighted rows. Count how many columns differ. How many should differ in a fair test?',
      ],
    }
  }
  if (last.reachTime === null) {
    let ref = -1
    for (let i = n - 2; i >= 0; i--) if (trials[i].reachTime !== null) { ref = i; break }
    return {
      type: 'no_result', title: 'No result: the far end never reached 60 °C', rows: ref >= 0 ? [ref, n - 1] : [n - 1],
      hints: [
        "The wax at the far end didn't melt in 5 minutes. Is that a failed experiment, or is it data? What does it tell you about this setup?",
        'Keep three settings the same and change just one that you think could help heat arrive sooner. Then compare the two results.',
        ref >= 0 ? 'Compare the highlighted rows. Which setting is different, and how did the result change?'
          : 'Look at the far-end graph: is the temperature still rising at 5 min, or has it levelled off below 60 °C? What does each case suggest?',
      ],
    }
  }
  // (c) results contradict the hypothesis: a variable she said doesn't matter clearly changed the time
  for (const [v] of VARIABLES) {
    if (hypVars.includes(v)) continue
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const ch = changedVars(trials[i], trials[j])
      if (ch.length === 1 && ch[0] === v && differs(trials[i], trials[j])) {
        return {
          type: 'contradicts_hypothesis', title: 'Your results and your hypothesis disagree', rows: [i, j],
          hints: [
            `Your hypothesis says the ${VAR_NAME[v]} does not matter. Do all of your results agree with that?`,
            `Find two trials where ONLY the ${VAR_NAME[v]} was different and everything else was held constant. Those make a fair test.`,
            'Compare the highlighted rows. What does the difference in results say about your hypothesis? You can revise it any time.',
          ],
        }
      }
    }
  }
  return null
}

// Offline keyword checker for the lab conclusion (used when the AI is unavailable). It never states the answer.
function checkConclusion(text) {
  const t = text.toLowerCase()
  const length = /length|long|short/.test(t), area = /thick|thin|area|cross|width/.test(t), material = /material|copper|metal|wood|steel|glass|alumin/.test(t)
  if (length && area && material) return { correct: true, fb: 'You named three variables. Which row in your table is the fair test that proves each one?' }
  if (!length && !area) return { flag: 'M2', fb: 'Your conclusion talks only about the material. Did any of your fair tests change something else? What happened then?' }
  return { fb: "Good start. Is there a variable you haven't tested on its own yet? What would a fair test of it look like?" }
}

export function Lab({ state, update, log, go, setState }) {
  const setup = state.labSetup || DEFAULT_SETUP
  const trials = state.trials
  const [run, setRun] = useState(null)        // { samples, frame } for the animation
  const [predict, setPredict] = useState({ on: false, seconds: '', never: false })

  // play the precomputed simulation over about 4 seconds
  useEffect(() => {
    if (!run || run.frame >= run.samples.length - 1) return
    const id = setTimeout(() => setRun((r) => ({ ...r, frame: Math.min(r.frame + 4, r.samples.length - 1) })), 50)
    return () => clearTimeout(id)
  }, [run])

  const setVar = (key, value) => update({ labSetup: { ...setup, [key]: value } })

  const runTrial = () => {
    const result = simulate(setup)
    const prev = trials[trials.length - 1]
    const changed = prev ? changedVars(prev, setup) : []
    let prediction = null, score = null
    if (predict.on) {
      prediction = predict.never ? 'never' : Number(predict.seconds)
      if (result.reachTime === null) score = predict.never ? 100 : 0
      else score = predict.never ? 0 : Math.max(0, Math.round(100 - (Math.abs(prediction - result.reachTime) / result.reachTime) * 100))
    }
    const trial = { n: trials.length + 1, ...setup, reachTime: result.reachTime, changed, prediction, score }
    const newTrials = [...trials, trial]
    const problem = findProblem(newTrials, state.hypothesis.vars)
    setState((s) => ({ ...s, trials: newTrials, hint: { trial: trial.n, level: 0 } }))
    log('trial', { ...trial, variablesChanged: changed.length })
    if (problem) log('unsuccessful_experiment', { trial: trial.n, type: problem.type })
    setRun({ samples: result.samples, frame: 0 })
  }

  const problem = findProblem(trials, state.hypothesis.vars)
  const hintLevel = state.hint && state.hint.trial === trials.length ? state.hint.level : 0
  const showHint = () => {
    update({ hint: { trial: trials.length, level: hintLevel + 1 }, hintsUsed: state.hintsUsed + 1 })
    log('hint_used', { trial: trials.length, problem: problem.type, level: hintLevel + 1 })
  }
  const highlighted = problem && hintLevel >= 3 ? problem.rows : []

  // INTERACTION adaptivity: struggling (2+ hints, or 3+ min in the lab) → offer a worked comparison;
  // rushing (3+ trials in under 60 s with no hints) → raise the challenge.
  const labSecs = Math.round((Date.now() - state.stepStart) / 1000)
  const struggling = hintLevel >= 2 || labSecs > 180
  const rushing = trials.length >= 3 && labSecs < 60 && state.hintsUsed === 0 && !predict.on
  const [showWorked, setShowWorked] = useState(false)
  const openWorked = () => { setShowWorked(true); log('adaptation', { rule: 'interaction_worked_comparison', hintLevel, labSecs }) }
  const raiseChallenge = () => { setPredict({ ...predict, on: true }); log('adaptation', { rule: 'interaction_raise_challenge', trials: trials.length, labSecs }) }

  // what to draw on the rod: the current animation frame, or a cold rod
  const profile = run ? run.samples[run.frame].profile : Array(30).fill(ROOM)
  const shown = run ? run.samples.slice(0, run.frame + 1) : []
  const rodWidth = `calc((100% - 40px) * ${setup.length / 50})`
  const yMax = Math.max(100, setup.sourceT)
  const gx = (t) => 30 + (t / MAX_TIME) * 260
  const gy = (T) => 130 - ((T - ROOM) / (yMax - ROOM)) * 120
  const running = run && run.frame < run.samples.length - 1
  const canRun = !running && (!predict.on || predict.never || predict.seconds !== '')

  return (
    <div>
      <h2>🔥 Level 3: The Rod Lab</h2>
      <p style={{ fontSize: 14 }}>Your hypothesis: <b>{state.hypothesis.vars.map((v) => VAR_NAME[v]).join(', ') || 'none'}</b> matter. "{state.hypothesis.prediction}"
        {' '}<button className="secondary" onClick={() => go('hypothesis')}>Revise hypothesis</button></p>

      <div className="card">
        <div className="row">
          <label>Material <select value={setup.material} onChange={(e) => setVar('material', e.target.value)}>
            {Object.entries(MATERIALS).map(([id, m]) => <option key={id} value={id}>{m.name} (k = {m.k})</option>)}
          </select></label>
          <label>Cross-section <select value={setup.area} onChange={(e) => setVar('area', e.target.value)}>
            {Object.entries(AREAS).map(([id, a]) => <option key={id} value={id}>{a.name}</option>)}
          </select></label>
        </div>
        <div className="row">
          <label>Length: {setup.length} cm <input type="range" min="10" max="50" step="10" value={setup.length} onChange={(e) => setVar('length', Number(e.target.value))} /></label>
          <label>Source: {setup.sourceT} °C <input type="range" min="60" max="150" step="10" value={setup.sourceT} onChange={(e) => setVar('sourceT', Number(e.target.value))} /></label>
        </div>

        {(trials.length >= 1 || state.track === 'olympiad') && (
          <div className="card" style={{ borderColor: '#7c3aed' }}>
            <label><input type="checkbox" checked={predict.on} onChange={(e) => setPredict({ ...predict, on: e.target.checked })} /> 🏅 Olympiad mode: <b>predict before you run</b> (scored on accuracy)</label>
            {predict.on && (
              <div className="row">
                <input type="number" min="1" placeholder="seconds" value={predict.seconds} disabled={predict.never}
                  onChange={(e) => setPredict({ ...predict, seconds: e.target.value })} style={{ width: 100 }} />
                <label><input type="checkbox" checked={predict.never} onChange={(e) => setPredict({ ...predict, never: e.target.checked })} /> won't reach in 5 min</label>
              </div>
            )}
          </div>
        )}
        <button disabled={!canRun} onClick={runTrial}>{running ? 'Running…' : '▶ Run trial'}</button>
      </div>

      <div className="rod-wrap">
        <div className="flame">🔥</div>
        <div className="rod" style={{ width: rodWidth, height: { thin: 10, medium: 18, thick: 28 }[setup.area] }}>
          {profile.map((T, i) => <div key={i} style={{ flex: 1, background: tempColor(T) }} />)}
        </div>
        {BEADS.map((f) => {
          const T = profile[Math.round(f * (profile.length - 1))]
          return <div key={f} className={'bead' + (T >= MELT ? ' fallen' : '')} style={{ left: `calc(30px + (100% - 40px) * ${(setup.length / 50) * f} - 6px)` }} />
        })}
      </div>
      {run && <p style={{ fontSize: 14 }}>t = {run.samples[run.frame].t} s · far end = {profile[profile.length - 1].toFixed(1)} °C</p>}

      <svg viewBox="0 0 300 150" style={{ width: '100%', maxWidth: 480, background: '#1e293b', borderRadius: 8 }}>
        <text x="4" y="12" fill="#94a3b8" fontSize="9">Far-end temperature (°C) vs time (s)</text>
        <line x1="30" y1="130" x2="290" y2="130" stroke="#64748b" />
        <line x1="30" y1="10" x2="30" y2="130" stroke="#64748b" />
        <line x1="30" x2="290" y1={gy(MELT)} y2={gy(MELT)} stroke="#facc15" strokeDasharray="4 3" />
        <text x="2" y={gy(MELT) + 3} fill="#facc15" fontSize="8">60°</text>
        <text x="2" y="133" fill="#94a3b8" fontSize="8">{ROOM}°</text>
        <text x="270" y="142" fill="#94a3b8" fontSize="8">300 s</text>
        <polyline fill="none" stroke="#f97316" strokeWidth="2"
          points={shown.map((s) => `${gx(s.t)},${gy(s.profile[s.profile.length - 1])}`).join(' ')} />
      </svg>

      {problem && !running && (
        <div className="card" style={{ borderColor: '#facc15' }}>
          <b className="warn">⚠ {problem.title}</b>
          <p style={{ fontSize: 14 }}>Unsuccessful experiments are useful too. Work out what this one is telling you.</p>
          {problem.hints.slice(0, hintLevel).map((h, i) => <div key={i} className="hint">Hint {i + 1}: {h}</div>)}
          <div className="row">
            {hintLevel < 3 && <button className="secondary" onClick={showHint}>Need a hint ({hintLevel + 1}/3)</button>}
            <button className="secondary" onClick={() => go('hypothesis')}>Revise hypothesis</button>
          </div>
        </div>
      )}

      {struggling && !running && (
        <div className="card">
          <Why>{hintLevel >= 2 ? 'You used 2 hints' : "You've spent over 3 minutes here"}, so here's a worked example of a <b>fair test</b> to copy.</Why>
          {!showWorked ? <button className="secondary" onClick={openWorked}>Show me a worked comparison</button> : (
            <div>
              <p>Let's look at a fair test of <b>source temperature</b>:</p>
              <p>First, copper · 20 cm · medium · <span className="key">100 °C</span> → 133 s<br />
                Second, copper · 20 cm · medium · <span className="key">150 °C</span> → 83 s</p>
              <p>Third, notice that <b>only one thing changed</b>, so it must have caused the difference. Now do the same for the variable <i>you</i> want to test.</p>
            </div>
          )}
        </div>
      )}
      {rushing && (
        <div className="card" style={{ borderColor: '#7c3aed' }}>
          <Why>You ran 3 trials in under a minute with no hints. Too easy? Let's raise the stakes.</Why>
          <p>Challenge: <b>predict</b> the next result within 20% to earn the Oracle badge.</p>
          <button onClick={raiseChallenge}>Accept challenge</button>
        </div>
      )}

      <h3>Results</h3>
      {/* conclusion box is rendered below the table */}
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead><tr><th>#</th><th>Material</th><th>Length</th><th>Section</th><th>Source</th><th>Time for far end to reach 60 °C</th><th>Prediction</th></tr></thead>
          <tbody>
            {trials.map((t, i) => (
              <tr key={i} className={highlighted.includes(i) ? 'highlight' : ''}>
                <td>{t.n}</td><td>{MATERIALS[t.material].name}</td><td>{t.length} cm</td><td>{AREAS[t.area].name}</td><td>{t.sourceT} °C</td>
                <td className={t.reachTime === null ? 'bad' : ''}>{fmtTime(t.reachTime)}</td>
                <td>{t.prediction === null ? '-' : `${t.prediction === 'never' ? "won't reach" : t.prediction + ' s'} → ${t.score}/100`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {trials.length >= 2 && <Conclusion state={state} update={update} log={log} />}
      <p>
        <button disabled={trials.length < 3} onClick={() => go('challenge')}>Level 4: Olympiad Challenge →</button>
        {trials.length < 3 && <span style={{ fontSize: 14 }}> (run at least 3 trials)</span>}
      </p>
    </div>
  )
}

// The learner writes a conclusion from the lab; AI (or the offline checker) replies with ONE Socratic question.
function Conclusion({ state, update, log }) {
  const c = state.conclusion || { text: '', result: null }
  const [busy, setBusy] = useState(false)
  const check = async () => {
    setBusy(true)
    const trials = state.trials.map((t) => `${t.material} ${t.length}cm ${t.area} ${t.sourceT}C -> ${t.reachTime ?? 'never'}`).join('; ')
    const result = await getFeedback('lab', c.text, { hypothesis: state.hypothesis.vars, trials }, checkConclusion)
    setBusy(false)
    update({ conclusion: { ...c, result } })
    log('conclusion', { text: c.text, source: result.source, correct: !!result.correct, flag: result.flag, reason: result.reason })
    if (result.flag) log('misconception_flag', { id: result.flag, where: 'lab conclusion' })
  }
  return (
    <div className="card">
      <b>What do we notice? Write your conclusion.</b>
      <p style={{ fontSize: 14 }}>Which variables change the time? Use your table as evidence.</p>
      <textarea rows="2" value={c.text} onChange={(e) => update({ conclusion: { ...c, text: e.target.value } })} />
      <button disabled={busy || c.text.trim().length < 10} onClick={check}>{busy ? 'Checking…' : 'Check my conclusion'}</button>
      {c.result && <p className={c.result.correct ? 'good' : c.result.flag ? 'bad' : 'warn'}><SourceBadge result={c.result} />{c.result.fb}</p>}
    </div>
  )
}
