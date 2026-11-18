// ET 617 End-Semester report, 23B2244. Compile from the repo root:
//   typst compile --root . report/report.typ report/ET617_23B2244_Report.pdf
#set document(title: "Heat Conduction Inquiry Lab: ET 617 End-Semester Report", author: "23B2244")
#set page(
  paper: "a4", margin: 2.5cm,
  header: context { if counter(page).get().first() > 1 [ #set text(8.5pt); #smallcaps[ET 617 End-Sem · 23B2244] #h(1fr) #smallcaps[Heat Conduction Inquiry Lab] #v(-6pt) #line(length: 100%, stroke: 0.4pt) ] },
  footer: context [ #set text(8.5pt); #h(1fr) #counter(page).display("1") #h(1fr) ],
)
#set text(font: "New Computer Modern", size: 11pt, lang: "en")
#set par(justify: true, leading: 0.62em, spacing: 0.9em)
#set heading(numbering: "1.1")
#show heading.where(level: 1): it => block(above: 1.4em, below: 0.8em, breakable: false)[#set text(13pt, weight: "bold"); #it]
#show heading.where(level: 2): it => block(above: 1.1em, below: 0.6em, breakable: false)[#set text(11pt, weight: "bold"); #it]
#show figure.caption: set text(9.5pt)
#show raw: set text(font: "DejaVu Sans Mono", size: 8pt)
#show link: set text(fill: rgb("#1a3d7c"))
#set table(stroke: none, inset: (x: 5pt, y: 4pt))
#show table: set text(9.5pt)
#show table: set par(justify: false)
// booktabs-style table helper: top rule, header rule, bottom rule
#let btable(cols, header, ..rows) = table(
  columns: cols, align: left,
  table.hline(stroke: 0.8pt), ..header.map(h => [*#h*]), table.hline(stroke: 0.5pt),
  ..rows, table.hline(stroke: 0.8pt),
)
#let shot(path, w: 100%) = image("img/" + path, width: w)

// ---------------- title block ----------------
#align(center)[
  #v(0.5cm)
  #text(20pt, weight: "bold")[Heat Conduction Inquiry Lab]
  #v(0.15cm)
  #text(12pt)[A virtual laboratory for learning from unsuccessful experiments]
  #v(0.4cm)
  #text(11pt)[ET 617 End-Semester Examination Report]
  #v(0.2cm)
  Roll no. *23B2244* · 18 November 2026 \
  Live app: #link("https://et617-23b2244.vercel.app")[et617-23b2244.vercel.app] · Repository: #link("https://github.com/Sanidhya-Katiyar/et617-endsem-23B2244")[github.com/Sanidhya-Katiyar/et617-endsem-23B2244]
  #v(0.3cm)
  #line(length: 60%, stroke: 0.5pt)
]

#block(inset: (x: 1.2cm))[
  #set text(10pt)
  *Abstract.* We designed, built and deployed an inquiry-based virtual laboratory on heat conduction (Class 7) for a high-achieving Olympiad learner who works in 10-minute bursts. Learners predict, run a deterministic finite-difference simulation of a heated rod, and interpret their results. The core design move is to treat unsuccessful experiments (confounded comparisons, runs where heat never arrives, and results that contradict the hypothesis) as productive questions answered with graded Socratic scaffolding, never with the answer. An AI model evaluates only free-text explanations, under output checks and with a labelled rule-based fallback.
]

= Identity card

#figure(btable((auto, 1fr), ("Field", "Value"),
  [Roll number], [23B2244],
  [P: Problem], [P5 Inquiry-based virtual laboratory],
  [T: Topic], [T9 Heat conduction in different materials (Class 7)],
  [L: Learner context], [L6 High-achieving learner preparing for an Olympiad, bored by routine practice],
  [C: Design constraint], [C4 10-minute sessions: one complete learning sequence fits in 10 minutes; the learner can stop and resume],
  [Live URL], [https://et617-23b2244.vercel.app],
), caption: [Exam card.])

