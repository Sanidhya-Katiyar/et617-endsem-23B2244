// api/feedback.js — Vercel serverless function. The browser POSTs a written answer here; we ask Gemini for
// Socratic feedback, CHECK the reply, and return it. The API key stays on the server (process.env).
import { SYSTEM_PROMPT, buildUserPrompt } from './prompt.js'

const MODEL = 'gemini-2.5-flash'
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`
const VERDICTS = ['correct', 'M1', 'M2', 'partial']

// Phrases that would give the answer away during the lab (the learner must discover these herself).
const REVEALS = /(length|longer|thick|thin|area|cross.?section)[^.?!]{0,40}(matters?|affects?|slower|faster|takes? longer|changes? the time)|four times|x ?4|×4|squared|l²|l\^2/i

// The CHECK: valid shape, allowed verdict, at most 60 words, and no answer reveal during the lab.
export function checkReply(reply, duringLab) {
  if (!reply || typeof reply !== 'object') return 'not an object'
  if (!VERDICTS.includes(reply.verdict)) return 'bad verdict'
  if (typeof reply.feedback !== 'string' || typeof reply.socratic_question !== 'string') return 'missing fields'
  const words = `${reply.feedback} ${reply.socratic_question}`.trim().split(/\s+/).length
  if (words > 60) return `too long (${words} words)`
  if (duringLab && REVEALS.test(`${reply.feedback} ${reply.socratic_question}`)) return 'reveals the answer'
  return null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  const { kind, text, context } = req.body || {}
  if (!text || !['spoon', 'lab'].includes(kind)) return res.status(400).json({ error: 'need kind and text' })
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'no API key configured' })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 4500)   // stay inside the browser's 5 s limit
  try {
    const r = await fetch(URL, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: buildUserPrompt(kind, text, context) }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 300, responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } },
      }),
    })
    if (!r.ok) return res.status(502).json({ error: `Gemini HTTP ${r.status}` })
    const data = await r.json()
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    let reply
    try { reply = JSON.parse(raw) } catch { return res.status(502).json({ error: 'reply was not JSON' }) }
    const problem = checkReply(reply, kind === 'lab')
    if (problem) return res.status(422).json({ error: `failed check: ${problem}` })
    return res.status(200).json({ verdict: reply.verdict, feedback: reply.feedback, socratic_question: reply.socratic_question, model: MODEL })
  } catch (e) {
    return res.status(504).json({ error: e.name === 'AbortError' ? 'timeout' : 'request failed' })
  } finally {
    clearTimeout(timer)
  }
}
