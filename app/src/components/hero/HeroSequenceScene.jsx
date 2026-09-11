/* The hero clip rendered through Three.js as a scrubbable image sequence.
   Scroll progress picks a frame; the best loaded version of it (display tier, else the lq preview,
   else the nearest preview frame) is uploaded to ONE texture — swapping the source, never
   allocating a texture per frame. It re-uploads when the frame changes OR when a sharper version
   of the current frame arrives, so the hero sharpens in place as the high tier streams in. */
import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ScreenQuad } from '@react-three/drei';
import * as THREE from 'three';
import { HERO, frameForProgress } from './heroMap.js';

const vertexShader = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;
/* Deliberately NO grading here — no vignette, no grain. The footage is already
   lit and graded; stacking effects on it just muddies the image. The shader's
   only job is cover-fit. Contrast for the end titles comes from a scrim that
   fades in only during the reveal, so it never dims the clip itself. */
const fragmentShader = /* glsl */`
  uniform sampler2D uTex; uniform vec2 uVideo; uniform vec2 uScreen;
  varying vec2 vUv;
  void main() {
    float sA = uScreen.x / uScreen.y, vA = uVideo.x / uVideo.y;
    vec2 uv = vUv;                                  // object-fit: cover
    if (sA > vA) uv.y = (uv.y - 0.5) * (vA / sA) + 0.5;
    else         uv.x = (uv.x - 0.5) * (sA / vA) + 0.5;
    gl_FragColor = vec4(texture2D(uTex, uv).rgb, 1.0);
  }
`;

function bestImage(low, high, idx) {
  if (high[idx]) return high[idx];
  if (low[idx]) return low[idx];
  for (let d = 1; d < low.length; d++) {          // still streaming: nearest preview frame
    if (low[idx - d]) return low[idx - d];
    if (low[idx + d]) return low[idx + d];
  }
  return null;
}

function SequenceQuad({ lowRef, highRef, progressRef }) {
  const matRef = useRef();
  const lastImg = useRef(null);
  const { size } = useThree();

  const texture = useMemo(() => {
    const t = new THREE.Texture();
    // Left in linear (no sRGB decode) on purpose. Paired with <Canvas linear flat>
    // this is a pure passthrough blit, so the frames render byte-identical to the
    // source instead of being darkened by a colour-space round-trip.
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.generateMipmaps = false;
    return t;
  }, []);

  const uniforms = useMemo(() => ({
    uTex: { value: texture },
    uVideo: { value: new THREE.Vector2(HERO.videoW, HERO.videoH) },
    uScreen: { value: new THREE.Vector2(1, 1) },
  }), [texture]);

  useFrame(() => {
    const idx = frameForProgress(progressRef.current || 0);
    const img = bestImage(lowRef.current, highRef.current, idx);
    if (img && img !== lastImg.current && img.complete && img.naturalWidth) {
      texture.image = img;
      texture.needsUpdate = true;          // upload only when the source actually changes
      lastImg.current = img;
    }
    if (matRef.current) matRef.current.uniforms.uScreen.value.set(size.width, size.height);
  });

  return (
    <ScreenQuad>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthTest={false}
        depthWrite={false}
      />
    </ScreenQuad>
  );
}

export default function HeroSequenceScene({ lowRef, highRef, progressRef }) {
  return (
    <Canvas
      className="hero-gl"
      dpr={[1, 2]}
      flat                                   /* no ACES tone mapping */
      linear                                 /* no sRGB encode — exact passthrough of the frames */
      gl={{ antialias: false }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      frameloop="always"
    >
      <SequenceQuad lowRef={lowRef} highRef={highRef} progressRef={progressRef} />
    </Canvas>
  );
}
