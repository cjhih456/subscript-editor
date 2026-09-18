precision mediump float;

uniform vec2 u_resolution;
uniform vec3 u_magenta;
uniform vec3 u_blue;
uniform float u_playhead;
uniform sampler2D u_wave;
uniform float u_hasData;
uniform float u_showPlayhead;
uniform float u_light;

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
  zeroLine *= mix(0.22, 0.18, u_light);

  vec3 colA = mix(u_blue, u_magenta, smoothstep(0.15, 0.85, x));
  // Dark: #07090F-ish base; Light: #F6F4F8 base — brand wash keeps empty host readable
  vec3 bgBase = mix(vec3(0.035, 0.045, 0.08), vec3(0.965, 0.957, 0.973), u_light);
  vec3 bgWash = colA * mix(0.12, 0.22, u_light);
  vec3 bg = mix(bgBase, bgWash, mix(0.55, 0.35, u_light));

  float played = 1.0 - smoothstep(u_playhead, u_playhead + 0.004, x);
  float waveLo = mix(0.42, 0.55, u_light);
  float waveMix = mix(0.35, 0.4, u_light) + mix(0.65, 0.6, u_light) * played;
  vec3 wave = mix(colA * waveLo, colA, waveMix);
  wave *= mix(0.75, 0.7, u_light) + mix(0.25, 0.3, u_light) * maxAmp;

  vec3 rgb = mix(bg, wave, body);
  vec3 zeroTint = mix(vec3(0.75, 0.82, 0.95), vec3(0.35, 0.4, 0.55), u_light);
  rgb += zeroTint * zeroLine * (1.0 - body * 0.5);

  float peakGlow = body * smoothstep(0.62, 0.95, max(maxAmp, minAmp)) * mix(0.22, 0.18, u_light);
  rgb += colA * peakGlow;

  if (u_showPlayhead > 0.5) {
    float ph = abs(uv.x - u_playhead);
    vec3 phCol = mix(vec3(1.0, 0.30, 0.62), vec3(0.93, 0.28, 0.6), u_light);
    rgb += phCol * (1.0 - smoothstep(0.0, 0.0035, ph));
    rgb += phCol * exp(-ph * 55.0) * mix(0.28, 0.22, u_light);
  }

  gl_FragColor = vec4(rgb, 1.0);
}