*Why this combination is coherent.* Heat conduction along a rod is governed by a well-understood equation, so a deterministic simulation gives a reliable ground truth against which every learner trial and prediction can be checked; no AI is needed, or trusted, for the physics. The topic looks "simple" at Class 7 ("metals conduct, wood does not"), which is exactly why an Olympiad learner finds routine practice boring. We make it challenging by asking for *quantitative* inquiry: what controls the *rate*, by how much, and how to prove it with a fair test. Short, self-contained inquiry cycles fit the focused bursts this learner has between coaching sessions.

= D1. Educational problem

Olympiad-track learners find the textbook rule "metals conduct, wood doesn't" trivial, and routine practice bores them. What they lack is quantitative reasoning about *what controls the rate* of conduction: conductivity, rod length, cross-section and temperature difference. They also confuse "feels colder" with "is colder", which blocks a correct understanding of Fourier's law ($H prop k A Delta T \/ L$). Our lab lets them experiment, fail productively and repair their own models within a single 10-minute session.

*Measurable learning outcomes* (verbs from the revised Bloom's taxonomy; Anderson & Krathwohl, 2001):
+ *Predict* how material, length and cross-section change the time for heat to reach the far end of a rod (within ±20% in predict mode; doubling length → time ×3.5–4.5).
+ *Design* a controlled experiment that changes one variable at a time (at least one fair pair; final two trials differ in exactly one variable).
+ *Explain* why a metal spoon feels colder than a wooden one at the same room temperature (written answer meeting both rubric ideas: same temperature; faster conduction away from the hand).

*Context of use.* At home, on the learner's own laptop or phone, in a 10-minute focused burst between coaching classes; English; no login; progress is saved on the device so a session can be stopped and resumed.

= D2. Learner persona

#figure(btable((auto, 1fr), ("Attribute", "Description"),
  [Name, age], [Aditi, 13, Class 8, Pune],
  [Goal], [NSEJS / Junior Science Olympiad aspirant],
  [Prior knowledge], [Knows heat flows from hot to cold; knows good/bad conductor lists; has not met Fourier's law or diffusion scaling],
  [Device, time], [Own laptop or phone; 10-minute focused bursts between coaching sessions],
  [Language], [English (school medium), comfortable with technical words if introduced briefly],
  [Motivation], [Challenge, rankings, "why" puzzles; bored by repetition and long text],
  [Misconception M1], ["Metal objects at room temperature are actually colder than wood."],
  [Misconception M2], ["Only the material matters; rod length or thickness doesn't change how fast heat travels."],
), caption: [Persona expanded from seed L6.])

Both misconceptions are well documented. Lewis and Linn (1994) found that adolescents (and many adults) explain the "cold feel" of metal by claiming metal objects are colder than surrounding objects at room temperature, conflating temperature with the rate of heat transfer (M1). The same work reports reasoning about heat flow in terms of material alone, without attention to geometry (M2), which is exactly the quantitative gap an Olympiad learner must close.

= D3. Educational content

== Concept explanation
The Explorer track sees three chunked cards (one at a time), the Olympiad track skips them:
+ Heat always flows from hotter to colder, until both are at the same temperature. After a night on the table, both spoons have reached room temperature.
+ Materials pass heat along at very different rates. A metal passes energy from particle to particle quickly; wood passes it slowly. This "conduction rate" is what you will investigate.
+ Your skin does not sense temperature. It senses how fast heat leaves your hand. Something that pulls heat away fast feels cold.
The lab then lets learners *discover* the effects of length, cross-section and source temperature; the Olympiad extension introduces $H = k A Delta T \/ L$.

== Tasks, model answers and feedback
All text below is copied from `src/content.js`. Formats: multiple choice (MCQ), numeric, ranking and written.

