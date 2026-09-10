/* The hero video, rendered through Three.js as a scrubbable VideoTexture on a
   full-screen quad. currentTime is driven by scroll progress (eased), and a small
   shader adds cover-fit, a soft vignette and faint film grain. All-intra encoding
   of hero.mp4 makes the per-frame seeking smooth. */
import { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ScreenQuad } from '@react-three/drei';
import * as THREE from 'three';
import { videoTimeForProgress } from './heroMap.js';

const vertexShader = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;
const fragmentShader = /* glsl */`
  uniform sampler2D uTex; uniform vec2 uVideo; uniform vec2 uScreen; uniform float uTime;
  varying vec2 vUv;
  float rand(vec2 c){ return fract(sin(dot(c, vec2(12.9898,78.233))) * 43758.5453); }
  void main() {
    float sA = uScreen.x / uScreen.y, vA = uVideo.x / uVideo.y;
    vec2 uv = vUv;                                  // object-fit: cover
    if (sA > vA) uv.y = (uv.y - 0.5) * (vA / sA) + 0.5;
    else         uv.x = (uv.x - 0.5) * (sA / vA) + 0.5;
    vec3 col = texture2D(uTex, uv).rgb;
    col += (rand(vUv + fract(uTime)) - 0.5) * 0.035;             // grain
    float d = distance(vUv, vec2(0.5));
    col *= 0.62 + 0.38 * smoothstep(0.95, 0.30, d);              // vignette
    gl_FragColor = vec4(col, 1.0);
  }
`;

function VideoQuad({ video, progressRef }) {
  const matRef = useRef();
  const timeRef = useRef(0);
  const { size } = useThree();

  const texture = useMemo(() => {
    const t = new THREE.VideoTexture(video);
    t.colorSpace = THREE.SRGBColorSpace;
    t.minFilter = THREE.LinearFilter;
    return t;
  }, [video]);

  const uniforms = useMemo(() => ({
    uTex: { value: texture },
    uVideo: { value: new THREE.Vector2(1280, 720) },
    uScreen: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
  }), [texture]);

  useFrame((state) => {
    const p = progressRef.current || 0;
    const target = videoTimeForProgress(p);
    timeRef.current += (target - timeRef.current) * 0.2;         // ease the scrub
    if (video.readyState >= 2) {
      if (Math.abs(video.currentTime - timeRef.current) > 0.004) {
        try { video.currentTime = timeRef.current; } catch {}
      }
      texture.needsUpdate = true;
    }
    if (matRef.current) {
      matRef.current.uniforms.uScreen.value.set(size.width, size.height);
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
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

export default function HeroVideoScene({ video, progressRef }) {
  useEffect(() => {
    // We own currentTime — make sure the browser never plays it on its own.
    video.pause();
    const stop = () => video.pause();
    video.addEventListener('play', stop);
    return () => video.removeEventListener('play', stop);
  }, [video]);

  return (
    <Canvas
      className="hero-gl"
      dpr={[1, 2]}
      gl={{ antialias: false }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      frameloop="always"
    >
      <VideoQuad video={video} progressRef={progressRef} />
    </Canvas>
  );
}
