// Generative SVG artwork drawn in code — replaces the old AI-generated images.

/** Deterministic PRNG so every post gets the same cover on every visit. */
function seeded(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const palettes = [
  ["#2e1065", "#6d28d9", "#f97316"],
  ["#1e1b4b", "#4f46e5", "#fb923c"],
  ["#3b0764", "#9333ea", "#fbbf24"],
  ["#172554", "#7c3aed", "#f472b6"],
];

/** A unique "architecture graph" cover for a post, seeded by its slug. */
export function postCover(slug: string, label: string): string {
  const rnd = seeded(slug);
  const [bg, mid, accent] = palettes[Math.floor(rnd() * palettes.length)];
  const W = 400;
  const H = 220;
  const cols = 6;
  const rows = 3;
  const nodes: { x: number; y: number; hot: boolean }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (rnd() < 0.25) continue;
      nodes.push({
        x: 40 + c * 64 + (rnd() - 0.5) * 24,
        y: 50 + r * 60 + (rnd() - 0.5) * 22,
        hot: rnd() < 0.18,
      });
    }
  }
  let edges = "";
  nodes.forEach((a, i) => {
    nodes.slice(i + 1).forEach((b) => {
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 95 && rnd() < 0.75) {
        // orthogonal "circuit" routing
        const midX = a.x + (b.x - a.x) * (0.3 + rnd() * 0.4);
        edges += `<path d="M${a.x.toFixed(1)} ${a.y.toFixed(1)}H${midX.toFixed(1)}V${b.y.toFixed(1)}H${b.x.toFixed(1)}" stroke="${a.hot || b.hot ? accent : "#c4b5fd"}" stroke-opacity="${a.hot || b.hot ? 0.9 : 0.35}"/>`;
      }
    });
  });
  const dots = nodes
    .map((n) =>
      n.hot
        ? `<rect x="${(n.x - 9).toFixed(1)}" y="${(n.y - 9).toFixed(1)}" width="18" height="18" rx="4" fill="${accent}"/><rect x="${(n.x - 14).toFixed(1)}" y="${(n.y - 14).toFixed(1)}" width="28" height="28" rx="7" fill="none" stroke="${accent}" stroke-opacity=".4"/>`
        : `<rect x="${(n.x - 6).toFixed(1)}" y="${(n.y - 6).toFixed(1)}" width="12" height="12" rx="3" fill="#ede9fe" fill-opacity=".85"/>`,
    )
    .join("");
  const id = `c${slug.replace(/[^a-z0-9]/gi, "")}`;
  return `<svg class="cover-art" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label} illustration">
  <defs>
    <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="${mid}"/></linearGradient>
    <pattern id="${id}p" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#fff" fill-opacity=".08"/></pattern>
    <radialGradient id="${id}r" cx=".85" cy=".1" r=".7"><stop offset="0" stop-color="${accent}" stop-opacity=".35"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${id}g)"/>
  <rect width="${W}" height="${H}" fill="url(#${id}p)"/>
  <rect width="${W}" height="${H}" fill="url(#${id}r)"/>
  <g fill="none" stroke-width="1.5">${edges}</g>
  ${dots}
</svg>`;
}

/**
 * "From silicon to the cloud": a chip whose traces route up into a cloud of
 * services. Animated flow along the traces (disabled for reduced motion in CSS).
 */
export function siliconToCloud(): string {
  const traces = [
    "M200 300V250H120V186",
    "M220 300V240H200V176",
    "M240 300V250H280V186",
    "M260 300V260H340V200",
    "M180 300V270H70V204",
  ];
  const services = [
    { x: 120, y: 172, t: "S3" },
    { x: 200, y: 162, t: "λ" },
    { x: 280, y: 172, t: "EKS" },
    { x: 340, y: 186, t: "IAM" },
    { x: 70, y: 190, t: "CDN" },
  ];
  return `<svg class="illustration" viewBox="0 0 420 420" role="img" aria-label="Illustration of a circuit chip whose traces connect up to cloud services">
  <defs>
    <linearGradient id="ilbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1e1036"/><stop offset="1" stop-color="#3b1d6e"/></linearGradient>
    <linearGradient id="ilcloud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a78bfa" stop-opacity=".35"/><stop offset="1" stop-color="#7c3aed" stop-opacity=".08"/></linearGradient>
    <pattern id="ilgrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#fff" stroke-opacity=".05"/></pattern>
  </defs>
  <rect width="420" height="420" rx="28" fill="url(#ilbg)"/>
  <rect width="420" height="420" rx="28" fill="url(#ilgrid)"/>
  <path d="M95 140a50 50 0 0 1 60-58 70 70 0 0 1 128 12 46 46 0 0 1 40 76H95a36 36 0 0 1 0-30z" fill="url(#ilcloud)" stroke="#a78bfa" stroke-opacity=".5" stroke-width="1.5"/>
  <g fill="none" stroke="#f97316" stroke-width="2.5" stroke-linecap="round">
    ${traces.map((d) => `<path d="${d}" stroke-opacity=".3"/><path class="flow" d="${d}"/>`).join("")}
  </g>
  ${services
    .map(
      (s) => `<g><rect x="${s.x - 24}" y="${s.y - 14}" width="48" height="28" rx="8" fill="#2a1650" stroke="#c4b5fd" stroke-opacity=".6"/><text x="${s.x}" y="${s.y + 5}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="13" fill="#ede9fe">${s.t}</text></g>`,
    )
    .join("")}
  <g>
    <rect x="150" y="300" width="140" height="70" rx="10" fill="#120a24" stroke="#a78bfa" stroke-width="2"/>
    ${Array.from({ length: 9 }, (_, i) => `<rect x="${160 + i * 14}" y="370" width="6" height="12" fill="#a78bfa" fill-opacity=".7"/>`).join("")}
    <text x="220" y="342" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="14" fill="#c4b5fd">SoC · v1</text>
  </g>
</svg>`;
}