#figure(btable((auto, auto, 1.3fr, 1fr), ("#", "Format", "Task", "Model answer"),
  [Q1], [MCQ], [The metal spoon and the wooden spoon have both been on the table all night. Which is colder?], [Both are at room temperature. The metal feels colder because it conducts heat away from your hand faster.],
  [Q2], [MCQ], [A medium copper rod 10 cm long (source 100 °C) took about 31 s. About how long at 20 cm?], [About 125 s (×4). Diffusion time grows with length².],
  [Q3], [Numeric], [Double the length of any rod: the time becomes roughly how many times longer?], [About 4 (time ∝ L²); 3.5–4.5 accepted.],
  [Q4], [Ranking], [Rank the materials from fastest to slowest conduction along a rod.], [Copper (400) > aluminium (237) > steel (50) > glass (1) > wood (0.15).],
  [Q5], [MCQ], [Two copper rods, 20 cm, source 100 °C, one thin and one thick. Which far end reaches 60 °C first?], [The thick rod: more heat per second (rate ∝ area) and a smaller share lost to the air.],
  [Q6], [Written], [In one or two sentences, explain why the metal spoon FEELS colder.], [Both are at the same (room) temperature; metal conducts heat away from my hand much faster, which I feel as cold.],
  [Bonus], [Numeric], [A rod takes 30 s at 10 cm. Same setup at 30 cm: about how many seconds?], [About 270 s (3² = 9×).],
  [X1], [MCQ], [Fourier: rod B has twice k and twice L of rod A. $H_B \/ H_A$?], [1: the two effects cancel.],
  [X2], [Numeric], [Copper (k = 400) replaced by steel (k = 50): rate becomes × ?], [0.125],
  [Lab], [Written], [What do we notice? Write your conclusion from the trials table.], [Material, length and thickness all change the time; cite a fair pair for each.],
), caption: [Tasks (11 items, 4 formats) with model answers.])

#figure(btable((auto, 1fr, 1fr, 1fr), ("Item", "Correct response feedback", "M1 response feedback", "M2 response feedback"),
  [Q1], ["Right. Both are at room temperature, and the difference you feel is the rate of heat flow out of your hand."], ["That's misconception M1. Overnight, both spoons reach room temperature, so a thermometer would read the same for each. Metal only feels colder because it pulls heat out of your skin faster."], [n/a],
  [Q2], ["Yes, about ×4. The time grows with length² (the lab gives 31 s → 133 s)."], [n/a], ["That's M2: length does matter. Heat has to warm every extra slice of rod along the way. Test copper 10 cm vs 20 cm in the lab with everything else held constant."],
  [Q3], ["Twice the length gives about 4× the time, because diffusion time scales with L²."], [n/a], ["That's M2: length changes the time a lot. Compare two lab trials that differ only in length."],
  [Q5], ["More cross-section carries more heat per second, and less of it leaks to the air."], [n/a], ["That's M2: thickness matters too. A thicker rod is like a wider pipe for heat."],
  [Q6], ["You named both ideas: same temperature, and metal conducts heat away from your hand faster."], ["That's M1: the metal is not actually colder; both are at room temperature. Explain what the metal does to the heat in your hand instead."], [n/a],
), caption: [Feedback for correct, M1 and M2 responses (rule-based; the written items also receive AI feedback, Section D6).])

After any M1 or M2 answer the learner receives a remediation card and a *similar retry item*: for M1, "An iron railing and a wooden bench sit outside all night at 15 °C. What does a thermometer read?" (both 15 °C); for M2, "Two copper rods, 10 cm and 30 cm. Which far end melts its wax first?" (10 cm).

= D4. Working application

*URL:* https://et617-23b2244.vercel.app (Vercel production; the identity token "ET 617 · 23B2244" is in the footer of every screen, and an About screen gives the roll number and card).

== Screen map
#figure(
  {
    set text(8.5pt)
    let b(t) = box(stroke: 0.6pt, inset: 5pt, radius: 1pt)[#t]
    grid(columns: 9, column-gutter: 4pt, align: horizon,
      b[Welcome / Resume], [→], b[1 Orientation \ hook + diagnostic], [→], b[2 Conceptualisation \ hypothesis], [⇄], b[3 Investigation \ lab, hints, fair test], [→], b[4 Conclusion \ challenge],
    )
    v(4pt)
    grid(columns: 5, column-gutter: 4pt, align: horizon,
      h(7.6cm), [↓], b[5 Discussion \ reflection, badges], [→], b[back to Welcome (resume)],
    )
    v(4pt)
    [Always reachable: Learning log (table + CSV/JSON export) · About · Conceptualisation (revise hypothesis)]
  },
  caption: [Screen map. The double arrow marks the inquiry *cycle*: learners can return to the hypothesis from any phase.],
)

The app has nine screens or states with learner inputs, system outputs and transitions: Welcome/Resume, Hook (answer + confidence), Diagnostic (3 items → track), Intro cards (Explorer only), Hypothesis, Lab, Challenge, Discussion/Summary, Learning log and About.

