# DESIGN — Heat Conduction Inquiry Lab (ET 617 · 23B2244)

**Card:** P5 Inquiry-based virtual lab · T9 Heat conduction in different materials (Cl. 7) · L6 High-achieving Olympiad learner, bored by routine practice · C4 10-minute sessions
**Live:** https://et617-23B2244.vercel.app

## D1. Educational problem
Olympiad-track learners find the textbook rule "metals conduct, wood doesn't" trivial, so routine practice bores them.
What they don't have is quantitative reasoning about *what controls the rate* of conduction: the material's conductivity, the rod's length and cross-section, and the temperature difference.
They also mix up "feels colder" with "is colder", which they will need to unlearn before Fourier's law (rate ∝ kAΔT/L) makes sense.
This lab lets them experiment, fail productively and fix their own models in short 10-minute bursts.

**Measurable learning outcomes**
1. **Predict** how material, length and cross-section change the time for heat to reach the far end of a rod. (Measured by predict-before-run scores and the numeric question.)
2. **Design** a controlled experiment that changes one variable at a time. (Measured by confounded-trial count in the log; the target is a later trial pair with exactly one change.)
3. **Explain** why a metal spoon feels colder than a wooden one at the same room temperature. (Measured by a rubric-checked written answer.)

**Context of use:** Aditi works at home on her own laptop or phone, in 10-minute focused bursts between coaching sessions. She stops at any point and resumes later on the same device, since progress is kept in localStorage.

## D2. Learner persona
**Aditi, 13, Class 8, Pune.** She is an NSEJS/Olympiad aspirant.
- **Prior knowledge:** heat flows from hot to cold; she knows the good/bad conductor lists; she has met no formula yet.
- **Device and time:** her own laptop or phone, in 10-minute bursts.
- **Language:** English.
- **Motivation:** challenge, rankings, "why" puzzles. She is bored by repetition.

**Misconceptions**
- **M1:** "Metal objects at room temperature are actually colder than wood."
- **M2:** "Only the material matters; rod length and thickness don't change how fast heat travels."

## Design challenge: learning from an UNSUCCESSFUL experiment
The lab detects three kinds of failure:
- **(a) Confounded:** more than one variable changed since the previous trial.
- **(b) No result:** the far end never reached 60 °C within 5 simulated minutes.
- **(c) Contradicts hypothesis:** for example, she said length doesn't matter, but two trials that differ only in length show different times.

Each failure gets **graded Socratic hints** that she reveals one at a time:
- **Hint 1:** a probing question.
- **Hint 2:** what to hold constant.
- **Hint 3:** two table rows highlighted for her to compare.

No hint ever states the answer. **Revise hypothesis** is always available, and every hint used is logged.

## Content plan
1. **Hook:** the spoon puzzle with a confidence rating, which captures M1. A short chunked concept intro follows (3 cards, no formula).
2. **Hypothesis:** she picks the variables (material, length, area, source temperature) and writes a one-line prediction.
3. **Lab:** a 1D finite-difference rod simulation with wax beads that drop at 60 °C, a far-end temperature graph and a trials table.
4. **Challenge:** 6 questions (MCQ, numeric, ranking, written), followed by the Olympiad extension on Fourier's law.
5. **Summary:** findings, confidence before and after, badges.

## Screen map
Welcome/Resume → Hook → Hypothesis → Lab ⇄ (Revise hypothesis) → Challenge → Summary. The Learning log and About screens are always reachable from the nav. Every screen has the footer "ET 617 · 23B2244".

## How C4 (10-minute sessions) shaped the design
- **Six steps with a time budget:** about 1 + 2 + 1 + 4 + 2 minutes, plus the summary. A progress bar shows step indicators and the elapsed time.
- **Autosave after every action:** the current screen, the answers and all lab trials go to localStorage.
- **Resume:** "Continue where you left off" restores the exact screen and the trials table.
- **Speed:** the simulation is sped up, so each trial takes only a few seconds of real time.

## How L6 (Olympiad learner) shaped the design
- **Challenge-mode framing:** levels and badges such as "Controlled Experimenter" and "Oracle", instead of drill.
- **Quantitative tasks:** the L² scaling question and Fourier's law.
- **Predict-before-you-run mode:** unlocked after the first trial, it scores how accurate her predictions are.
- **No answer reveals:** she gets puzzles and hints instead.

## Adaptivity rules (src/Adapt.jsx, src/Challenge.jsx, src/Lab.jsx)
Every adaptation shows a "Why am I seeing this?" note and logs an `adaptation` event.

| Signal | Rule | What changes |
|---|---|---|
| **Profile** | 3-question diagnostic after the hook. 3/3 → **Olympiad track**; otherwise → **Explorer track** | Olympiad: skips the intro cards, predict mode is open from trial 1, the Fourier extension is visible straight away. Explorer: 3 chunked intro cards first. |
| **Performance** | An answer flagged M1 or M2 | Remediation card plus a similar retry question (shown once per misconception) |
| **Performance** | 2 correct in a row | Harder Olympiad bonus question (30 cm rod → ×9 time) |
| **Interaction** | 2 or more hints on one problem, OR more than 3 min in the lab | Offers a worked fair-test comparison (source temperature, which doesn't reveal length/area) |
| **Interaction** | 3 or more trials in under 60 s with no hints | "Raise the stakes": turns on predict mode with an Oracle target |

## AI feature (api/feedback.js + api/prompt.js)
- **What:** Gemini (`gemini-3.5-flash-lite`, REST `generateContent`, no SDK) evaluates the two written answers: the spoon explanation (Q6) and the lab conclusion.
- **Key:** read only from `process.env.GEMINI_API_KEY` on the server; never sent to the browser.
- **Prompt:** `api/prompt.js` gives the persona, the 3 outcomes, the M1/M2 definitions, "never reveal the answer, ask ONE Socratic question", and asks for JSON only.
- **Output:** `{verdict: correct|M1|M2|partial, feedback, socratic_question}`.
- **Check before showing:** the JSON shape is valid, the verdict is allowed, the reply is ≤ 60 words, and during the lab it is rejected if it reveals the answer (regex for "length matters", "×4", "squared"…).
- **Fallback:** on an error, a 5 s timeout or a failed check, the keyword rubric checker runs instead, labelled "Offline feedback (AI unavailable)". `?ai=off` forces the fallback for demos.
- AI output carries an "AI feedback" badge.

## Misconception discovery
At the start of the Challenge there's a table: *You predicted* vs *What actually happened*.
- Spoon answer vs thermometer readings.
- Length and thickness hypothesis vs her own fair-test results.

Mismatching rows are highlighted. The resolution appears only after she clicks "What do we notice?".
