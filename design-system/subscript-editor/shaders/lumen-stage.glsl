precision mediump float;

/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

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

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= u_resolution.x / u_resolution.y;

  float t = u_time * 0.15;
  vec3 base = vec3(0.03, 0.04, 0.07);
  vec3 wash = mix(u_blue, u_magenta, 0.5 + 0.5 * sin(t));
  float radial = 1.0 - smoothstep(0.2, 1.35, length(p));
  vec3 rgb = mix(base, wash * 0.22, radial);

  float grain = hash(gl_FragCoord.xy + vec2(u_time * 40.0, 0.0)) * 0.05;
  rgb += grain;

  float vig = smoothstep(1.25, 0.35, length(p));
  rgb *= vig;

  float scan = 0.97 + 0.03 * sin(uv.y * u_resolution.y * 1.4 + u_time * 8.0);
  rgb *= scan;

  gl_FragColor = vec4(rgb, 1.0);
}