== C4 visibly implemented
- A five-phase stepper with a minute budget (1.5 + 1.5 + 4 + 2 + 1 = 10 min) and a running clock "mm:ss / 10:00" (Figure 2).
- Autosave after every action to `localStorage`; *Continue where you left off* restores the exact screen and the lab trials table (Figure 1).
- The simulation is sped up (about 4 s per 5-minute trial); three trials unlock the Conclusion phase.

#figure(grid(columns: (1.55fr, 1fr), column-gutter: 8pt, shot("01-welcome-1280.png"), shot("01-welcome-360.png")),
  caption: [Welcome/Resume at 1280 px and 360 px: plain-language phase strip with minute budgets and the resume action (C4). Footer shows the identity token.])

== Libraries, templates and tools
Vite 8 (`create-vite` React JavaScript template), React 19 and React DOM, `@vitejs/plugin-react`, oxlint (lint); IBM Plex Sans and IBM Plex Mono (Google Fonts); Google Gemini API via REST (no SDK); Vercel (static hosting + serverless function); GitHub; Playwright (`playwright-core`, screenshots and end-to-end checks); Typst (this report). No UI component library; the graph is hand-drawn SVG. AI assistance: Claude (Anthropic), see the AI-use log.

= D5. Two contrasting learner scenarios

Both scenarios were run on the live app (with `?ai=off` so that the fallback is shown deterministically).

*(a) Correct learner.* (1) *Start challenge* → *Both are the same temperature*. (2) Diagnostic: Copper, The 1 m rod, A bigger temperature difference → 3/3 → Olympiad track (intro skipped). (3) Hypothesis: all four variables. (4) Lab: copper 20 cm (133 s), only length → 10 cm (31 s), only section → thin. (5) Conclusion: Q1 *same temperature*, Q2 *about 125 s* → two correct in a row unlocks the Olympiad bonus question.

*(b) Misconception learner (M1, M2).* (1) *The metal spoon* (M1 flagged). (2) Diagnostic 0/3 → Explorer track with intro cards. (3) Hypothesis: material only (M2 flagged). (4) Lab: changing material and length together triggers the confounded note and graded hints. (5) Conclusion: the prediction-vs-result table highlights both mismatches; Q1 *The metal spoon* → M1 feedback, remediation card and retry item.

#figure(grid(columns: 2, column-gutter: 8pt, shot("d5a-olympiad-track.png"), shot("04-intro-1280.png")),
  caption: [Profile adaptation. Left (a): 3/3 on the warm-up places the learner on the Olympiad track. Right (b): Explorer track with a "Why am I seeing this?" note and chunked intro card.])

#let crop(path, h) = box(height: h, clip: true, stroke: 0.4pt, image("img/" + path, width: 100%))
#figure(grid(columns: 2, column-gutter: 8pt, crop("d5a-challenge.png", 9.5cm), crop("10-challenge-remedy-1280.png", 9.5cm)),
  caption: [Conclusion phase. Left (a): correct answers, then the Olympiad bonus question unlocked after two correct in a row. Right (b): prediction vs result table with the learner's own M1/M2 mismatches highlighted, M1 feedback, a remediation card and a retry item.])

#figure(btable((auto, 1fr, 1fr), ("Step", "(a) Correct learner: input → response", "(b) Misconception learner: input → response"),
  [Hook], [Same temperature → answer locked, no flag], [Metal colder → M1 flag logged],
  [Diagnostic], [3/3 → Olympiad track, intro skipped, predict mode from trial 1, faded hints], [0/3 → Explorer track, three intro cards, hint 1 shown automatically],
  [Hypothesis], [All variables → no flag], [Material only → M2 flag logged],
  [Lab], [One variable at a time → fair pairs listed, no warning], [Two variables changed → "Two things changed. Can we tell which one caused the difference?", graded hints, *Run a fair test*],
  [Conclusion], [Q1, Q2 correct → bonus question (streak rule)], [Q1 "metal" → M1 feedback + remediation + retry; Q2 "same" → M2 feedback + retry],
), caption: [The system responds differently to the two learners at every phase.])

= D6. AI functionality specification

