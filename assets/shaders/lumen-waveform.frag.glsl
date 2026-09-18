precision mediump float;

uniform vec2 u_resolution;
uniform vec3 u_magenta;
uniform vec3 u_blue;
uniform float u_playhead;
uniform sampler2D u_wave;
uniform float u_hasData;
uniform float u_showPlayhead;

varying vec2 vUv;

void main() {
  // vUv spans the full canvas; use it for horizontal mapping so DPR never clips to 50%
  vec2 uv = vUv;
  float x = uv.x;

  float colW = 2.0;
  float px = uv.x * max(u_resolution.x, 1.0);

  vec2 sampleAmp = texture2D(u_wave, vec2(clamp(x, 0.0, 1.0), 0.5)).rg;
  float maxAmp = mix(0.0, sampleAmp.r, u_hasData);
  float minAmp = mix(0.0, sampleAmp.g, u_hasData);

  float aa = 1.5 / max(u_resolution.y, 1.0);
  float top = 0.5 + maxAmp * 0.47;
  float bot = 0.5 - minAmp * 0.47;
  float body = smoothstep(bot - aa, bot + aa, uv.y) * (1.0 - smoothstep(top - aa, top + aa, uv.y));

  float gap = step(mod(px, colW), colW - 0.75);
  body *= gap * u_hasData;

  float zeroLine = 1.0 - smoothstep(0.0, 1.2 / max(u_resolution.y, 1.0), abs(uv.y - 0.5));
  zeroLine *= 0.22;

  vec3 colA = mix(u_blue, u_magenta, smoothstep(0.15, 0.85, x));
  // Always tint the host so full-width coverage is visible even without waveData
  vec3 bg = mix(vec3(0.035, 0.045, 0.08), colA * 0.12, 0.55);
  float played = 1.0 - smoothstep(u_playhead, u_playhead + 0.004, x);
  vec3 wave = mix(colA * 0.42, colA, 0.35 + 0.65 * played);
  wave *= 0.75 + 0.25 * maxAmp;

  vec3 rgb = mix(bg, wave, body);
  rgb += vec3(0.75, 0.82, 0.95) * zeroLine * (1.0 - body * 0.5);

  float peakGlow = body * smoothstep(0.62, 0.95, max(maxAmp, minAmp)) * 0.22;
  rgb += colA * peakGlow;

  if (u_showPlayhead > 0.5) {
    float ph = abs(uv.x - u_playhead);
    rgb += vec3(1.0, 0.30, 0.62) * (1.0 - smoothstep(0.0, 0.0035, ph));
    rgb += vec3(1.0, 0.30, 0.62) * exp(-ph * 55.0) * 0.28;
  }

  gl_FragColor = vec4(rgb, 1.0);
}
