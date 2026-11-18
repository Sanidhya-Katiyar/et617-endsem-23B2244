// App.jsx — holds the app state, autosaves it, and shows the nav, progress bar, current screen and footer.
import { useEffect, useState } from 'react'
import { loadState, saveState, addLog, STEPS } from './store.js'
import * as S from './Screens.jsx'
import { Lab } from './Lab.jsx'
import { Challenge } from './Challenge.jsx'

const SCREENS = {
  welcome: S.Welcome, hook: S.Hook, hypothesis: S.Hypothesis, lab: Lab,
  challenge: Challenge, summary: S.Summary, log: S.LearningLog, about: S.About,
}

export default function App() {
  const [state, setState] = useState(loadState)
  const [, setTick] = useState(0)

  useEffect(() => saveState(state), [state])   // C4: autosave after every action
  useEffect(() => {                            // re-render every second for the timer
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const update = (patch) => setState((s) => ({ ...s, ...patch }))
  const log = (type, data) => setState((s) => addLog(s, type, data))
  const go = (screen) => setState((s) => {
    const secs = Math.round((Date.now() - s.stepStart) / 1000)
    const logged = addLog(s, 'step_time', { step: s.screen, seconds: secs })
    // lastStep = the learning step to resume to (Log/About/Home are not steps)
    const lastStep = STEPS.includes(screen) && screen !== 'welcome' ? screen : s.lastStep
    return { ...logged, screen, lastStep, stepStart: Date.now(), elapsedBefore: s.elapsedBefore + secs }
  })

  const elapsed = state.elapsedBefore + Math.round((Date.now() - state.stepStart) / 1000)
  const mmss = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`
  const stepIndex = STEPS.indexOf(state.screen)
  const Screen = SCREENS[state.screen] || S.Welcome

  return (
    <div className="app">
      <nav>
        <strong style={{ alignSelf: 'center', marginRight: 'auto' }}>🔥 Heat Conduction Lab</strong>
        <button onClick={() => go('welcome')}>Home</button>
        <button onClick={() => go('log')}>Learning log</button>
        <button onClick={() => go('about')}>About</button>
      </nav>
      <div className="progress" title="10-minute session">
        {STEPS.map((step, i) => (
          <div key={step} className={'step ' + (i < stepIndex ? 'done' : i === stepIndex ? 'current' : '')} title={step} />
        ))}
        <span style={{ marginLeft: 8 }} className={elapsed > 600 ? 'warn' : ''}>⏱ {mmss(elapsed)} / 10:00</span>
      </div>
      <main>
        <Screen state={state} update={update} log={log} go={go} setState={setState} />
      </main>
      <footer>ET 617 · 23B2244</footer>
    </div>
  )
}