== AI judgement: where AI is and is not used
The physics is computed deterministically (a 30-node explicit finite-difference model with an insulated far end and side heat loss), so trial times, the graph and the "did not reach" outcome are always correct; we never let a language model generate science that could be hallucinated. AI is used only where rules are weak: judging *free-text explanations*. During inquiry the AI must never reveal the answer; it asks one Socratic question instead.

== Feature: written-explanation feedback
- *What it does:* classifies a learner's written answer as `correct`, `M1`, `M2` or `partial`, gives one line of feedback and asks one Socratic question.
- *Where:* (1) Q6 spoon explanation, (2) lab conclusion ("What do we notice?"), (3) Discussion "Explain it to a junior".
- *Input:* the learner's text (≤600 characters) plus, for the lab conclusion, her hypothesis variables and a one-line summary of each trial.
- *Model call:* browser → our Vercel serverless function `api/feedback.js` → Google Gemini REST `v1beta/models/gemini-3.5-flash-lite:generateContent` (system instruction + user message, temperature 0.3, max 300 tokens, `responseMimeType: application/json`). Server budget 4.5 s (one fast retry on quick errors); browser timeout 5 s.
- *Output schema:* `{"verdict": "correct|M1|M2|partial", "feedback": "...", "socratic_question": "..."}`.
- *Key:* `GEMINI_API_KEY` is stored only as a Vercel environment variable (Production, Development) and read via `process.env` on the server; it is never sent to the browser or committed.

*Actual prompt* (verbatim from `api/prompt.js`):
#block(stroke: (y: 0.5pt), inset: (y: 6pt), width: 100%)[#raw(read("../api/prompt.js"), lang: "js", block: true)]

*Example (live).* Input "Metal is colder than wood because metal is a cold material" → `{"verdict":"M1","feedback":"You know metal is a good conductor!","socratic_question":"If both sat on the exact same table all night, could the metal actually be at a lower temperature than the wood?"}`. Lab input "Only the material matters, copper is fastest" (trials copper 10 cm → 31 s; 20 cm → 133 s) → `{"verdict":"M2","feedback":"Great job spotting that copper is the fastest!","socratic_question":"Look closely at your trial data for copper at 10cm versus 20cm, did the time stay the same?"}`.

== Checks before the learner sees the output
`checkReply()` in `api/feedback.js` rejects a reply unless: (1) it parses as JSON; (2) `verdict` is one of the four allowed values; (3) `feedback` and `socratic_question` are strings; (4) together they are at most 60 words; (5) for lab-time feedback, it does not match an answer-leak filter (phrases such as "length matters", "thicker … faster", "four times", "×4", "squared", "L²").

== Fallback
On any error, a timeout (5 s), or a failed check, the browser uses the rule-based rubric from `src/content.js` (`checkWritten`, `checkConclusion`, `checkReflection`: keyword sets for "same temperature" and "conducts heat away faster", and for the three variables), and labels the result *"Offline feedback (AI unavailable)"* with the reason in a tooltip and in the log. AI output carries an *"AI feedback"* label. During the exam the Gemini service was intermittently slow (many calls exceeded 4.5 s), and the labelled fallback handled every such case; `?ai=off` forces the fallback for demonstration.

#figure(shot("d5a-lab.png", w: 78%), caption: [Lab (correct path): apparatus with thermal gradient, probe tag, ruler, readouts and live graph; control panel with "What am I testing?" and kept-constant tags; conclusion feedback labelled "Offline feedback (AI unavailable)".])

= D7. Pedagogical rationale

