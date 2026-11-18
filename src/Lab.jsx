// Lab.jsx — the virtual rod lab: controls, animated rod with wax beads, far-end graph, trials table,
// "predict before you run" mode, and detection of UNSUCCESSFUL experiments with graded Socratic hints.
import { useEffect, useState } from 'react'
import { simulate, MATERIALS, AREAS, MELT, ROOM, MAX_TIME } from './sim.js'
import { VARIABLES } from './Screens.jsx'
import { Why } from './Adapt.jsx'
import { Flame, Thermo, Clock } from './Icons.jsx'
import { HINTS, THRESHOLDS, checkConclusion, PROBLEM_LEAD } from './content.js'
import { getFeedback, SourceBadge } from './ai.jsx'

const DEFAULT_SETUP = { material: 'copper', length: 20, area: 'medium', sourceT: 100 }
const VAR_NAME = Object.fromEntries(VARIABLES.map(([id, text]) => [id, text.toLowerCase()]))
const SHORT = { material: 'Material', length: 'Length', area: 'Section', sourceT: 'Source' }
const fmtVal = (v, t) => (v === 'material' ? MATERIALS[t.material].name : v === 'area' ? AREAS[t.area].name : v === 'length' ? `${t.length} cm` : `${t.sourceT} °C`)
const BEADS = [1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6, 1]

