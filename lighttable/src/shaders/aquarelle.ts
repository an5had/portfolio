/* Watercolor / ink-bleed reveal material. Put it on a textured plane and animate
   uProgress 0→1 (via GSAP tied to scroll) to bloom an image in like ink through wet
   paper. See references/shaders.md. Plain <img> is the fallback when WebGL is absent. */
import * as THREE from 'three';

const vertex = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const fragment = /* glsl */`
  uniform sampler2D uTexture;
  uniform float uProgress, uTime, uEdge, uNoiseScale;
  uniform vec3 uInk;
  varying vec2 vUv;

  // cheap value-noise fbm
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), u.x),
               mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
  }
  float fbm(vec2 p){ float s=0.0, a=0.5; for(int i=0;i<5;i++){ s+=a*noise(p); p*=2.0; a*=0.5; } return s; }

  void main() {
    vec2 warp = vec2(fbm(vUv * uNoiseScale + uTime * 0.05)) - 0.5;   // wet, uneven edges
    vec2 uv = vUv + warp * 0.02;
    float n = fbm(vUv * uNoiseScale * 1.3);
    float reveal = smoothstep(n - uEdge, n + uEdge, uProgress);      // bleed mask
    float ring = 1.0 - smoothstep(0.0, uEdge, abs(reveal - 0.5));    // pigment at the boundary
    vec3 col = texture2D(uTexture, uv).rgb;
    col = mix(col, uInk, ring * 0.6);
    gl_FragColor = vec4(col, reveal);
  }
`;

export function aquarelleMaterial(texture: THREE.Texture, ink = new THREE.Color('#20303a')) {
  return new THREE.ShaderMaterial({
    transparent: true, vertexShader: vertex, fragmentShader: fragment,
    uniforms: {
      uTexture: { value: texture },
      uProgress: { value: 0 }, uTime: { value: 0 },
      uEdge: { value: 0.08 }, uNoiseScale: { value: 6.0 },
      uInk: { value: ink },
    },
  });
}
