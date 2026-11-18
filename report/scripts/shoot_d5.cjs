// Captures the D5 correct-path screenshots from the LIVE app (needs playwright-core + installed Chrome).
// usage: node shoot_d5.js <outDir>
const { chromium } = require('playwright-core')
const out = process.argv[2]
;(async () => {
  const browser = await chromium.launch({ channel: 'chrome' })
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto('https://et617-23b2244.vercel.app/?ai=off')
  await page.evaluate(() => localStorage.clear()); await page.reload()
  const click = async (t) => { await page.locator('button', { hasText: t }).first().click(); await page.waitForTimeout(250) }
  await click('Start challenge'); await click('Both are the same temperature')
  await click('Copper'); await click('The 1 m rod'); await click('A bigger temperature difference')
  await page.screenshot({ path: `${out}/d5a-olympiad-track.png` })
  await click('Next phase')
  const boxes = page.locator('input[type=checkbox]'); for (let i = 0; i < 4; i++) await boxes.nth(i).check()
  await page.locator('input[type=text]').fill('Copper fastest; longer and thinner rods slower')
  await click('Next phase')
  await click('Run trial'); await page.waitForTimeout(4500)
  await page.locator('.panel input[type=range]').first().fill('10'); await click('Run trial'); await page.waitForTimeout(4500)
  await click('Section'); await click('Thin'); await click('Run trial'); await page.waitForTimeout(4500)
  await page.locator('textarea').fill('Material, length and thickness all change the time.'); await click('Check my conclusion'); await page.waitForTimeout(600)
  await page.screenshot({ path: `${out}/d5a-lab.png`, fullPage: true })
  await click('Next phase: Conclusion'); await click('Both are the same temperature'); await click('About 125 s, four times')
  await page.screenshot({ path: `${out}/d5a-challenge.png`, fullPage: false })
  await browser.close()
})().catch((e) => { console.error(e.message); process.exit(1) })
