# REPORT NOTES (draft) · ET 617 · 23B2244

## Identity card
| Field | Value |
|---|---|
| Roll no | 23B2244 |
| P | P5 Inquiry-based virtual laboratory |
| T | T9 Heat conduction in different materials (Cl. 7) |
| L | L6 High-achieving learner preparing for an Olympiad, bored by routine practice |
| C | C4 10-minute sessions |
| App | https://et617-23b2244.vercel.app |
| Repo | https://github.com/Sanidhya-Katiyar/et617-endsem-23B2244 |

## D1 Educational problem
Olympiad-track learners find the textbook rule "metals conduct, wood doesn't" trivial, so routine practice bores them. What they don't have is quantitative reasoning about *what controls the rate* of conduction: conductivity, length, cross-section and temperature difference. They also confuse "feels colder" with "is colder", which blocks Fourier's law (H = kAΔT/L). This lab lets them experiment, fail productively and fix their own models in 10-minute bursts.

**Outcomes**
1. **Predict** how material, length and cross-section change the time for heat to reach the far end of a rod.
2. **Design** a controlled experiment that changes one variable at a time.
3. **Explain** why a metal spoon feels colder than a wooden one at the same room temperature.

**Context of use:** at home, on her own laptop or phone, in 10-minute focused bursts between coaching classes. She can stop and resume on the same device, since everything is stored in localStorage.

## D2 Persona
**Aditi, 13, Class 8, Pune.** She is an NSEJS/Olympiad aspirant.
- **Prior knowledge:** heat flows from hot to cold; she knows the good/bad conductor lists; she has met no formula yet.
- **Device and time:** her own laptop or phone, in 10-minute bursts.
- **Language:** English.
- **Motivation:** challenge, rankings, "why" puzzles. She is bored by repetition.

**Misconceptions**
- **M1:** "Metal objects at room temperature are actually colder than wood."
- **M2:** "Only the material matters; rod length and thickness don't change how fast heat travels."

## D3 Educational content
**Concept explanation.** The Explorer track sees 3 chunked cards:
1. Heat flows from hot to cold until both are at the same temperature, so both spoons end up at room temperature.
2. Materials pass heat along at different rates; metal is fast and wood is slow.
3. Skin senses how fast heat *leaves* it, not temperature. Can shape matter too?

The lab then lets her discover the effects of length, area and ΔT. The Olympiad extension introduces H = kAΔT/L.

**Questions (6 core + 2 retry + 1 bonus + 2 extension; formats: MCQ, numeric, ranking, written)**

| # | Format | Question | Model answer | Correct feedback | M1 / M2 feedback |
|---|---|---|---|---|---|
| Q1 | MCQ | Metal and wooden spoon on the table all night: which is colder? | Same temperature; the metal feels colder because it conducts heat away faster | "Right. Both are at room temperature, and the difference you feel is the rate of heat flow out of your hand." | M1 ("metal"): "Overnight, both spoons reach room temperature… Metal only *feels* colder because it pulls heat out of your skin faster." |
| Q2 | MCQ | A copper rod 10 cm takes 31 s. How long at 20 cm? | About 125 s (×4) | "Yes, about ×4. The time grows with length² (the lab gives 31 s → 133 s)." | M2 ("same, 31 s"): "Length does matter. Heat has to warm every extra slice… test 10 vs 20 cm in the lab." Linear answer (62 s): "Longer is slower, but it isn't proportional." |
| Q3 | Numeric | Double the length: the time becomes ×? | About 4 (accept 3.5–4.5) | "Twice the length gives about 4× the time, because diffusion time scales with L²." | M2 (≤1.3): "Length changes the time a lot. Compare two trials that differ only in length." |
| Q4 | Ranking | Order the materials fastest → slowest | Cu > Al > steel > glass > wood | "Perfect order… aluminium is almost as fast because of its low density." | Partial: "x/5 in the right place. Race them in the lab under identical conditions." |
| Q5 | MCQ | Thick vs thin copper rod, 20 cm: which reaches 60 °C first? | Thick (more area, a smaller share of heat lost) | "More cross-section carries more heat per second (lab: 127 s vs 160 s)." | M2 ("same time"): "Thickness matters too. A thicker rod is like a wider pipe for heat." |
| Q6 | Written (AI + rubric) | Explain why the metal spoon *feels* colder | "Both are the same room temperature. Metal conducts heat away from my hand faster, which I feel as cold." | AI or rubric: "same temperature + conducts heat away faster" | M1 ("metal is colder"): "The metal is not actually colder… explain what it does to the heat in your hand." |
| Retry M1 | MCQ | Iron railing vs wooden bench outdoors at 15 °C: what does a thermometer read? | Both 15 °C | "Same air, same temperature. The iron just feels colder." | "A thermometer does not feel heat leaving…" |
| Retry M2 | MCQ | Copper rods of 10 cm vs 30 cm: which melts first? | 10 cm | "Less rod to cross means a faster arrival." | "Find two copper trials where only the length changed." |
| Bonus | Numeric | 10 cm → 30 s. 30 cm → ? | About 270 s (×9) | "3× the length gives 3² = 9× the time." | Hint toward the L² rule |
| X1 | MCQ | Double k and double L: H_B/H_A? | 1 | "The two effects cancel out exactly." | Option-specific hints |
| X2 | Numeric | Cu (k = 400) → steel (k = 50): rate ×? | 0.125 | "H ∝ k, so 50/400 = 0.125." | "Work out the ratio of the two k values." |

