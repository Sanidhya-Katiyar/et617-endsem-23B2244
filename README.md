# Heat Conduction Inquiry Lab · ET 617 · 23B2244

**Live:** https://et617-23b2244.vercel.app
**Card:** P5 Inquiry-based virtual lab · T9 Heat conduction in different materials (Cl. 7) · L6 Olympiad learner · C4 10-minute sessions

The design (problem, outcomes, persona, screen map, C4/L6 rationale) is in [DESIGN.md](DESIGN.md).

## Run locally
```
npm install
npm run dev
```

## Files
| File | What it does |
|---|---|
| `src/App.jsx` | Holds the state, autosaves it to localStorage, and renders the nav, the 10-minute progress bar, the current screen and the footer. |
| `src/store.js` | Load/save state (resume), `addLog` for the learning log, and CSV/JSON export. |
| `src/sim.js` | Material data and a 1D finite-difference heat-conduction simulation with side heat loss. |
| `src/Screens.jsx` | Welcome/Resume, Hook puzzle, Hypothesis, Summary, Learning log, About. |
| `src/Lab.jsx` | The rod lab: controls, wax beads, far-end graph, trials table, predict mode, unsuccessful-experiment detection and graded hints. |
| `src/Challenge.jsx` | 6 questions (MCQ, numeric, ranking, written rubric) with M1/M2 feedback, plus a Fourier's-law extension. |

## Learning-log event schema (localStorage key `et617-23b2244`)
`{ time, screen, type, data }`, where `type` is one of:
`hook_answer`, `hypothesis`, `hypothesis_revised`, `trial`, `unsuccessful_experiment`, `hint_used`, `answer`, `misconception_flag`, `step_time`, `session_complete`.
