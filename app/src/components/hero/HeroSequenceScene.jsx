/* The hero clip rendered through Three.js as a scrubbable image sequence.
   Scroll progress picks a frame; the best loaded version of it is drawn.

   TWO textures, one per size — never one texture fed images of different sizes. On WebGL2,
   three.js allocates IMMUTABLE storage (texStorage2D) at the first upload's dimensions and later
   uploads use texSubImage2D into that storage. Feeding a 1920px frame into a texture that was
   first allocated for a 640px preview fails silently (INVALID_VALUE) — the picture freezes on
   the last preview frame once the high tier has streamed in. So: the preview texture only ever
   receives preview frames, the display texture only ever receives display-tier frames, and the
   shader samples whichever holds the best version of the current frame. */
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

function makeTexture() {
  const t = new THREE.Texture();
  // Left in linear (no sRGB decode) on purpose. Paired with <Canvas linear flat>
  // this is a pure passthrough blit, so the frames render byte-identical to the
  // source instead of being darkened by a colour-space round-trip.
  t.minFilter = THREE.LinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.generateMipmaps = false;
  return t;
}

const usable = (img) => img && img.complete && img.naturalWidth > 0;

function nearestPreview(low, idx) {
  if (usable(low[idx])) return low[idx];
  for (let d = 1; d < low.length; d++) {          // still streaming: nearest preview frame
    if (usable(low[idx - d])) return low[idx - d];
    if (usable(low[idx + d])) return low[idx + d];
  }
  return null;
}

function SequenceQuad({ lowRef, highRef, progressRef }) {
  const matRef = useRef();
  const shown = useRef({ low: null, high: null });
  const { size } = useThree();

  const lowTex = useMemo(makeTexture, []);
  const highTex = useMemo(makeTexture, []);

  const uniforms = useMemo(() => ({
    uTex: { value: lowTex },
    uVideo: { value: new THREE.Vector2(HERO.videoW, HERO.videoH) },
    uScreen: { value: new THREE.Vector2(1, 1) },
  }), [lowTex]);

  useFrame(() => {
    const idx = frameForProgress(progressRef.current || 0);
    const hi = highRef.current[idx];

    if (usable(hi)) {
      if (hi !== shown.current.high) {              // upload only when the source changes
        highTex.image = hi;
        highTex.needsUpdate = true;
        shown.current.high = hi;
      }
      uniforms.uTex.value = highTex;
    } else {
      const lo = nearestPreview(lowRef.current, idx);
      if (lo) {
        if (lo !== shown.current.low) {
          lowTex.image = lo;
          lowTex.needsUpdate = true;
          shown.current.low = lo;
        }
        uniforms.uTex.value = lowTex;
      }
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

export default function HeroSequenceScene({ lowRef, highRef, progressRef, live = true }) {
  return (
    <Canvas
      className="hero-gl"
      dpr={[1, 2]}
      flat                                   /* no ACES tone mapping */
      linear                                 /* no sRGB encode — exact passthrough of the frames */
      gl={{ antialias: false }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      frameloop={live ? 'always' : 'never'}  /* paused once scrolled away, so the next section's WebGL gets the GPU */
    >
      <SequenceQuad lowRef={lowRef} highRef={highRef} progressRef={progressRef} />
    </Canvas>
  );
}
