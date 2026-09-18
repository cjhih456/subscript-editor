/**
 * @schema 2.11
 * @input color: color = #A3A3A3
 * @input density: number = 2
 * @input seed: number = 7
 */
function hash(n) {
  const x = Math.sin(n) * 43758.5453123;
  return x - Math.floor(x);
}

function valueNoise(x) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash(i) * (1 - u) + hash(i + 1) * u;
}

function fbm(x) {
  return (
    0.5 * valueNoise(x) +
    0.25 * valueNoise(x * 2.11 + 19.2) +
    0.125 * valueNoise(x * 4.27 + 41.7) +
    0.0625 * valueNoise(x * 8.53 + 73.1)
  );
}

function phrase(x, center, width, amp) {
  const d = Math.abs(x - center) / Math.max(width, 0.001);
  const bell = Math.exp(-d * d * 2.6);
  const attack = Math.min(1, Math.max(0, (x - (center - width)) / (width * 0.65)));
  const release = 1 - Math.min(1, Math.max(0, (x - (center + width * 0.2)) / (width * 0.8)));
  const gate = Math.min(attack, release);
  const syll = 0.42 + 0.58 * Math.pow(valueNoise(x * 34 + center * 13), 1.25);
  return amp * (bell * 0.45 + gate * 0.55) * syll;
}

function envelope(x) {
  return Math.min(
    1,
    0.035 +
      phrase(x, 0.11, 0.055, 0.42) +
      phrase(x, 0.22, 0.07, 0.78) +
      phrase(x, 0.34, 0.085, 0.96) +
      phrase(x, 0.46, 0.04, 0.38) +
      phrase(x, 0.58, 0.09, 0.82) +
      phrase(x, 0.73, 0.065, 0.58) +
      phrase(x, 0.88, 0.05, 0.36)
  );
}

function peakAt(x, salt) {
  const env = envelope(x);
  const grain = 0.22 + 0.78 * Math.pow(fbm(x * 92 + salt), 0.62);
  const plosive = Math.pow(valueNoise(x * 48 + salt * 3.1), 10) * 0.45;
  return Math.min(1, Math.max(0.012, env * grain + plosive * env));
}

const density = Math.max(1, Math.floor(pencil.input.density || 2));
const seed = pencil.input.seed || 7;
const color = pencil.input.color || "#A3A3A3";
const cols = Math.max(8, Math.floor(pencil.width / density));
const barW = Math.max(1, density - 1);
const nodes = [];

nodes.push({
  type: "rectangle",
  name: "Zero Line",
  x: 0,
  y: Math.floor(pencil.height * 0.5),
  width: pencil.width,
  height: 1,
  fill: color,
  opacity: 0.28,
});

for (let i = 0; i < cols; i++) {
  const x = (i + 0.5) / cols;
  const maxAmp = peakAt(x + seed * 0.001, seed);
  const minAmp = peakAt(x + seed * 0.001, seed + 17.83) * 0.92;
  const maxH = maxAmp * pencil.height * 0.47;
  const minH = minAmp * pencil.height * 0.47;
  nodes.push({
    type: "rectangle",
    name: "Peak " + i,
    x: i * density,
    y: pencil.height * 0.5 - maxH,
    width: barW,
    height: Math.max(1, maxH + minH),
    fill: color,
  });
}

return nodes;
