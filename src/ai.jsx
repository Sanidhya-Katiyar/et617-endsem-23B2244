// ai.js — asks our /api/feedback function for AI feedback on a written answer.
// On an error, a 5 s timeout or a failed check, it FALLS BACK to the offline keyword checker.
// Add ?ai=off to the URL to force the fallback (handy for demos).

export async function getFeedback(kind, text, context, offlineCheck) {
  const offline = (reason) => ({ source: 'offline', reason, ...offlineCheck(text) })
  if (new URLSearchParams(location.search).get('ai') === 'off') return offline('AI switched off (?ai=off)')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 5000)
  try {
    const r = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, text, context }),
      signal: controller.signal,
    })
    const data = await r.json()
    if (!r.ok) return offline(data.error || `HTTP ${r.status}`)
    return {
      source: 'ai',
      correct: data.verdict === 'correct',
      flag: data.verdict === 'M1' || data.verdict === 'M2' ? data.verdict : undefined,
      fb: `${data.feedback} ${data.socratic_question}`,
    }
  } catch (e) {
    return offline(e.name === 'AbortError' ? 'timeout (5 s)' : 'network error')
  } finally {
    clearTimeout(timer)
  }
}

// Label shown above every piece of written-answer feedback.
export function SourceBadge({ result }) {
  if (!result?.source) return null
  return result.source === 'ai'
    ? <span className="ai-badge">✨ AI feedback</span>
    : <span className="ai-badge offline" title={result.reason}>Offline feedback (AI unavailable)</span>
}