== Frameworks mapped to features
#figure(btable((1fr, 1.6fr), ("Framework", "Concrete feature"),
  [Inquiry cycle (Pedaste et al., 2015)], [Five-phase stepper (Orientation, Conceptualisation, Investigation, Conclusion, Discussion); Conceptualisation always clickable, so revising the hypothesis is a cycle, not a line.],
  [Implicit scaffolding (Podolefsky, Moore & Perkins, 2013)], [Guidance through the interface: live thermal gradient on the rod, wax beads that drop at 60 °C, probe tag showing °C where it is dragged, graph drawn in real time; one instruction line per screen.],
  [Control-of-variables strategy (Chen & Klahr, 1999; Schwichow et al., 2016) and experiment design tool (van Riesen et al., 2018)], ["What am I testing?" selector; other variables tagged *kept constant* (turning to *changed*); *Run a fair test* resets only the extra variables; fair pairs grouped automatically.],
  [Confounded comparisons as questions (Lörch, Bonawitz & Brod, n.d.); productive failure (Kapur, 2008)], [Confounded runs are not blocked: they run, then become a question ("Can we tell which one caused the difference?").],
  [Scaffolding (Wood, Bruner & Ross, 1976); formative feedback (Shute, 2008; Hattie & Timperley, 2007)], [Graded hints: probing question → what to hold constant → two rows highlighted; specific, task-level feedback for M1/M2; model answers after each item.],
  [Expertise reversal (Kalyuga et al., 2003)], [Olympiad track: hints faded behind "Need a nudge?", no intro cards, quantitative predict-the-time tasks, Fourier extension. Explorer track: hint 1 shown, intro cards.],
  [Cognitive load theory (Sweller, 1988)], [Chunked intro cards, one diagnostic question at a time, short notes, worked comparison offered when struggling, ≤10 min.],
  [Signalling and personalisation (Mayer, 2009)], [Highlighted key terms, "first, second, third" cues, conversational "we/let's" copy (rubric P5).],
  [Design principles (Norman, 2013)], [Visibility (controls beside the apparatus), affordance (pressable buttons, ruled sliders with units), consistency (one accent for actions, thermal colours only for temperature), mapping (material swatches, rod drawn to scale) (rubric T1).],
), caption: [Research frameworks and the features that implement them.])

== Answer to the P5 design challenge
*How does the system support learning from an unsuccessful experiment without revealing the answer?* The lab detects three kinds of unsuccessful experiment: (a) *confounded*: more than one variable changed since the previous trial; (b) *no result*: the far end never reaches 60 °C within 5 simulated minutes; (c) *contradiction*: a variable the learner said does not matter changes the result in a fair pair (difference > 15%). Rather than blocking, the system runs the trial and turns the failure into a question (Figure 7). Support is graded: hint 1 is a probing question; hint 2 says which variable to hold constant; hint 3 highlights the two table rows to compare. *Run a fair test* repairs the design but leaves the interpretation to the learner. After two hints (or three minutes) a worked comparison is offered using a *different* variable (source temperature), so the method is modelled without giving away the length or area result. The AI feedback on the lab conclusion is filtered for answer leaks. Finally, in the Conclusion phase the learner sees her own prediction next to her own evidence and must click "What do we notice?" before any resolution appears.

#figure(shot("07-lab-confounded-1280.png", w: 72%), caption: [Unsuccessful (confounded) experiment: the run is allowed, then the note asks "Two things changed. Can we tell which one caused the difference?", with a graded hint, the "Why am I seeing this?" explanation and *Run a fair test*.])

== How C4 and L6 shaped the design
*C4 (10-minute sessions):* minute budgets per phase and a visible clock; a sped-up simulation; only three trials required; autosave after every action and exact resume including trials; short, chunked text. *L6 (Olympiad learner):* challenge framing with phases and badges instead of drill; a diagnostic that lets strong learners skip the basics; predict-before-run scoring; quantitative items (L² scaling, Fourier's law); a harder question after a streak; "raise the stakes" when rushing; faded hints.

== Adaptivity (profile, performance, interaction)
Decision rules (thresholds in `THRESHOLDS`, `src/content.js`); every adaptation shows a "Why am I seeing this?" note and logs an `adaptation` event:
- *Profile:* diagnostic score = 3/3 → Olympiad track; otherwise Explorer track.
- *Performance:* an answer flagged M1 or M2 → remediation card + similar retry item; 2 correct in a row → Olympiad bonus question.
- *Interaction:* ≥2 hints on one problem or more than 180 s in the lab → worked comparison; ≥3 trials in under 60 s with no hints → "raise the stakes" (predict mode with an accuracy target).

== Rubric criteria and where they are met
#figure(btable((auto, 1fr), ("Criterion", "Where it is met"),
  [C3 Language comprehensibility], [Short, active, conversational sentences; plain phase verbs (Puzzle, Predict, Experiment, Challenge, Explain); one instruction line per screen.],
  [P2 Alternate conceptions], [M1/M2 captured at the hook and hypothesis; learner identifies her own mismatch in the prediction-vs-result table; remediation + retry resolve it.],
  [P5 Cognitive engagement], [Conversational copy, highlighted key terms, first/second/third cues, puzzle framing.],
  [P13 Adaptivity], [All three bases: profile (diagnostic), performance (M1/M2 routing, streak), interaction (hints, time, rushing).],
  [T1 Interface design], [Norman's visibility, affordance, consistency and mapping (Table 6); UI critique in two rounds (`ui-review/CRITIQUE.md`).],
  [T6 Problem-solving tools], [Thermometer probe, stopwatch, ruler, temperature-time graph, trials table, fair-pairs list.],
), caption: [Rubric criteria mapped to the app.])

