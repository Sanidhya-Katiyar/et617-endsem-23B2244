// Screens.jsx — the smaller screens: Welcome/Resume, Hook, Hypothesis, Summary, Learning log, About.
import { freshState, logToCsv, downloadFile } from './store.js'

const STEP_NAMES = { welcome: 'Welcome', hook: 'Hook puzzle', hypothesis: 'Hypothesis', lab: 'Lab', challenge: 'Challenge', summary: 'Summary' }

// Placeholders for screens built in later commits.
const Soon = () => <p>Coming next…</p>

export const Challenge = Soon
export const Summary = Soon

// Concept intro, in small chunks shown one at a time (cognitive load). No formula yet.
const INTRO = [
  '1/3 · Heat always flows from hotter to colder, until both are at the same temperature. After a night on the table, both spoons have reached room temperature.',
  '2/3 · Materials pass heat along at very different rates. A metal passes energy from particle to particle quickly; wood passes it slowly. This "conduction rate" is what you will investigate.',
  '3/3 · Your skin does not sense temperature. It senses how fast heat leaves your hand. Something that pulls heat away fast feels cold. Can the shape of an object change how fast heat moves too? Find out in the lab.',
]

export function Hook({ state, update, log, go }) {
  const { answer, confidence, introStep } = state.hook
  const setHook = (patch) => update({ hook: { ...state.hook, ...patch } })

  const submit = (choice) => {
    setHook({ answer: choice })
    log('hook_answer', { answer: choice, confidence })
    if (choice === 'metal') log('misconception_flag', { id: 'M1', note: 'thinks metal at room temp is colder' })
  }

  return (
    <div>
      <h2>🧩 Level 1: The Spoon Puzzle</h2>
      <div className="card">
        <p>A metal spoon and a wooden spoon have both been on the table all night. Which is <b>colder</b>?</p>
        <label>How confident are you? {confidence}/5
          <input type="range" min="1" max="5" value={confidence} disabled={answer !== null}
            onChange={(e) => setHook({ confidence: Number(e.target.value) })} />
        </label>
        <div className="row">
          {[['metal', 'The metal spoon'], ['wood', 'The wooden spoon'], ['same', 'Both are the same temperature']].map(([id, text]) => (
            <button key={id} className={answer === id ? '' : 'secondary'} disabled={answer !== null} onClick={() => submit(id)}>{text}</button>
          ))}
        </div>
      </div>

      {answer !== null && (
        <>
          <p>Answer locked in. Don't worry about whether you're right yet: you'll test it in the lab and revisit it in the challenge.</p>
          <div className="card">{INTRO[introStep]}</div>
          {introStep < INTRO.length - 1
            ? <button onClick={() => setHook({ introStep: introStep + 1 })}>Next</button>
            : <button onClick={() => go('hypothesis')}>Level 2: Make a hypothesis →</button>}
        </>
      )}
    </div>
  )
}

export function Welcome({ state, go, setState }) {
  const hasProgress = state.hook.answer !== null || state.trials.length > 0
  const resumeTo = state.lastStep || 'hook'
  const start = () => setState((s) => ({ ...freshState(s.log), screen: 'hook', lastStep: 'hook' }))

  return (
    <div>
      <h1>Challenge Mode: Heat Conduction Lab</h1>
      <p>Not a drill. You get five levels, one 10-minute session, and puzzles that a textbook list won't solve.</p>
      <div className="card">
        <div>🧩 Level 1: The Spoon Puzzle</div>
        <div>🧪 Level 2: Your Hypothesis</div>
        <div>🔥 Level 3: The Rod Lab (find what controls the speed of heat)</div>
        <div>🏆 Level 4: Olympiad Challenge</div>
        <div>⭐ Level 5: Debrief and badges</div>
      </div>
      <p>Earn badges like <span className="badge">Controlled Experimenter</span><span className="badge">Oracle</span><span className="badge">Olympian</span></p>
      {hasProgress ? (
        <div className="row">
          <button onClick={() => go(resumeTo)}>▶ Continue where you left off ({STEP_NAMES[resumeTo]}, {state.trials.length} trials)</button>
          <button className="secondary" onClick={start}>Start fresh</button>
        </div>
      ) : (
        <button onClick={start}>Start challenge</button>
      )}
      <p className="warn" style={{ fontSize: 14 }}>Everything autosaves. Stop any time and resume here.</p>
    </div>
  )
}

