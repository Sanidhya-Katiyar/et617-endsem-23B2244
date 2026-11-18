// Lab.jsx — the virtual rod lab: controls, animated rod with wax beads, far-end graph, trials table,
// "predict before you run" mode, and detection of UNSUCCESSFUL experiments with graded Socratic hints.
import { useEffect, useState } from 'react'
import { simulate, MATERIALS, AREAS, MELT, ROOM, MAX_TIME } from './sim.js'
import { VARIABLES } from './Screens.jsx'
import { Why } from './Adapt.jsx'
import { HINTS, THRESHOLDS, checkConclusion } from './content.js'
import { getFeedback, SourceBadge } from './ai.jsx'

const DEFAULT_SETUP = { material: 'copper', length: 20, area: 'medium', sourceT: 100 }
const VAR_NAME = Object.fromEntries(VARIABLES.map(([id, text]) => [id, text.toLowerCase()]))
const BEADS = [1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6, 1]

const fmtTime = (s) => (s === null ? 'did not reach in 5 min' : `${Math.floor(s / 60)}m ${s % 60}s`)
const tempColor = (T) => `hsl(${Math.max(0, 240 * (1 - (T - ROOM) / 125))}, 85%, 50%)`
const changedVars = (a, b) => VARIABLES.map(([id]) => id).filter((v) => a[v] !== b[v])
const differs = (a, b) => (a.reachTime === null) !== (b.reachTime === null) ||
  (a.reachTime !== null && Math.abs(a.reachTime - b.reachTime) > (THRESHOLDS.timeDiffPercent / 100) * Math.min(a.reachTime, b.reachTime))

// Looks at the trials and returns the problem with the latest one (or null). It never gives the answer.
export function findProblem(trials, hypVars) {
  const n = trials.length
  if (n === 0) return null
  const last = trials[n - 1]
  if (last.changed.length > 1) {
    const list = last.changed.map((v) => VAR_NAME[v]).join(', ')
    return {
      type: 'confounded', title: 'Confounded experiment: more than one variable changed', rows: [n - 2, n - 1],
      hints: HINTS.confounded(n, list),
    }
  }
  if (last.reachTime === null) {
    let ref = -1
    for (let i = n - 2; i >= 0; i--) if (trials[i].reachTime !== null) { ref = i; break }
    return {
      type: 'no_result', title: 'No result: the far end never reached 60 °C', rows: ref >= 0 ? [ref, n - 1] : [n - 1],
      hints: HINTS.noResult(n, ref >= 0),
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
          hints: HINTS.contradicts(VAR_NAME[v]),
        }
      }
    }
  }
  return null
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
  const struggling = hintLevel >= THRESHOLDS.hintsForWorkedExample || labSecs > THRESHOLDS.struggleSeconds
  const rushing = trials.length >= THRESHOLDS.rushTrials && labSecs < THRESHOLDS.rushSeconds && state.hintsUsed === 0 && !predict.on
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
  const [probe, setProbe] = useState(10)
  const probeT = profile[Math.round((Math.min(probe, setup.length) / setup.length) * (profile.length - 1))]
  const t = run ? run.samples[run.frame].t : 0
  const reachedAt = run ? run.samples.findIndex((x) => x.profile[x.profile.length - 1] >= MELT) : -1
  const reached = reachedAt >= 0 && run.frame >= reachedAt
  const shownT = reached ? run.samples[reachedAt].t : t
  const stopwatch = `${String(Math.floor(shownT / 60)).padStart(2, '0')}:${String(shownT % 60).padStart(2, '0')}`
  const canRun = !running && (!predict.on || predict.never || predict.seconds !== '')

  return (
    <div>
      <h2>🔥 Level 3: The Rod Lab</h2>
      <p style={{ fontSize: 14 }}>Your hypothesis: <b>{state.hypothesis.vars.map((v) => VAR_NAME[v]).join(', ') || 'none'}</b> matter. "{state.hypothesis.prediction}"
        {' '}<button className="secondary" onClick={() => go('hypothesis')}>Revise hypothesis</button></p>

      <div className="card">
        <p style={{ marginTop: 0 }}>Let's test your idea. <b>First</b>, set up the rod. <b>Second</b>, press Run. <b>Third</b>, compare rows in the table. Change <span className="key">one variable at a time</span>!</p>
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
        <div style={{ position: 'absolute', top: 0, fontSize: 18, left: `calc(30px + (100% - 40px) * ${Math.min(probe, setup.length) / 50} - 9px)` }}>🌡</div>
        {BEADS.map((f) => {
          const T = profile[Math.round(f * (profile.length - 1))]
          return <div key={f} className={'bead' + (T >= MELT ? ' fallen' : '')} style={{ left: `calc(30px + (100% - 40px) * ${(setup.length / 50) * f} - 6px)` }} />
        })}
      </div>
      {/* RULER: a tick every 5 cm, lined up with the rod */}
      <div style={{ position: 'relative', height: 22, fontSize: 11, color: '#94a3b8' }}>
        {Array.from({ length: setup.length / 5 + 1 }, (_, k) => k * 5).map((cm) => (
          <span key={cm} style={{ position: 'absolute', left: `calc(30px + (100% - 40px) * ${cm / 50})`, borderLeft: '1px solid #94a3b8', paddingLeft: 2, height: cm % 10 === 0 ? 14 : 7 }}>{cm % 10 === 0 ? cm : ''}</span>
        ))}
      </div>

      <div className="row" style={{ alignItems: 'stretch' }}>
        {/* THERMOMETER PROBE: drag the slider along the rod to read the temperature at that point */}
        <div className="tool">
          <div>🌡 <b>Thermometer probe</b>: drag along the rod</div>
          <input type="range" min="0" max={setup.length} step="1" value={Math.min(probe, setup.length)} onChange={(e) => setProbe(Number(e.target.value))} style={{ width: '100%' }} />
          <div className="reading">{Math.min(probe, setup.length)} cm → {probeT.toFixed(1)} °C</div>
        </div>
        {/* STOPWATCH: simulated time; it freezes when the far end reaches 60 °C */}
        <div className="tool">
          <div>⏱ <b>Stopwatch</b> (simulated time)</div>
          <div className="reading">{stopwatch}</div>
          <div style={{ fontSize: 12 }}>{reached ? '🟡 Far bead fell!' : run ? 'Watching the far bead…' : 'Starts when you run'}</div>
        </div>
      </div>

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
          <p style={{ fontSize: 14 }}>No result? That's still data! What is this run telling us?</p>
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
        <button disabled={trials.length < THRESHOLDS.minTrialsForChallenge} onClick={() => go('challenge')}>Level 4: Olympiad Challenge →</button>
        {trials.length < THRESHOLDS.minTrialsForChallenge && <span style={{ fontSize: 14 }}> (run at least 3 trials)</span>}
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