## D4 Working application
**URL:** https://et617-23b2244.vercel.app. The footer "ET 617 · 23B2244" appears on every screen, and an About screen gives the roll number and card.

**Screen map:** Welcome/Resume → Hook (spoon puzzle + confidence) → Diagnostic (3 questions → track) → [Explorer: 3 intro cards] → Hypothesis → **Lab** ⇄ Revise hypothesis → Challenge (discovery table + questions + remediation + bonus + extension) → Summary (badges, confidence before/after) · Learning log · About.

**C4, visibly:**
- a 6-step progress bar with ⏱ elapsed / 10:00;
- autosave after every action;
- "Continue where you left off (screen, N trials)" restores the exact screen and the trials table;
- the whole sequence takes about 8–10 min.

## D5 Click paths (for screenshots)
**Correct learner**
1. Click **Start challenge**, then **Both are the same temperature**.
2. Diagnostic: **Copper**, **The 1 m rod**, **A bigger temperature difference**. This puts her on the Olympiad track, with a Why-note.
3. Click **Level 2**. Tick all 4 variables, type a prediction, then click **Enter the lab**.
4. Lab:
   - Run copper 20 cm (133 s).
   - Change only the length to 10 cm and run (31 s).
   - Tick predict mode, enter 160, change only the section to Thin, and run. This scores well and earns Oracle.
5. Write the conclusion "Material, length and thickness all change the time" and click **Check my conclusion**. AI feedback appears.
6. Click **Level 4**. The discovery table shows no mismatch.
7. Answer Q1 Same, then Q2 About 125 s. That's 2 correct in a row, so the bonus question appears.
8. Q3 enter 4; Q4 put the order right; Q5 Thick; Q6 write the model answer; then X1 = 1 and X2 = 0.125.
9. Click **Level 5**. The badges show.

**M1/M2 learner**
1. Click **The metal spoon** (M1 flag). Diagnostic: Glass, Both at once, A longer rod. This puts her on the Explorer track and shows the intro cards.
2. Tick only **Material** (M2 flag), with the prediction "Only material matters".
3. Lab: run copper 20 cm, then length 10 cm, then length 20 cm.
   - This raises the "results and hypothesis disagree" warning.
   - Write the conclusion "Only the material matters"; the AI/offline feedback flags M2.
4. Challenge discovery: the Spoons and Length rows are highlighted. Click **What do we notice?** to see the resolution.
5. Q1 The metal spoon: M1 feedback, a remediation card and the retry question. Click **Both read 15 °C**.
6. Q2 About 31 s: M2 feedback, a remediation card and the retry question.

**Unsuccessful experiment (design challenge)**
1. Run copper 20 cm.
2. **Confounded:** change Aluminium and 10 cm, then run. You get "Confounded experiment". Click **Need a hint** three times: question, then what to hold constant, then two rows highlighted. After the 2nd hint a worked comparison is also offered.
3. **No result:** change to Wood and run. You get "did not reach in 5 min", with its hint ladder.
4. **Contradicts hypothesis:** click **Revise hypothesis** at any point.

