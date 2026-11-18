# Final pass (19:40–19:52): audit and fixes

## Ranked audit (impact vs risk)
| # | Issue | Impact | Risk | Status |
|---|---|---|---|---|
| 1 | AI feedback mostly fell back: Gemini often took >4.5 s | High | Low (constants) | **Fixed.** Server budget 9 s, browser 10 s (`THRESHOLDS.aiTimeoutMs`), button shows "Thinking…"; fallback kept. Live: the correct path now shows "AI feedback". |
| 2 | Debrief showed a raw id (`you answered "metal"`) | Medium | Low | **Fixed** (`HOOK_ANSWER_TEXT` in content.js) |
| 3 | Debrief fair-test sentences too long (CRITIQUE leftover) | Medium | Low | **Fixed.** Compact mono list "Length: T1 133 s vs T3 31 s" |
| 4 | Hook: gap before "?" after the highlighted word | Low | Low | **Fixed** |
| 5 | README files table outdated | Low (viva) | None | **Fixed** |
| 6 | Challenge is one long scroll of questions (CRITIQUE leftover) | Medium | High (refactor) | **Not done.** Limitation |
| 7 | Gemini latency is still variable (some calls fail even at 9 s) | Medium | n/a (external) | Fallback labelled. Limitation |
| 8 | Keyword rubric is shallow; no teacher view; data stays on one device | Medium | n/a | Limitation |

Emoji check: 0 matches in src/, api/, index.html. Both D5 paths pass end-to-end on the live app (no page errors, footer on every screen).
