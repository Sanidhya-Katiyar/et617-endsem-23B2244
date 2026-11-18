// store.js — saves the whole app state in localStorage (C4: stop and resume) and keeps the learning log.
const KEY = 'et617-23b2244'

export const STEPS = ['welcome', 'hook', 'hypothesis', 'lab', 'challenge', 'summary']

export function freshState(oldLog = []) {
  return {
    screen: 'welcome',
    stepStart: Date.now(),   // when the current screen was opened
    elapsedBefore: 0,        // seconds spent on earlier screens (active time only)
    hook: { answer: null, confidence: 3, introStep: 0 },
    hypothesis: { vars: [], prediction: '', saved: false, revisions: 0 },
    trials: [],
    hintsUsed: 0,
    challenge: {},
    confAfter: 3,
    log: oldLog,
  }
}

export function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    // reset the step timer on load so time away from the app is not counted
    if (saved) return { ...freshState(), ...saved, stepStart: Date.now() }
  } catch { /* ignore broken storage */ }
  return freshState()
}

export function saveState(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* storage full or blocked */ }
}

// Returns a new state with one event added to the learning log.
export function addLog(state, type, data = {}) {
  const event = { time: new Date().toISOString(), screen: state.screen, type, data }
  return { ...state, log: [...state.log, event] }
}

// Lets the learner download the log as a file (CSV or JSON).
export function downloadFile(name, text, mime) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export function logToCsv(log) {
  const esc = (v) => '"' + String(v).replaceAll('"', '""') + '"'
  const rows = log.map((e) => [e.time, e.screen, e.type, JSON.stringify(e.data)].map(esc).join(','))
  return ['time,screen,type,data', ...rows].join('\n')
}
