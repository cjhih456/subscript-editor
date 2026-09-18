precision mediump float;

/** @resolution */
uniform vec2 u_resolution;

/**
 * @label Magenta
 * @color
 * @default #EC4899
 */
uniform vec3 u_magenta;

/**
 * @label Blue
 * @color
 * @default #2563EB
 */
uniform vec3 u_blue;

/**
 * @label Playhead
 * @range 0.0, 1.0
 * @default 0.38
 */
uniform float u_playhead;

float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float valueNoise(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(hash(i), hash(i + 1.0), u);
}

float fbm(float x) {
  float v = 0.0;
  v += 0.50 * valueNoise(x);
  v += 0.25 * valueNoise(x * 2.11 + 19.2);
  v += 0.13 * valueNoise(x * 4.27 + 41.7);
  v += 0.07 * valueNoise(x * 8.53 + 73.1);
  return v;
}

float phrase(float x, float center, float width, float amp) {
  float d = abs(x - center) / max(width, 0.001);
  float bell = exp(-d * d * 2.6);
  float attack = smoothstep(center - width, center - width * 0.35, x);
  float release = 1.0 - smoothstep(center + width * 0.2, center + width, x);
  float gate = min(attack, release);
  float syll = 0.42 + 0.58 * pow(valueNoise(x * 34.0 + center * 13.0), 1.25);
  return amp * mix(bell, gate, 0.55) * syll;
}

float envelope(float x) {
  float e = 0.035;
  e += phrase(x, 0.11, 0.055, 0.42);
  e += phrase(x, 0.22, 0.070, 0.78);
  e += phrase(x, 0.34, 0.085, 0.96);
  e += phrase(x, 0.46, 0.040, 0.38);
  e += phrase(x, 0.58, 0.090, 0.82);
  e += phrase(x, 0.73, 0.065, 0.58);
  e += phrase(x, 0.88, 0.050, 0.36);
  return clamp(e, 0.0, 1.0);
}

float peakAt(float x, float salt) {
  float env = envelope(x);
  float grain = 0.22 + 0.78 * pow(fbm(x * 92.0 + salt), 0.62);
  float plosive = pow(valueNoise(x * 48.0 + salt * 3.1), 10.0) * 0.45;
  return clamp(env * grain + plosive * env, 0.012, 1.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float colW = 2.0;
  float col = floor(gl_FragCoord.x / colW);
  float x = (col + 0.5) * colW / u_resolution.x;

  float maxAmp = peakAt(x, 0.0);
  float minAmp = peakAt(x, 17.83) * 0.92;

  float aa = 1.5 / u_resolution.y;
  float top = 0.5 + maxAmp * 0.47;
  float bot = 0.5 - minAmp * 0.47;
  float body = smoothstep(bot - aa, bot + aa, uv.y) * (1.0 - smoothstep(top - aa, top + aa, uv.y));

  float gap = step(mod(gl_FragCoord.x, colW), colW - 0.75);
  body *= gap;

  float zeroLine = 1.0 - smoothstep(0.0, 1.2 / u_resolution.y, abs(uv.y - 0.5));
  zeroLine *= 0.22;

  vec3 colA = mix(u_blue, u_magenta, smoothstep(0.15, 0.85, x));
  vec3 bg = vec3(0.035, 0.045, 0.08);
  float played = 1.0 - smoothstep(u_playhead, u_playhead + 0.004, x);
  vec3 wave = mix(colA * 0.42, colA, 0.35 + 0.65 * played);
  wave *= 0.75 + 0.25 * maxAmp;

  vec3 rgb = mix(bg, wave, body);
  rgb += vec3(0.75, 0.82, 0.95) * zeroLine * (1.0 - body * 0.5);

  float peakGlow = body * smoothstep(0.62, 0.95, max(maxAmp, minAmp)) * 0.22;
  rgb += colA * peakGlow;

  float ph = abs(uv.x - u_playhead);
  rgb += vec3(1.0, 0.30, 0.62) * (1.0 - smoothstep(0.0, 0.0035, ph));
  rgb += vec3(1.0, 0.30, 0.62) * exp(-ph * 55.0) * 0.28;

  gl_FragColor = vec4(rgb, 1.0);
}
