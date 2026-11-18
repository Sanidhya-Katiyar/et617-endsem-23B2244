// Screenshots every screen of the live app at 1280 and 360 px.  usage: node shoot.js <outDir>
const { chromium } = require('playwright-core')
const out = process.argv[2]
const URL = 'https://et617-23b2244.vercel.app/?ai=off'
const KEY = 'et617-23b2244'
const base = () => ({
  screen: 'welcome', lastStep: 'lab', hook: { answer: 'metal', confidence: 3, introStep: 0 }, track: 'explorer', diagScore: 1,
  hypothesis: { vars: ['material'], prediction: 'Only material matters', saved: true, revisions: 0 },
  trials: [], hintsUsed: 0, challenge: {}, confAfter: 3, log: [], elapsedBefore: 240, stepStart: Date.now(),
})

;(async () => {
  const browser = await chromium.launch({ channel: 'chrome' })
  for (const [w, h] of [[1280, 900], [360, 780]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } })
    await page.goto(URL)
    const seed = async (state) => { await page.evaluate(([k, s]) => localStorage.setItem(k, JSON.stringify(s)), [KEY, state]); await page.reload(); await page.waitForTimeout(700) }
    const shot = async (name) => { await page.screenshot({ path: `${out}/${name}-${w}.png`, fullPage: true }) }
    const click = async (text) => { await page.locator('button', { hasText: text }).first().click(); await page.waitForTimeout(250) }

    await seed({ ...base(), screen: 'welcome' }); await shot('01-welcome')
    await seed({ ...base(), screen: 'hook', hook: { answer: null, confidence: 3, introStep: 0 }, track: undefined }); await shot('02-hook')
    await click('The metal spoon'); await shot('03-diagnostic')
    await seed({ ...base(), screen: 'hook', track: 'explorer' }); await shot('04-intro')
    await seed({ ...base(), screen: 'hypothesis', hypothesis: { vars: ['material'], prediction: '', saved: false, revisions: 0 } }); await shot('05-hypothesis')
    await seed({ ...base(), screen: 'lab' }); await shot('06-lab-empty')
    await click('Run trial'); await page.waitForTimeout(4500)
    await click('Aluminium'); await page.locator('.panel input[type=range]').first().fill('10'); await page.waitForTimeout(200)
    await click('Run trial'); await page.waitForTimeout(4500); await shot('07-lab-confounded')
    await click('Run a fair test'); await click('Run trial'); await page.waitForTimeout(4500); await shot('08-lab-fairpairs')
    await click('Next phase'); await page.waitForTimeout(300); await shot('09-challenge')
    await click('The metal spoon'); await shot('10-challenge-remedy')
    await click('Home'); await page.evaluate((k) => { const s = JSON.parse(localStorage.getItem(k)); s.screen = 'summary'; localStorage.setItem(k, JSON.stringify(s)) }, KEY); await page.reload(); await page.waitForTimeout(700); await shot('11-summary')
    await click('Learning log'); await shot('12-log')
    await click('About'); await shot('13-about')
    await page.close()
  }
  await browser.close()
  console.log('done')
})().catch((e) => { console.error(e.message); process.exit(1) })