export function LearningLog({ state }) {
  const json = () => downloadFile('learning-log-23B2244.json', JSON.stringify(state.log, null, 2), 'application/json')
  const csv = () => downloadFile('learning-log-23B2244.csv', logToCsv(state.log), 'text/csv')
  return (
    <div>
      <h2>Learning log ({state.log.length} events)</h2>
      <p>Answers, hypotheses, trials, variables changed, hints, time per step and misconception flags, saved on this device.</p>
      <div className="row"><button onClick={csv}>Export CSV</button><button onClick={json}>Export JSON</button></div>
      <div style={{ overflowX: 'auto', marginTop: 10 }}>
        <table>
          <thead><tr><th>Time</th><th>Screen</th><th>Event</th><th>Data</th></tr></thead>
          <tbody>
            {[...state.log].reverse().map((e, i) => (
              <tr key={i}>
                <td>{e.time.slice(11, 19)}</td><td>{e.screen}</td>
                <td className={e.type === 'misconception_flag' ? 'bad' : e.type === 'hint_used' ? 'warn' : ''}>{e.type}</td>
                <td style={{ fontSize: 12 }}>{JSON.stringify(e.data)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function About({ state, go }) {
  return (
    <div>
      <h2>About</h2>
      <div className="card">
        <p><b>Roll no:</b> 23B2244</p>
        <p><b>Card:</b> P5 Inquiry-based virtual lab · T9 Heat conduction in different materials (Cl. 7) · L6 High-achieving Olympiad learner, bored by routine practice · C4 10-minute sessions</p>
        <p><b>Design challenge:</b> learning from an <i>unsuccessful</i> experiment without revealing the answer. The lab detects confounded trials, runs where heat never reaches the end, and results that contradict your hypothesis. It then gives graded Socratic hints (question → what to hold constant → rows to compare), never the answer.</p>
        <p><b>Persona:</b> Aditi, 13, Class 8, NSEJS aspirant, Pune.</p>
      </div>
      <button onClick={() => go(state.lastStep || 'welcome')}>Back</button>
    </div>
  )
}

export const VARIABLES = [
  ['material', 'Material of the rod'],
  ['length', 'Length of the rod'],
  ['area', 'Cross-section (thickness)'],
  ['sourceT', 'Temperature of the heat source'],
]

// Hypothesis: which variables change the time for heat to reach the far end? Also used for "Revise hypothesis".
export function Hypothesis({ state, update, log, go }) {
  const h = state.hypothesis
  const toggle = (v) => update({ hypothesis: { ...h, vars: h.vars.includes(v) ? h.vars.filter((x) => x !== v) : [...h.vars, v] } })

  const save = () => {
    const revising = h.saved
    update({ hypothesis: { ...h, saved: true, revisions: h.revisions + (revising ? 1 : 0) } })
    log(revising ? 'hypothesis_revised' : 'hypothesis', { vars: h.vars, prediction: h.prediction })
    if (!h.vars.includes('length') || !h.vars.includes('area'))
      log('misconception_flag', { id: 'M2', note: 'thinks length/thickness do not affect conduction time', vars: h.vars })
    go('lab')
  }

  return (
    <div>
      <h2>🧪 Level 2: {h.saved ? 'Revise your hypothesis' : 'Your hypothesis'}</h2>
      <div className="card">
        <p>A rod is heated at one end. Wax beads stuck along it melt and drop when the rod reaches 60 °C there.
          <b> Which variables change how long heat takes to reach the far end?</b> Tick all you think matter.</p>
        {VARIABLES.map(([id, text]) => (
          <label key={id}><input type="checkbox" checked={h.vars.includes(id)} onChange={() => toggle(id)} /> {text}</label>
        ))}
        <label>One-line prediction:
          <input type="text" style={{ width: '100%' }} value={h.prediction} placeholder="e.g. Copper will be fastest; length won't matter"
            onChange={(e) => update({ hypothesis: { ...h, prediction: e.target.value } })} />
        </label>
      </div>
      <button disabled={h.vars.length === 0 || !h.prediction.trim()} onClick={save}>
        {h.saved ? 'Save revision and return to lab' : 'Level 3: Enter the lab →'}
      </button>
    </div>
  )
}