= D8. Evaluation plan

We would run a pre/post design: the hook question and confidence rating serve as the pre-test for M1; the hypothesis serves as the pre-test for M2; the Conclusion items and the written explanation serve as the post-test. All evidence comes from the event log (Appendix B), exportable as CSV/JSON.

#figure(btable((auto, 1fr, 1fr, 1fr), ("Outcome", "Assessment item / rubric", "Log data", "Success criterion"),
  [O1 Predict], [Q2, Q3, bonus; predict-mode scores], [`answer`, `trial.score`, `trial.prediction`], [Q3 within 3.5–4.5 and at least one prediction scored ≥80 (within 20%)],
  [O2 Design], [Trials table; confounded detector; fair pairs], [`trial.variablesChanged`, `unsuccessful_experiment`, `hint_used`, `fair_test_reset`], [≥80% of trials after the first hint change exactly one variable; at least one fair pair per tested variable],
  [O3 Explain], [Q1, Q6 (AI + rubric), M1 retry, reflection], [`answer`, `misconception_flag`, `conclusion`, `reflection`], [Q6 scores 2/2 on the rubric (or AI verdict `correct`), with no M1 flag after remediation],
), caption: [Evaluation plan per outcome.])

Additional indicators: time per phase (`step_time`, total ≤600 s for C4), confidence before vs after (`session_complete`), number of hypothesis revisions, and the fair-pair ratio. *If a criterion fails:* if O2 fails we would make the lock tags blocking for the Explorer track; if O1 fails we would add a scaling worked example before Q3; if O3 fails we would add a thermometer-reading mini-experiment on the two spoons to the Orientation phase.

= AI-use log and reflection

*AI chat log.* All AI assistance came from one Claude Code session (Anthropic, Claude Opus). It covered pre-exam environment setup, planning and card interpretation, prompt writing, research on the frameworks, implementation, deployment, the UI critique and this report. The complete session is submitted as a separate file, `ET617_23B2244_AI_chat_log.txt`. It holds every user message, every assistant reply and every tool call, in chronological order (tool outputs omitted).

*What we delegated.* Scaffolding, component code, the simulation, the serverless function, deployment commands, screenshot automation and the first drafts of documentation were produced with an AI coding assistant from our written specifications.

*What we rejected or changed.* (1) The first UI looked generic and AI-styled (dark theme, emojis, pill badges); we ran a screenshot-based critique against our persona and rebuilt it as a lab notebook / instrument panel with no emojis (`ui-review/`). (2) The assistant's default Firebase login and admin dashboard were dropped because the paper did not require them; progress stays on the device. (3) We kept AI out of the physics and out of question generation; it only judges free text, under checks. (4) We changed the model after verifying that the first choice returned HTTP 404 for our key.

*How we verified outputs.* Physics sanity checks on the simulation: copper (133 s at 20 cm) is faster than aluminium (171 s), steel and glass do not reach 60 °C within 5 min, doubling length from 10 to 20 cm raises the time from 31 s to 133 s (about ×4.3, consistent with L²), and thicker rods are faster (127 s vs 160 s). AI replies were checked for JSON shape, length and answer leaks; both D5 paths were run end-to-end on the live app with automated browser tests (no page errors; footer on every screen).

*Limitations.* Gemini latency was unreliable during the exam, so many learners would see the offline rubric. The keyword rubric is shallow and can be gamed; the simulation uses a simplified side-loss model; learner data stays on one device, so a teacher cannot aggregate it.

