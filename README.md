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
| `src/content.js` | **Edit here for live changes:** all learner text, questions, feedback, hints, rubrics, thresholds, phases and materials. |
| `src/App.jsx` | State, autosave and resume (C4), header, inquiry-phase stepper with the 10-minute clock, footer. |
| `src/store.js` | localStorage load/save, `addLog` learning log, CSV/JSON export. |
| `src/sim.js` | 1D finite-difference heat-conduction model (ground truth, no AI). |
| `src/Screens.jsx` | Welcome/Resume, Hook + diagnostic, Hypothesis, Debrief/Reflection, Learning log, About. |
| `src/Lab.jsx` | Rod apparatus, probe, stopwatch, ruler, graph, experiment design tool (lock tags, fair test, fair pairs), unsuccessful-experiment hints. |
| `src/Challenge.jsx` | Prediction-vs-result discovery table, questions, M1/M2 remediation, bonus and Fourier extension. |
| `src/Adapt.jsx` | "Why am I seeing this?" note and the diagnostic. |
| `src/ai.jsx` | Calls `/api/feedback` with a timeout; falls back to the offline rubric with a label. |
| `api/feedback.js`, `api/prompt.js` | Vercel function calling Gemini (key from env var), output checks; the prompt. |
| `report/` | Exam report (Typst source, PDF, screenshot scripts). `ui-review/` holds the UI critique. |

## Learning-log event schema (localStorage key `et617-23b2244`)
`{ time, screen, type, data }`, where `type` is one of:
`hook_answer`, `hypothesis`, `hypothesis_revised`, `trial`, `unsuccessful_experiment`, `hint_used`, `answer`, `misconception_flag`, `step_time`, `session_complete`.
