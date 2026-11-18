// Icons.jsx — tiny hand-drawn line icons (1.5px stroke), used instead of emoji.
const base = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

export const Flame = (p) => <svg {...base} {...p}><path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5.5 1-8.5z" /></svg>
export const Thermo = (p) => <svg {...base} {...p}><path d="M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z" /><path d="M12 10v6" /></svg>
export const Clock = (p) => <svg {...base} {...p}><circle cx="12" cy="13" r="7" /><path d="M12 13V9M10 3h4" /></svg>