= References
#set par(justify: false, hanging-indent: 1.2em)
#set text(9.5pt)
Anderson, L. W., & Krathwohl, D. R. (Eds.). (2001). _A taxonomy for learning, teaching, and assessing: A revision of Bloom's taxonomy of educational objectives_. Longman.

Chen, Z., & Klahr, D. (1999). All other things being equal: Acquisition and transfer of the control of variables strategy. _Child Development, 70_(5), 1098–1120.

Hattie, J., & Timperley, H. (2007). The power of feedback. _Review of Educational Research, 77_(1), 81–112.

Kalyuga, S., Ayres, P., Chandler, P., & Sweller, J. (2003). The expertise reversal effect. _Educational Psychologist, 38_(1), 23–31.

Kapur, M. (2008). Productive failure. _Cognition and Instruction, 26_(3), 379–424.

Lewis, E. L., & Linn, M. C. (1994). Heat energy and temperature concepts of adolescents, adults, and experts: Implications for curricular improvements. _Journal of Research in Science Teaching, 31_(6), 657–677.

Lörch, L., Bonawitz, E., & Brod, G. (n.d.). Challenging the control-of-variables strategy: How confounded comparisons can support children's science learning. _Proceedings of the Annual Meeting of the Cognitive Science Society_. https://escholarship.org/content/qt42c70920/qt42c70920.pdf

Mayer, R. E. (2009). _Multimedia learning_ (2nd ed.). Cambridge University Press.

Norman, D. A. (2013). _The design of everyday things_ (Revised and expanded ed.). Basic Books.

Pedaste, M., Mäeots, M., Siiman, L. A., de Jong, T., van Riesen, S. A. N., Kamp, E. T., Manoli, C. C., Zacharia, Z. C., & Tsourlidaki, E. (2015). Phases of inquiry-based learning: Definitions and the inquiry cycle. _Educational Research Review, 14_, 47–61. https://doi.org/10.1016/j.edurev.2015.02.003

Podolefsky, N. S., Moore, E. B., & Perkins, K. K. (2013). _Implicit scaffolding in interactive simulations: Design strategies to support multiple educational goals_. arXiv:1306.6544.

Schwichow, M., Croker, S., Zimmerman, C., Höffler, T., & Härtig, H. (2016). Teaching the control-of-variables strategy: A meta-analysis. _Developmental Review, 39_, 37–63.

Shute, V. J. (2008). Focus on formative feedback. _Review of Educational Research, 78_(1), 153–189.

Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. _Cognitive Science, 12_(2), 257–285.

van Riesen, S. A. N., Gijlers, H., Anjewierden, A., & de Jong, T. (2018). Supporting learners' experiment design. _Educational Technology Research and Development, 66_(2), 475–491.

Wood, D., Bruner, J. S., & Ross, G. (1976). The role of tutoring in problem solving. _Journal of Child Psychology and Psychiatry, 17_(2), 89–100.

#set text(11pt)
#set par(justify: true, hanging-indent: 0em)
#counter(heading).update(0)
#set heading(numbering: "A.1")
= Appendix: Process evidence
The repository was created after the exam started (empty at 18:20; first commit 18:26). DESIGN.md was committed at 18:26 (within 0:30) and the first deployment went live at 18:27 (within 1:00); there were 29 commits, with no gap longer than 13 minutes.

#figure(
  {
    set text(8.5pt)
    btable((auto, 1fr), ("Time", "Commit message"),
      ..csv("commits.csv", delimiter: "|").map(r => (r.at(0), r.at(1))).flatten())
  },
  caption: [Commit history (`git log`, local time, 18 Nov 2026).])

= Appendix: Event-log schema
Each event is stored in `localStorage` (key `et617-23b2244`) as `{time, screen, type, data}`. Types: `hook_answer`, `diagnostic`, `adaptation`, `hypothesis`, `hypothesis_revised`, `testing_variable`, `trial` (variables, `variablesChanged`, time, prediction, score), `unsuccessful_experiment`, `hint_used`, `fair_test_reset`, `conclusion`, `answer`, `misconception_flag`, `discovery`, `reflection`, `step_time`, `session_complete` (confidence before/after, badges).