const fmtTime = (s) => (s === null ? 'did not reach in 5 min' : `${Math.floor(s / 60)}m ${s % 60}s`)
// ONE thermal scale, used only for temperature: cool blue (25 °C) → amber (~90 °C) → hot red (150 °C)
const SCALE = [[25, [43, 108, 176]], [90, [224, 164, 0]], [150, [192, 57, 43]]]
const tempColor = (T) => {
  const t = Math.min(150, Math.max(25, T))
  const [[t0, c0], [t1, c1]] = t <= 90 ? [SCALE[0], SCALE[1]] : [SCALE[1], SCALE[2]]
  const f = (t - t0) / (t1 - t0)
  return `rgb(${c0.map((c, i) => Math.round(c + f * (c1[i] - c))).join(',')})`
}
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

  // EXPERIMENT DESIGN TOOL (van Riesen et al., 2018): choose ONE variable to test; the others are tagged "kept constant".
  const testing = state.testing || 'length'
  const prevTrial = trials[trials.length - 1]
  const locked = (v) => trials.length > 0 && v !== testing
  const lockTag = (v) => locked(v) && <span className={'lock' + (prevTrial && prevTrial[v] !== setup[v] ? ' changed' : '')}>{prevTrial && prevTrial[v] !== setup[v] ? 'changed' : 'kept constant'}</span>
  const chooseTesting = (v) => { update({ testing: v }); log('testing_variable', { variable: v }) }
  // "Run a fair test": put every variable except the tested one back to the previous trial's value
  const makeFair = () => {
    const base = trials.length >= 2 ? trials[trials.length - 2] : trials[0]
    const fair = { ...setup }
    VARIABLES.forEach(([v]) => { if (v !== testing) fair[v] = base[v] })
    update({ labSetup: fair })
    log('fair_test_reset', { testing, setup: fair })
  }
  // fair pairs: trials that differ in exactly ONE variable, grouped by that variable
  const fairPairs = []
  for (let i = 0; i < trials.length; i++) for (let j = i + 1; j < trials.length; j++) {
    const ch = changedVars(trials[i], trials[j])
    if (ch.length === 1) fairPairs.push({ v: ch[0], a: trials[i], b: trials[j] })
  }

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
    const series = result.samples.filter((_, i) => i % 5 === 0).map((s) => Math.round(s.profile[s.profile.length - 1] * 10) / 10) // far-end T every 5 s, for the graph
    const trial = { n: trials.length + 1, ...setup, reachTime: result.reachTime, changed, prediction, score, series }
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

  const gradient = `linear-gradient(to right, ${profile.map((T, i) => `${tempColor(T)} ${((i / (profile.length - 1)) * 100).toFixed(1)}%`).join(', ')})`
  const probeAt = Math.min(probe, setup.length)
  const pos = (cm) => `calc(36px + (100% - 48px) * ${cm / 50})` // x position of a point on the rod (drawn to scale: 50 cm = full width)

  return (
    <div>
      <div className="label">Phase 3 · Investigation</div>
      <h1>The rod lab</h1>
      <p className="lede">Change one variable, run, and compare the rows.</p>
      <p className="hyp">Hypothesis: <b>{state.hypothesis.vars.map((v) => VAR_NAME[v]).join(', ') || 'none'}</b> matter{state.hypothesis.prediction && <> · “{state.hypothesis.prediction}”</>}
        <button className="secondary small" onClick={() => go('hypothesis')}>Revise hypothesis</button></p>

      <div className="lab-grid">
        <section className="stage" aria-label="Rod apparatus">
          <div className="rod-wrap">
            <div className="flame" title={`Heat source ${setup.sourceT} °C`}><Flame width={26} height={26} /><span className="mono">{setup.sourceT}°</span></div>
            <div className="rod" style={{ width: `calc((100% - 48px) * ${setup.length / 50})`, height: { thin: 10, medium: 18, thick: 28 }[setup.area], background: gradient }} />
            {BEADS.map((f) => {
              const T = profile[Math.round(f * (profile.length - 1))]
              return <div key={f} className={'bead' + (T >= MELT ? ' fallen' : '')} style={{ left: `calc(${pos(setup.length * f)} - 6px)` }} />
            })}
            <div className="probe-tag mono" style={{ left: pos(probeAt) }}>{probeT.toFixed(1)} °C</div>
          </div>
          {/* RULER: a tick every 5 cm, lined up with the rod */}
          <div className="ruler mono">
            {Array.from({ length: setup.length / 5 + 1 }, (_, k) => k * 5).map((cm) => (
              <span key={cm} className={cm % 10 === 0 ? 'major' : ''} style={{ left: pos(cm) }}>{cm % 10 === 0 ? cm : ''}</span>
            ))}
          </div>
          {/* THERMOMETER PROBE: drag along the rod to read the temperature at that point */}
          <div className="probe-ctl" style={{ width: `calc((100% - 48px) * ${setup.length / 50} + 12px)` }}>
            <input type="range" min="0" max={setup.length} step="1" value={probeAt} aria-label="Thermometer probe position (cm)" onChange={(e) => setProbe(Number(e.target.value))} />
          </div>
          <div className="readouts">
            <div className="readout"><span className="label"><Thermo /> Probe</span><span className="reading mono">{probeAt} cm · {probeT.toFixed(1)} °C</span></div>
            <div className="readout"><span className="label"><Clock /> Stopwatch</span><span className="reading mono">{stopwatch}</span>
              <span className="small-note">{reached ? 'Far bead dropped' : run ? 'Watching the far bead' : 'Starts on Run'}</span></div>
            <div className="readout"><span className="label">Far end</span><span className="reading mono">{profile[profile.length - 1].toFixed(1)} °C</span></div>
          </div>
        </section>

        <aside className="panel" aria-label="Controls">
          <div className="ctl">
            <div className="label">What am I testing?</div>
            <div className="seg seg-4">
              {VARIABLES.map(([v]) => (
                <button key={v} className={testing === v ? 'on' : ''} aria-pressed={testing === v} onClick={() => chooseTesting(v)}>{SHORT[v]}</button>
              ))}
            </div>
          </div>
          <div className="ctl">
            <div className="ctl-head"><span className="label">Material · k in W/m·K</span>{lockTag('material')}</div>
            <div className="swatches">
              {Object.entries(MATERIALS).map(([id, m]) => (
                <button key={id} className={'swatch ' + id + (setup.material === id ? ' on' : '')} aria-pressed={setup.material === id} onClick={() => setVar('material', id)}>
                  <span className="chip" /><span>{m.name}</span><span className="mono">{m.k}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="ctl">
            <div className="ctl-head"><span className="label">Cross-section</span>{lockTag('area')}</div>
            <div className="seg">
              {Object.entries(AREAS).map(([id, a]) => (
                <button key={id} className={setup.area === id ? 'on' : ''} aria-pressed={setup.area === id} onClick={() => setVar('area', id)}>{a.name}</button>
              ))}
            </div>
          </div>
          <Slider label="Length" unit="cm" min={10} max={50} step={10} value={setup.length} onChange={(v) => setVar('length', v)} tag={lockTag('length')} />
          <Slider label="Source temperature" unit="°C" min={60} max={150} step={10} value={setup.sourceT} onChange={(v) => setVar('sourceT', v)} tag={lockTag('sourceT')} />

          {(trials.length >= 1 || state.track === 'olympiad') && (
            <div className="ctl predict">
              <label><input type="checkbox" checked={predict.on} onChange={(e) => setPredict({ ...predict, on: e.target.checked })} /> Predict before you run (scored)</label>
              {predict.on && (
                <div className="row">
                  <input type="number" min="1" placeholder="seconds" value={predict.seconds} disabled={predict.never}
                    onChange={(e) => setPredict({ ...predict, seconds: e.target.value })} style={{ width: 96 }} />
                  <label><input type="checkbox" checked={predict.never} onChange={(e) => setPredict({ ...predict, never: e.target.checked })} /> won't reach</label>
                </div>
              )}
            </div>
          )}
          <button className="run" disabled={!canRun} onClick={runTrial}>{running ? 'Running…' : 'Run trial'}</button>
        </aside>
      </div>

      <section className="notebook">
        <div className="label">Notebook · far-end temperature vs time</div>
        <svg viewBox="0 0 320 170" className="graph" role="img" aria-label="Far-end temperature against time for each trial">
          {[0, 60, 120, 180, 240, 300].map((s) => <g key={s}><line x1={gx(s)} x2={gx(s)} y1="10" y2="130" className="gridline" /><text x={gx(s)} y="142" className="tick" textAnchor="middle">{s}</text></g>)}
          {[ROOM, MELT, yMax].map((T) => <text key={T} x="26" y={gy(T) + 3} className="tick" textAnchor="end">{T}</text>)}
          <line x1="30" y1="130" x2="290" y2="130" className="axis" />
          <line x1="30" y1="10" x2="30" y2="130" className="axis" />
          <line x1="30" x2="290" y1={gy(MELT)} y2={gy(MELT)} className="melt" />
          <text x="288" y={gy(MELT) - 3} className="tick" textAnchor="end">wax melts 60 °C</text>
          <text x="160" y="158" className="tick" textAnchor="middle">time (s)</text>
          <text x="6" y="8" className="tick">°C</text>
          {trials.slice(-4).map((tr) => tr.series && (
            <polyline key={tr.n} fill="none" className="past" points={tr.series.map((T, i) => `${gx(i * 5)},${gy(Math.min(T, yMax))}`).join(' ')} />
          ))}
          {trials.slice(-4).map((tr) => tr.series && (
            <text key={'l' + tr.n} className="tick" x={gx((tr.series.length - 1) * 5) + 3} y={gy(Math.min(tr.series[tr.series.length - 1], yMax)) + 3}>T{tr.n}</text>
          ))}
          <polyline fill="none" className="live" points={shown.map((s) => `${gx(s.t)},${gy(Math.min(s.profile[s.profile.length - 1], yMax))}`).join(' ')} />
        </svg>
      </section>

      {problem && !running && (
        <div className="note">
          <b>{problem.title}</b>
          <p>{PROBLEM_LEAD[problem.type]}</p>
          {/* EXPERTISE REVERSAL (Kalyuga): Explorer sees hint 1 straight away; Olympiad hints are faded (hidden until asked) */}
          <Why>{state.track === 'olympiad'
            ? 'You are on the Olympiad track, so hints stay hidden until you ask. Experts learn more with less guidance.'
            : 'You are on the Explorer track, so the first hint is shown straight away.'}</Why>
          {problem.hints.slice(0, Math.max(hintLevel, state.track === 'olympiad' ? 0 : 1)).map((h, i) => <div key={i} className="hint">Hint {i + 1}: {h}</div>)}
          <div className="row">
            {hintLevel < 3 && <button className="secondary" onClick={showHint}>{state.track === 'olympiad' ? (hintLevel === 0 ? 'Need a nudge?' : `Another nudge (${hintLevel + 1} of 3)`) : `Next hint (${Math.max(hintLevel, 1) + 1} of 3)`}</button>}
            {problem.type === 'confounded' && <button onClick={makeFair}>Run a fair test</button>}
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
        <div className="note">
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
      {fairPairs.length > 0 && (
        <div className="fair">
          <div className="label">Fair pairs · only one variable changed</div>
          {VARIABLES.map(([v, text]) => {
            const ps = fairPairs.filter((p) => p.v === v)
            if (!ps.length) return null
            return (
              <div key={v} className="fair-group">
                <b>{text}</b>
                {ps.map((p, k) => <div key={k} className="mono">T{p.a.n} {fmtVal(v, p.a)} → {fmtTime(p.a.reachTime)}   vs   T{p.b.n} {fmtVal(v, p.b)} → {fmtTime(p.b.reachTime)}</div>)}
              </div>
            )
          })}
        </div>
      )}
      {trials.length >= 2 && <Conclusion state={state} update={update} log={log} />}
      <p>
        <button disabled={trials.length < THRESHOLDS.minTrialsForChallenge} onClick={() => go('challenge')}>Next phase: Conclusion →</button>
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

// An instrument-style slider: label, value in mono with unit, tick marks, and min/max labels.
function Slider({ label, unit, min, max, step, value, onChange, tag }) {
  const id = 'ticks-' + label.replace(/\W/g, '')
  const ticks = []
  for (let v = min; v <= max; v += step) ticks.push(v)
  return (
    <div className="ctl">
      <div className="ctl-head"><span className="label">{label} {tag}</span><span className="mono val">{value} {unit}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} list={id} aria-label={label} onChange={(e) => onChange(Number(e.target.value))} />
      <datalist id={id}>{ticks.map((v) => <option key={v} value={v} />)}</datalist>
      <div className="scale mono"><span>{min}</span><span>{max} {unit}</span></div>
    </div>
  )
}
