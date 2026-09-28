/**
 * Generates a blueprint-style hero image (aged paper + technical drawing +
 * isometric laptop) at public/media/hero.jpg. Replace this file with a real
 * image at the same path to use your own; the hero reads /media/hero.jpg.
 * Run: node scripts/generate-hero.mjs
 */
import sharp from "sharp";

const W = 2400, H = 1350;
const PAPER = "#ece3d2", PAPER2 = "#e2d8c3", INK = "#20201d", LINE = "#3a3a34";
const cx = 1620, cy = 640; // laptop / mandala centre (right side)

const R = (seed) => { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const rnd = R(20260910);

let g = "";

// faint measured grid
for (let x = 0; x <= W; x += 200) g += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${LINE}" stroke-width="1" opacity="0.10"/>`;
for (let y = 0; y <= H; y += 200) g += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${LINE}" stroke-width="1" opacity="0.10"/>`;
// stronger frame margins
const m = 70;
g += `<rect x="${m}" y="${m}" width="${W - 2 * m}" height="${H - 2 * m}" fill="none" stroke="${LINE}" stroke-width="1.4" opacity="0.35"/>`;

// registration crosshairs at some grid nodes
const cross = (x, y, s = 14) => `<g opacity="0.5"><circle cx="${x}" cy="${y}" r="${s}" fill="none" stroke="${LINE}" stroke-width="1.4"/><line x1="${x - s - 8}" y1="${y}" x2="${x + s + 8}" y2="${y}" stroke="${LINE}" stroke-width="1.2"/><line x1="${x}" y1="${y - s - 8}" x2="${x}" y2="${y + s + 8}" stroke="${LINE}" stroke-width="1.2"/></g>`;
[[m, m], [W - m, m], [m, H - m], [W - m, H - m], [W - m, cy], [m, cy], [cx, m], [cx, H - m]].forEach(([x, y]) => (g += cross(x, y)));

// concentric mandala rings around the laptop
[190, 300, 430, 560, 640].forEach((r, i) => (g += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${LINE}" stroke-width="${i === 2 ? 1.6 : 1}" opacity="${0.18 + (i % 2) * 0.12}"/>`));
// radial ticks
for (let a = 0; a < 360; a += 15) { const rad = (a * Math.PI) / 180; g += `<line x1="${cx + Math.cos(rad) * 620}" y1="${cy + Math.sin(rad) * 620}" x2="${cx + Math.cos(rad) * 645}" y2="${cy + Math.sin(rad) * 645}" stroke="${LINE}" stroke-width="1" opacity="0.4"/>`; }

// constellation of nodes + connecting lines on the empty left
const nodes = [];
for (let i = 0; i < 16; i++) nodes.push([120 + rnd() * 1000, 160 + rnd() * 1020]);
for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
  const [ax, ay] = nodes[i], [bx, by] = nodes[j];
  if (Math.hypot(ax - bx, ay - by) < 320) g += `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="${LINE}" stroke-width="0.8" opacity="0.18"/>`;
}
nodes.forEach(([x, y]) => (g += `<circle cx="${x}" cy="${y}" r="3" fill="${INK}" opacity="0.5"/>`));

// ---- isometric laptop ----
// base top face
const base = [[1240, 760], [1760, 860], [1980, 690], [1470, 600]];
const poly = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ") + " Z";
// screen (hinged along the back edge, from base[3] to base[2], tilted up)
const screen = [[1470, 600], [1980, 690], [2050, 300], [1545, 230]];
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

let lap = "";
// laptop base body (slab), front thickness
lap += `<path d="${poly([[1240, 760], [1760, 860], [1760, 892], [1240, 792]])}" fill="${PAPER2}" stroke="${INK}" stroke-width="2.4"/>`;
lap += `<path d="${poly([[1760, 860], [1980, 690], [1980, 722], [1760, 892]])}" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/>`;
lap += `<path d="${poly(base)}" fill="${PAPER}" stroke="${INK}" stroke-width="2.6"/>`;
// keyboard area (inset)
const kbd = [lerp(base[0], base[2], 0.12), lerp(base[1], base[3], 0.12), lerp(base[2], base[0], 0.12), lerp(base[3], base[1], 0.12)];
// key grid via bilinear interpolation across the base quad
const bilerp = (u, v) => { const top = lerp(base[3], base[2], u); const bot = lerp(base[0], base[1], u); return lerp(top, bot, v); };
for (let r = 0; r < 5; r++) for (let c = 0; c < 12; c++) {
  const u0 = 0.08 + (c / 12) * 0.84, u1 = 0.08 + ((c + 0.82) / 12) * 0.84;
  const v0 = 0.14 + (r / 5) * 0.5, v1 = 0.14 + ((r + 0.82) / 5) * 0.5;
  const p = [bilerp(u0, v0), bilerp(u1, v0), bilerp(u1, v1), bilerp(u0, v1)];
  lap += `<path d="${poly(p)}" fill="none" stroke="${INK}" stroke-width="1.1" opacity="0.7"/>`;
}
// trackpad (front centre)
const tp = [bilerp(0.32, 0.72), bilerp(0.68, 0.72), bilerp(0.68, 0.96), bilerp(0.32, 0.96)];
lap += `<path d="${poly(tp)}" fill="none" stroke="${INK}" stroke-width="1.4" opacity="0.8"/>`;
// screen shell + dark panel
lap += `<path d="${poly(screen)}" fill="${INK}" stroke="${INK}" stroke-width="2.6"/>`;
const bez = (u, v) => { const top = lerp(screen[3], screen[2], u); const bot = lerp(screen[0], screen[1], u); return lerp(top, bot, v); };
// code lines on the screen
for (let r = 0; r < 12; r++) {
  const v0 = 0.1 + (r / 12) * 0.82;
  const indent = [0, 0.06, 0.12, 0.06, 0, 0.06, 0.12, 0.18, 0.12, 0.06, 0, 0.06][r] || 0;
  const len = 0.35 + rnd() * 0.5;
  const a = bez(0.1 + indent, v0), b = bez(Math.min(0.92, 0.1 + indent + len), v0);
  const col = r % 4 === 0 ? "#c9a24b" : r % 3 === 0 ? "#8fb0c9" : "#cfc8ba";
  lap += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${col}" stroke-width="3" opacity="0.85" stroke-linecap="round"/>`;
}
// screen top bar
const barA = bez(0.1, 0.05), barB = bez(0.92, 0.05);
lap += `<line x1="${barA[0]}" y1="${barA[1]}" x2="${barB[0]}" y2="${barB[1]}" stroke="#6b6a63" stroke-width="4"/>`;
[0.14, 0.18, 0.22].forEach((u) => { const p = bez(u, 0.05); lap += `<circle cx="${p[0]}" cy="${p[1]}" r="3.4" fill="#cfc8ba"/>`; });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="pg" cx="62%" cy="46%" r="80%">
      <stop offset="0" stop-color="${PAPER}"/><stop offset="1" stop-color="${PAPER2}"/>
    </radialGradient>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#pg)"/>
  ${g}
  ${lap}
  <rect width="${W}" height="${H}" filter="url(#grain)"/>
</svg>`;

await sharp(Buffer.from(svg)).jpeg({ quality: 88, mozjpeg: true }).toFile("public/media/hero.jpg");
console.log("wrote public/media/hero.jpg");
