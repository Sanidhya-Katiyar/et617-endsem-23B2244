# UI critique for persona Aditi (13, Olympiad aspirant, easily bored, 10-minute bursts)

Screenshots are in `ui-review/round1/` (before) and `ui-review/round2/` (after), at 1280 and 360 px.

## Round 1: ranked issues (issue → screen → fix)
1. **The apparatus is lost in empty space.** At 10–20 cm the rod fills only 20–40% of the stage, and the right half of the stage sits empty while the panel is twice as tall. → Lab → Move the notebook graph *into* the stage column so the instrument, readouts and live graph read as one apparatus. **Fixed.**
2. **The warning note appears far below the controls.** "Two things changed…" shows under the graph, out of view after pressing Run. → Lab → Moving the graph up (fix 1) puts the note directly under the apparatus and panel. **Fixed.**
3. **Lock tags squash the slider labels.** "SOURCE TEMPERATURE [kept constant] 100 °C" breaks over 3 lines. → Lab panel → Let the control header wrap, so the tag sits beside the label and the value stays right. **Fixed.**
4. **The results table breaks at 360 px.** The header "Time for far end to reach 60 °C" turns into a one-word-per-line column. → Lab → Shorter header ("Far end hits 60 °C"), no-wrap time cell, tighter cells on mobile. **Fixed.**
5. **Jargon on the first screen.** "Conceptualisation / Orientation" means nothing to a 13-year-old. → Welcome + stepper → Lead with plain verbs (Puzzle · Predict · Experiment · Challenge · Explain) and keep the Pedaste names as small secondary text. **Fixed.**
6. **The welcome screen looks like a generic form.** It has a numbered list inside a big card and a three-line lede. → Welcome → Instrument-style 5-column phase strip with minute budgets, and a one-line lede. **Fixed.**
7. **You can't see which answer you picked.** After answering, all MCQ buttons fade, including the chosen one. → Challenge → The chosen (primary) button stays full strength and the others fade. **Fixed.**
8. **The ranking controls are heavy.** Ten full-size Up/Down buttons dominate Q4. → Challenge → Small secondary buttons. **Fixed.**
9. **A duplicated heading.** "EXPLAIN IT TO A JUNIOR" is followed by "Explain it to a junior: …". → Discussion → Remove the repeat from the prompt. **Fixed.**
10. **The lede is too small to anchor a screen.** → All → 17 px lede. **Fixed.**

## Still weak (lower impact, for round 2 or later)
- Challenge is one long scroll of 6 cards. Paging one question at a time would suit 10-minute bursts better.
- The Debrief "fair tests" sentences are long. A mono table would scan better.
- The diagnostic and the intro cards use the same flat card as everything else; they could look more like a challenge.
- At 360 px the top nav plus stepper takes about 130 px before any content.

## Round 2 (after comparing round1 vs round2 screenshots)
**Improved:** the lab now reads as one instrument (rod, readouts and live graph in one column), and the warning note sits directly under the apparatus. The panel labels no longer wrap badly. The welcome screen leads with plain verbs, and the 360 px table fits.

**Fixed in round 2:**
1. **The graph's labels were oversized at 1280 px** once the graph moved into the wide stage. → Lab → Cap the graph at 620 px.
2. **Double borders.** The "Why am I seeing this?" note inside the warning note had a second border. → Lab / Challenge → Nested why-notes become quiet asides, and the note title is a clear 16 px heading.
3. **The rod looked "too small"** at short lengths. → Lab → Label it "rod drawn to scale · 50 cm = full width", so the size reads as data, not a bug.
4. **The 360 px header was tall.** → All → Hide the "inquiry notebook" tagline and tighten the header padding on mobile.

**Still weak:** Challenge as one long scroll; Debrief fair-test sentences are long. Both are out of scope for the time left.
