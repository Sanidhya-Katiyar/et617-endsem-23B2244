// Screens.jsx — the smaller screens: Welcome/Resume, Hook, Hypothesis, Summary, Learning log, About.
import { freshState, logToCsv, downloadFile } from './store.js'

const STEP_NAMES = { welcome: 'Welcome', hook: 'Hook puzzle', hypothesis: 'Hypothesis', lab: 'Lab', challenge: 'Challenge', summary: 'Summary' }

// Placeholders for screens built in later commits.
export const Hook = () => <p>Coming next…</p>
export const Hypothesis = Hook
export const Lab = Hook
export const Challenge = Hook
export const Summary = Hook

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
