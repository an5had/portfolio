import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const mat = (c, m, r, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, metalness: m, roughness: r }, o || {}));

function buildCamera() {
  const g = new THREE.Group();
  const body = mat(0x17181e, 0.72, 0.34), dark = mat(0x070809, 0.5, 0.5), metal = mat(0xb9c0c9, 1, 0.22);
  const glass = mat(0x0a1733, 1, 0.04, { emissive: 0x16345f, emissiveIntensity: 0.55 });

  g.add(new THREE.Mesh(new RoundedBoxGeometry(3.3, 2.1, 1.2, 6, 0.16), body));
  const grip = new THREE.Mesh(new RoundedBoxGeometry(0.72, 2.0, 1.25, 5, 0.24), dark); grip.position.x = 1.65; g.add(grip);
  const prism = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.7, 0.95, 4, 0.1), body); prism.position.set(-0.15, 1.2, 0); g.add(prism);
  const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.5), metal); shoe.position.set(-0.15, 1.6, 0); g.add(shoe);
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.2, 36), dark); dial.position.set(-1.2, 1.2, -0.1); g.add(dial);
  const shutter = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.14, 28), metal); shutter.position.set(1.15, 1.18, 0.25); g.add(shutter);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 12, 28), mat(0xff5630, 0.4, 0.4)); ring.rotation.x = Math.PI / 2; ring.position.set(1.15, 1.12, 0.25); g.add(ring);

  const lens = new THREE.Group();
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.92, 1.5, 56), dark); barrel.rotation.x = Math.PI / 2; barrel.position.z = 0.92; lens.add(barrel);
  [0.66, 1.04].forEach((z) => { const r2 = new THREE.Mesh(new THREE.CylinderGeometry(0.94, 0.94, 0.16, 56), body); r2.rotation.x = Math.PI / 2; r2.position.z = z; lens.add(r2); });
  const fr = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.09, 18, 56), metal); fr.position.z = 1.66; lens.add(fr);
  const gl = new THREE.Mesh(new THREE.SphereGeometry(0.78, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.32), glass); gl.rotation.x = -Math.PI / 2; gl.position.z = 1.62; lens.add(gl);
  g.add(lens);
  return g;
}

function Env() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    return () => pmrem.dispose();
  }, [gl, scene]);
  return null;
}

function CameraModel() {
  const group = useMemo(() => buildCamera(), []);
  const ref = useRef();
  const scrollP = useRef(0);
  const grown = useRef(0);

  useEffect(() => {
    if (ref.current) ref.current.scale.setScalar(0);
    const onScroll = () => { scrollP.current = Math.min(1, window.scrollY / window.innerHeight); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime, p = scrollP.current, o = ref.current;
    if (!o) return;
    grown.current = Math.min(1, grown.current + dt * 0.75);
    const s = 1 - Math.pow(1 - grown.current, 3);
    o.scale.setScalar(s);
    o.position.set(1.7 + Math.sin(t * 0.5) * 0.06, 1.0 + Math.sin(t * 0.8) * 0.12 - p * 2.4, 0);
    o.rotation.set(0.15 + p * 0.5, -0.6 + Math.sin(t * 0.4) * 0.12 + p * 1.5, 0.04);
  });

  return <primitive object={group} ref={ref} />;
}

export default function Scene() {
  return (
    <Canvas
      className="hero-canvas"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 9], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.15; }}
    >
      <Env />
      <ambientLight intensity={0.6} color="#3a4055" />
      <directionalLight position={[5, 6, 8]} intensity={2.6} />
      <directionalLight position={[-7, 2, -5]} intensity={1.8} color="#6f8cff" />
      <pointLight position={[-3, -2, 4]} intensity={12} distance={30} color="#ff7a4d" />
      <CameraModel />
    </Canvas>
  );
}
