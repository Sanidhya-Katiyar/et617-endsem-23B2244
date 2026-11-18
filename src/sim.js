// sim.js — 1D finite-difference model of heat conducting along a rod heated at the left end.
// k = conductivity (W/mK), rho = density (kg/m³), c = specific heat (J/kgK). Diffusivity alpha = k/(rho·c).
export const MATERIALS = {
  copper: { name: 'Copper', k: 400, rho: 8960, c: 385 },
  aluminium: { name: 'Aluminium', k: 237, rho: 2700, c: 900 },
  steel: { name: 'Steel', k: 50, rho: 7850, c: 490 },
  glass: { name: 'Glass', k: 1, rho: 2500, c: 840 },
  wood: { name: 'Wood', k: 0.15, rho: 600, c: 1700 },
}
// Rod radius in metres for each cross-section option.
export const AREAS = { thin: { name: 'Thin', r: 0.002 }, medium: { name: 'Medium', r: 0.005 }, thick: { name: 'Thick', r: 0.01 } }

export const ROOM = 25        // °C, the starting temperature of the rod and the air
export const MELT = 60        // °C, the wax melts here
export const MAX_TIME = 300   // seconds (5 min of simulated time)
const N = 30                  // number of points along the rod
const H = 10                  // W/m²K, heat lost from the rod's surface to the air

export function simulate({ material, length, area, sourceT }) {
  const m = MATERIALS[material]
  const alpha = m.k / (m.rho * m.c)
  const L = length / 100                                // cm → m
  const dx = L / (N - 1)
  const loss = (2 * H) / (m.rho * m.c * AREAS[area].r)  // side heat loss: bigger for thin rods
  const dt = Math.min(0.4 * dx * dx / alpha, 0.5)       // small enough step to stay stable

  let T = Array(N).fill(ROOM)
  T[0] = sourceT                                        // left end held at the source temperature
  const samples = [{ t: 0, profile: [...T] }]
  let reachTime = null
  let nextSample = 1

  for (let t = dt; t <= MAX_TIME; t += dt) {
    const next = [...T]
    for (let i = 1; i < N; i++) {
      const right = i === N - 1 ? T[i - 1] : T[i + 1]   // far end is insulated (mirror)
      next[i] = T[i] + dt * (alpha * (T[i - 1] - 2 * T[i] + right) / (dx * dx) - loss * (T[i] - ROOM))
    }
    T = next
    if (reachTime === null && T[N - 1] >= MELT) reachTime = Math.round(t)
    if (t >= nextSample) { samples.push({ t: nextSample, profile: [...T] }); nextSample++ }
  }
  return { samples, reachTime }
}