## D6 AI specification
- **Model and API:** `gemini-3.5-flash-lite` through the REST `v1beta/models/…:generateContent` endpoint, called from the Vercel function `api/feedback.js`. The key comes from `process.env.GEMINI_API_KEY`.
- **Prompt:** `api/prompt.js` holds the system prompt (persona, outcomes, M1/M2 definitions, "never reveal the answer, ask ONE Socratic question, ≤ 50 words, JSON only") plus a user message with the task, her hypothesis and trials, and her answer.
- **Real input/output (live test):**
  - Spoon input: "Metal is colder than wood because metal is a cold material"
    → `{"verdict":"M1","feedback":"You know metal is a good conductor!","socratic_question":"If both sat on the exact same table all night, could the metal actually be at a lower temperature than the wood?"}`
  - Lab input: "Only the material matters, copper is fastest" (trials: copper 10 cm → 31 s; copper 20 cm → 133 s)
    → `{"verdict":"M2","feedback":"Great job spotting that copper is the fastest!","socratic_question":"Look closely at your trial data for copper at 10cm versus 20cm—did the time stay the same?"}`
- **Check (`checkReply`):** the reply is an object with a verdict in {correct, M1, M2, partial}, string fields, and feedback + question ≤ 60 words. For the lab conclusion it is rejected if it matches the reveal regex (length/thickness "matters/slower", "×4", "squared", "L²").
- **Fallback (`src/ai.jsx`):** on a non-200 response, a 5 s timeout or a failed check, the keyword rubric (`checkWritten` / `checkConclusion`) runs instead. It is shown with a red "Offline feedback (AI unavailable)" badge; the reason is in its tooltip and in the log. Use `?ai=off` to demo it.
- **Observed reliability:** Gemini latency varied, roughly half of calls under 2 s and the rest over 4.5 s. The fallback kept feedback instant and labelled.

## D7 Design challenge and constraints
**Unsuccessful experiment, without revealing the answer**
- **Three detectors:**
  - confounded (more than 1 variable changed);
  - no result (far end below 60 °C at 5 min);
  - contradiction (a variable she said doesn't matter changed the result in a fair test).
- **Graded Socratic ladder:** a probing question, then what to hold constant, then two rows highlighted. No hint states the rule.
- **Support around the ladder:**
  - Revise hypothesis is always available;
  - a worked comparison of a *different* variable (source temperature) is offered after 2 hints;
  - AI feedback on the conclusion is checked against a reveal filter;
  - the discovery table lets her spot her own mismatch before any resolution.

**C4 (10-minute sessions):**
- a time budget per level with a visible 10:00 progress bar;
- the simulation is sped up (about 4 s per trial);
- autosave plus exact resume, including trials;
- short chunks and only 3 trials required.

**L6 (Olympiad learner):**
- challenge framing with levels and badges;
- a diagnostic that lets strong learners skip the basics;
- predict-before-run scoring;
- quantitative questions (L², Fourier);
- a bonus question after a streak, and "raise the stakes" when she's rushing;
- puzzles instead of drill.

## D8 Evaluation
| Outcome | Assessment items | Log data | Success criterion |
|---|---|---|---|
| O1 Predict | Q2, Q3, Bonus, predict-mode scores | `answer`, `trial.score` | Q3 within 3.5–4.5 and at least one prediction score ≥ 80 |
| O2 Design | Trials table, confounded detector | `trial.variablesChanged`, `unsuccessful_experiment`, `hint_used` | At least one fair-test pair; the last 2 trials have exactly 1 change |
| O3 Explain | Q1, Q6 (AI/rubric), M1 retry | `answer`, `misconception_flag`, `conclusion` | Q6 verdict correct, with no M1 flag after remediation |

**Also logged:**
- `step_time` (C4: total ≤ 600 s);
- `diagnostic` and `adaptation` (which rule fired);
- `hook_answer` and the confidence before/after in `session_complete`;
- `hypothesis` and `hypothesis_revised`.

The log can be exported as CSV or JSON from the Learning log screen.

## Libraries, templates and tools used
- **Template:** Vite `create-vite` React (JavaScript) template.
- **Runtime libraries:** React 19, React DOM. No UI kit; the chart is inline SVG.
- **Dev tools:** Vite 8, `@vitejs/plugin-react`, oxlint.
- **AI:** Google Gemini API (`gemini-3.5-flash-lite`) via REST `fetch`, with no SDK.
- **Hosting:** Vercel (static site + serverless function). Code is on GitHub.
- **AI assistance:** Claude Code (Claude Opus 5.5) wrote the code from my specifications; I reviewed and tested it.
