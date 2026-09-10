import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, SoftShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

/* ============================================================
   procedural textures (no external assets)
   ============================================================ */
function woodTexture(base = '#5a3a20', grain = '#3a2412', rep = [1, 1]) {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = base;
  g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 2 + Math.random() * 5) {
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= 512; x += 14) g.lineTo(x, y + Math.sin(x * 0.02 + y * 0.4) * 2.4);
    g.strokeStyle = `rgba(30,18,8,${0.05 + Math.random() * 0.13})`;
    g.lineWidth = 0.6 + Math.random() * 1.6;
    g.stroke();
  }
  for (let i = 0; i < 7; i++) {
    g.beginPath();
    const yy = Math.random() * 512;
    g.ellipse(Math.random() * 512, yy, 4 + Math.random() * 5, 14 + Math.random() * 18, 0, 0, Math.PI * 2);
    g.strokeStyle = 'rgba(25,15,7,0.22)';
    g.lineWidth = 1.5;
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rep[0], rep[1]);
  t.anisotropy = 8;
  return t;
}

function grainTexture(base = '#241710', dark = 18, rep = [3, 3]) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = base;
  g.fillRect(0, 0, 256, 256);
  const img = g.getImageData(0, 0, 256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * dark;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rep[0], rep[1]);
  return t;
}

function radialTexture(inner = 'rgba(255,247,230,1)', mid = 'rgba(255,236,205,0.5)') {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, inner);
  grd.addColorStop(0.45, mid);
  grd.addColorStop(1, 'rgba(255,236,205,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function scanlineTexture() {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#000';
  for (let y = 0; y < 256; y += 3) g.fillRect(0, y, 4, 1);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, 20);
  return t;
}

/* ============================================================
   environment shell
   ============================================================ */
function Room() {
  const floor = useMemo(() => woodTexture('#4a3018', '#2c1c0e', [5, 5]), []);
  const wall = useMemo(() => grainTexture('#241a12', 16, [2, 2]), []);
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -0.4]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial map={floor} roughness={0.78} metalness={0.04} color="#7a5230" />
      </mesh>
      {/* back wall */}
      <mesh position={[0, 4.5, -3.2]} receiveShadow>
        <planeGeometry args={[30, 12]} />
        <meshStandardMaterial map={wall} roughness={0.95} color="#3a2a1e" />
      </mesh>
      {/* left wall */}
      <mesh position={[-5.6, 4.5, 0]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[18, 12]} />
        <meshStandardMaterial map={wall} roughness={0.95} color="#33241a" />
      </mesh>
      {/* baseboards */}
      <mesh position={[0, 0.18, -3.16]}>
        <boxGeometry args={[30, 0.36, 0.08]} />
        <meshStandardMaterial color="#2a1c10" roughness={0.7} />
      </mesh>
      <mesh position={[-5.54, 0.18, 0]} rotation-y={Math.PI / 2}>
        <boxGeometry args={[18, 0.36, 0.08]} />
        <meshStandardMaterial color="#2a1c10" roughness={0.7} />
      </mesh>
      {/* ceiling (very dark, just for enclosure) */}
      <mesh rotation-x={Math.PI / 2} position={[0, 6.4, -0.4]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#150f0a" roughness={1} />
      </mesh>
    </group>
  );
}

function Rug() {
  const fab = useMemo(() => grainTexture('#6a2e22', 26, [2, 2]), []);
  return (
    <group position={[0, 0.012, 0.5]}>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[2.7, 64]} />
        <meshStandardMaterial map={fab} color="#7a3326" roughness={0.96} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 0]}>
        <ringGeometry args={[2.35, 2.5, 64]} />
        <meshStandardMaterial color="#d9b07a" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Window() {
  const glow = useMemo(() => radialTexture('rgba(150,180,235,0.5)', 'rgba(120,150,210,0.18)'), []);
  return (
    <group position={[-5.5, 3.2, -0.8]} rotation-y={Math.PI / 2}>
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[3.0, 3.2, 0.12]} />
        <meshStandardMaterial color="#241910" roughness={0.7} />
      </mesh>
      {/* cool night sky */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[2.7, 2.9]} />
        <meshBasicMaterial color="#2a3a58" toneMapped={false} />
      </mesh>
      {/* moon */}
      <mesh position={[0.6, 0.7, 0.04]}>
        <circleGeometry args={[0.28, 32]} />
        <meshBasicMaterial color="#cdd9f2" toneMapped={false} />
      </mesh>
      {/* muntins */}
      {[-0.9, 0, 0.9].map((y, i) => (
        <mesh key={i} position={[0, y, 0.05]}><boxGeometry args={[2.7, 0.05, 0.04]} /><meshStandardMaterial color="#1c130b" /></mesh>
      ))}
      <mesh position={[0, 0, 0.05]}><boxGeometry args={[0.05, 2.9, 0.04]} /><meshStandardMaterial color="#1c130b" /></mesh>
      <sprite position={[0, 0, 0.5]} scale={[5, 5, 1]}>
        <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.5} />
      </sprite>
    </group>
  );
}

/* ============================================================
   desk + computer
   ============================================================ */
function Desk() {
  const top = useMemo(() => woodTexture('#6b4426', '#3e2613', [2, 1]), []);
  const side = useMemo(() => woodTexture('#5e3c20', '#39230f', [1, 1]), []);
  return (
    <group position={[0, 0, -1.55]}>
      <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.2, 0.1, 2.2]} />
        <meshStandardMaterial map={top} color="#8a5c34" roughness={0.5} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[5.0, 0.04, 2.05]} />
        <meshStandardMaterial color="#4e3018" roughness={0.7} />
      </mesh>
      {/* drawer block on the right */}
      <group position={[1.7, 0.55, -0.1]}>
        <mesh castShadow><boxGeometry args={[1.2, 0.78, 1.7]} /><meshStandardMaterial map={side} color="#5e3c20" roughness={0.6} /></mesh>
        {[0.22, -0.05, -0.32].map((y, i) => (
          <group key={i} position={[0, y, 0.86]}>
            <mesh><boxGeometry args={[1.0, 0.2, 0.03]} /><meshStandardMaterial color="#4a2e16" roughness={0.6} /></mesh>
            <mesh position={[0, 0, 0.03]}><boxGeometry args={[0.3, 0.03, 0.05]} /><meshStandardMaterial color="#c9a06a" metalness={0.7} roughness={0.35} /></mesh>
          </group>
        ))}
      </group>
      {/* legs (left side, since right has drawers) */}
      {[[-2.4, -0.85], [-2.4, 0.85]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.45, z]} castShadow><boxGeometry args={[0.14, 0.9, 0.14]} /><meshStandardMaterial color="#3e2613" roughness={0.6} /></mesh>
      ))}
    </group>
  );
}

function Monitor({ glowRef }) {
  const screen = useRef();
  const halo = useRef();
  const scan = useMemo(() => scanlineTexture(), []);
  const glowTex = useMemo(() => radialTexture('rgba(245,250,255,0.95)', 'rgba(200,225,255,0.5)'), []);
  useFrame(() => {
    const g = glowRef.current;
    if (screen.current) screen.current.material.emissiveIntensity = 1.4 + g * 5;
    if (halo.current) halo.current.material.opacity = 0.35 + g * 0.6;
  });
  return (
    <group position={[0, 0, -2.35]}>
      {/* deep body */}
      <RoundedBox args={[2.05, 1.6, 1.2]} radius={0.1} smoothness={4} position={[0, 1.6, -0.35]} castShadow>
        <meshStandardMaterial color="#cdbf9f" roughness={0.55} metalness={0.05} />
      </RoundedBox>
      {/* tapered neck to the back */}
      <mesh position={[0, 1.6, -1.0]} castShadow><boxGeometry args={[1.2, 0.95, 0.45]} /><meshStandardMaterial color="#bfb191" roughness={0.6} /></mesh>
      {/* top vents */}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} position={[-0.5 + i * 0.125, 2.41, -0.35]}><boxGeometry args={[0.06, 0.012, 0.7]} /><meshStandardMaterial color="#9c8f72" roughness={0.7} /></mesh>
      ))}
      {/* front bezel */}
      <RoundedBox args={[2.05, 1.6, 0.16]} radius={0.1} smoothness={4} position={[0, 1.6, 0.28]}><meshStandardMaterial color="#c2b491" roughness={0.5} /></RoundedBox>
      {/* recessed screen well */}
      <mesh position={[0, 1.64, 0.3]}><boxGeometry args={[1.66, 1.2, 0.06]} /><meshStandardMaterial color="#181410" roughness={0.4} /></mesh>
      {/* glowing CRT screen */}
      <mesh ref={screen} position={[0, 1.64, 0.36]}>
        <planeGeometry args={[1.6, 1.16]} />
        <meshStandardMaterial color="#ffffff" emissive="#fdf2da" emissiveIntensity={1.6} toneMapped={false} roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.64, 0.37]}>
        <planeGeometry args={[1.6, 1.16]} />
        <meshBasicMaterial map={scan} transparent opacity={0.14} depthWrite={false} />
      </mesh>
      {/* faint homepage UI hint */}
      <mesh position={[-0.36, 1.95, 0.375]}><planeGeometry args={[0.66, 0.07]} /><meshBasicMaterial color="#ffc7a2" transparent opacity={0.5} toneMapped={false} depthWrite={false} /></mesh>
      <mesh position={[-0.18, 1.78, 0.375]}><planeGeometry args={[1.0, 0.045]} /><meshBasicMaterial color="#cfe0ff" transparent opacity={0.4} toneMapped={false} depthWrite={false} /></mesh>
      <mesh position={[-0.3, 1.67, 0.375]}><planeGeometry args={[0.66, 0.045]} /><meshBasicMaterial color="#cfe0ff" transparent opacity={0.3} toneMapped={false} depthWrite={false} /></mesh>
      {/* brand strip + buttons */}
      <mesh position={[0, 0.86, 0.37]}><boxGeometry args={[2.0, 0.18, 0.02]} /><meshStandardMaterial color="#b6a886" roughness={0.6} /></mesh>
      <mesh position={[-0.7, 0.86, 0.38]}><planeGeometry args={[0.34, 0.06]} /><meshBasicMaterial color="#6b5f48" toneMapped={false} /></mesh>
      {[0.4, 0.56, 0.72].map((x, i) => (
        <mesh key={i} position={[x, 0.86, 0.38]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.03, 0.03, 0.03, 14]} /><meshStandardMaterial color="#8f8166" roughness={0.5} /></mesh>
      ))}
      {/* power LED */}
      <mesh position={[0.88, 0.86, 0.38]}><sphereGeometry args={[0.028, 12, 12]} /><meshBasicMaterial color="#7dff9a" toneMapped={false} /></mesh>
      {/* stand */}
      <mesh position={[0, 0.86, -0.1]}><cylinderGeometry args={[0.36, 0.5, 0.12, 24]} /><meshStandardMaterial color="#bfb191" roughness={0.6} /></mesh>
      {/* sticky note on the bezel */}
      <mesh position={[0.78, 1.95, 0.37]} rotation-z={-0.12}><planeGeometry args={[0.26, 0.26]} /><meshStandardMaterial color="#ffd86b" emissive="#5a4a18" emissiveIntensity={0.2} roughness={0.9} /></mesh>
      {/* power cable */}
      <mesh position={[0.4, 0.4, -1.1]}><tubeGeometry args={[new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.4, -0.6), new THREE.Vector3(0.1, 0, -0.7), new THREE.Vector3(0.3, -0.4, -0.3), new THREE.Vector3(0.6, -0.5, 0.4)]), 24, 0.03, 8]} /><meshStandardMaterial color="#15110c" roughness={0.6} /></mesh>
      {/* bloom halo + screen light */}
      <sprite ref={halo} position={[0, 1.64, 0.7]} scale={[3.6, 2.8, 1]}>
        <spriteMaterial map={glowTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.4} />
      </sprite>
      <pointLight position={[0, 1.7, 0.9]} color="#dcecff" intensity={9} distance={5} decay={2} />
    </group>
  );
}

function Keyboard() {
  const keys = useMemo(() => {
    const arr = [];
    const cols = 14, rows = 5;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (r === rows - 1 && (c < 2 || c > 9)) continue; // space row gap
        arr.push([(-cols / 2 + c + 0.5) * 0.092, (r - (rows - 1) / 2) * 0.092]);
      }
    }
    return arr;
  }, []);
  return (
    <group position={[0, 0.995, -1.0]} rotation-x={-0.04}>
      <RoundedBox args={[1.42, 0.08, 0.5]} radius={0.02} smoothness={3} castShadow><meshStandardMaterial color="#23232a" roughness={0.5} /></RoundedBox>
      {keys.map(([x, z], i) => (
        <RoundedBox key={i} args={[0.072, 0.05, 0.072]} radius={0.012} smoothness={2} position={[x, 0.06, -z]}>
          <meshStandardMaterial color="#33333c" roughness={0.55} />
        </RoundedBox>
      ))}
      {/* spacebar */}
      <RoundedBox args={[0.5, 0.05, 0.072]} radius={0.012} smoothness={2} position={[0, 0.06, 0.185]}><meshStandardMaterial color="#33333c" roughness={0.55} /></RoundedBox>
    </group>
  );
}

function Mouse() {
  return (
    <group position={[0.95, 0.995, -0.95]}>
      <mesh castShadow scale={[1, 0.55, 1.5]}><sphereGeometry args={[0.11, 24, 18]} /><meshStandardMaterial color="#2c2c33" roughness={0.4} /></mesh>
      <mesh position={[0, 0.06, 0.04]}><boxGeometry args={[0.012, 0.02, 0.07]} /><meshStandardMaterial color="#18181d" roughness={0.5} /></mesh>
    </group>
  );
}

function Mug() {
  const steam = useRef([]);
  useFrame(({ clock }) => {
    steam.current.forEach((s, i) => {
      if (!s) return;
      const t = (clock.elapsedTime * 0.4 + i * 0.5) % 1;
      s.position.y = 0.18 + t * 0.6;
      s.material.opacity = (1 - t) * 0.25;
      s.scale.setScalar(0.6 + t * 1.4);
    });
  });
  const steamTex = useMemo(() => radialTexture('rgba(255,255,255,0.8)', 'rgba(255,255,255,0.25)'), []);
  return (
    <group position={[-1.2, 0.995, -0.85]}>
      <mesh receiveShadow><cylinderGeometry args={[0.2, 0.18, 0.03, 24]} /><meshStandardMaterial color="#e7ddc8" roughness={0.4} /></mesh>
      <mesh position={[0, 0.13, 0]} castShadow><cylinderGeometry args={[0.135, 0.115, 0.24, 28]} /><meshStandardMaterial color="#ff5630" roughness={0.32} /></mesh>
      <mesh position={[0, 0.13, 0]}><cylinderGeometry args={[0.12, 0.1, 0.24, 28, 1, true]} /><meshStandardMaterial color="#1a0d08" roughness={0.5} side={THREE.BackSide} /></mesh>
      <mesh position={[0, 0.16, 0]}><cylinderGeometry args={[0.115, 0.115, 0.012, 24]} /><meshStandardMaterial color="#3a2014" roughness={0.3} /></mesh>
      <mesh position={[0.16, 0.13, 0]} rotation-z={Math.PI / 2}><torusGeometry args={[0.075, 0.022, 12, 24, Math.PI * 1.1]} /><meshStandardMaterial color="#e7472a" roughness={0.32} /></mesh>
      {[0, 1, 2].map((i) => (
        <sprite key={i} ref={(el) => (steam.current[i] = el)} position={[0, 0.2, 0]} scale={[0.18, 0.18, 1]}>
          <spriteMaterial map={steamTex} transparent depthWrite={false} opacity={0.2} />
        </sprite>
      ))}
    </group>
  );
}

function Lamp({ glowRef }) {
  const glow = useMemo(() => radialTexture(), []);
  const armMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2a2a30', roughness: 0.35, metalness: 0.85 }), []);
  return (
    <group position={[2.0, 0.995, -2.05]}>
      <mesh castShadow><cylinderGeometry args={[0.22, 0.26, 0.05, 24]} /><meshStandardMaterial color="#1e1e24" roughness={0.4} metalness={0.6} /></mesh>
      <mesh position={[0, 0.05, 0]} material={armMaterial}><cylinderGeometry args={[0.05, 0.06, 0.06, 16]} /></mesh>
      {/* lower arm */}
      <mesh position={[0.16, 0.5, 0.1]} rotation-z={-0.5} rotation-x={-0.1} castShadow material={armMaterial}><cylinderGeometry args={[0.028, 0.028, 0.95, 12]} /></mesh>
      <mesh position={[0.34, 0.92, 0.16]} material={armMaterial}><sphereGeometry args={[0.06, 16, 16]} /></mesh>
      {/* upper arm */}
      <mesh position={[0.55, 1.12, 0.3]} rotation-z={0.7} rotation-x={-0.25} castShadow material={armMaterial}><cylinderGeometry args={[0.025, 0.025, 0.8, 12]} /></mesh>
      <mesh position={[0.74, 0.92, 0.42]} material={armMaterial}><sphereGeometry args={[0.05, 16, 16]} /></mesh>
      {/* shade */}
      <group position={[0.86, 0.78, 0.5]} rotation-z={-1.15} rotation-y={0.5}>
        <mesh castShadow><coneGeometry args={[0.26, 0.34, 26, 1, true]} /><meshStandardMaterial color="#caa14d" roughness={0.45} metalness={0.3} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, -0.16, 0]}><cylinderGeometry args={[0.255, 0.255, 0.02, 26]} /><meshStandardMaterial color="#3a2a14" roughness={0.6} /></mesh>
        {/* bulb */}
        <mesh position={[0, -0.05, 0]}><sphereGeometry args={[0.09, 16, 16]} /><meshBasicMaterial color="#ffe2a6" toneMapped={false} /></mesh>
      </group>
      <sprite position={[0.86, 0.66, 0.62]} scale={[1.7, 1.7, 1]}>
        <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.75} />
      </sprite>
      {/* warm key light + spot for the pool of light */}
      <pointLight position={[0.86, 0.6, 0.62]} color="#ffbf73" intensity={7} distance={4.5} decay={2} />
      <spotLight position={[0.86, 0.68, 0.55]} target-position={[-0.4, -1, 0.6]} angle={0.7} penumbra={0.7} color="#ffc578" intensity={26} distance={7} decay={1.6} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} />
    </group>
  );
}

function Plant() {
  const leaves = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + Math.random();
      const r = 0.05 + Math.random() * 0.16;
      arr.push([Math.cos(a) * r, 0.28 + Math.random() * 0.5, Math.sin(a) * r, a, 0.2 + Math.random() * 0.7]);
    }
    return arr;
  }, []);
  return (
    <group position={[-2.05, 0.995, -2.0]}>
      <mesh castShadow><cylinderGeometry args={[0.22, 0.17, 0.4, 20]} /><meshStandardMaterial color="#b5603a" roughness={0.7} /></mesh>
      <mesh position={[0, 0.21, 0]}><cylinderGeometry args={[0.23, 0.23, 0.05, 20]} /><meshStandardMaterial color="#9c4f2e" roughness={0.7} /></mesh>
      <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.18, 0.18, 0.04, 16]} /><meshStandardMaterial color="#241108" roughness={1} /></mesh>
      {leaves.map(([x, y, z, rot, tilt], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[tilt, rot, 0]} scale={[0.5, 1.5, 0.12]} castShadow>
          <sphereGeometry args={[0.16, 10, 8]} />
          <meshStandardMaterial color={i % 3 === 0 ? '#4f8a40' : i % 3 === 1 ? '#5fa04c' : '#3f7536'} roughness={0.65} />
        </mesh>
      ))}
    </group>
  );
}

function DeskExtras() {
  return (
    <group>
      {/* books */}
      <group position={[1.55, 0.995, -0.95]} rotation-y={-0.25}>
        <mesh castShadow><boxGeometry args={[0.72, 0.1, 0.52]} /><meshStandardMaterial color="#355f7a" roughness={0.8} /></mesh>
        <mesh position={[0.03, 0.1, 0.02]} castShadow><boxGeometry args={[0.68, 0.09, 0.5]} /><meshStandardMaterial color="#a85a34" roughness={0.8} /></mesh>
        <mesh position={[-0.02, 0.19, -0.01]} castShadow><boxGeometry args={[0.64, 0.08, 0.48]} /><meshStandardMaterial color="#b8983e" roughness={0.8} /></mesh>
      </group>
      {/* pen cup */}
      <group position={[-1.75, 0.995, -1.2]}>
        <mesh castShadow><cylinderGeometry args={[0.1, 0.085, 0.24, 20]} /><meshStandardMaterial color="#46776a" roughness={0.5} metalness={0.2} /></mesh>
        <mesh position={[0, 0.05, 0]}><cylinderGeometry args={[0.085, 0.085, 0.01, 18]} /><meshStandardMaterial color="#10100e" /></mesh>
        {[[0.25, '#ffce5a'], [-0.18, '#ff5630'], [0.05, '#5cb8d8'], [-0.05, '#e8e8e8']].map(([r, col], i) => (
          <mesh key={i} position={[Math.sin(i) * 0.02, 0.2, 0]} rotation-z={r}><cylinderGeometry args={[0.011, 0.009, 0.36, 8]} /><meshStandardMaterial color={col} roughness={0.4} /></mesh>
        ))}
      </group>
      {/* graphics tablet + stylus */}
      <group position={[-0.05, 0.995, -0.55]} rotation-y={0.05}>
        <RoundedBox args={[0.85, 0.03, 0.58]} radius={0.03} smoothness={3} castShadow><meshStandardMaterial color="#1c1c20" roughness={0.4} /></RoundedBox>
        <mesh position={[0, 0.018, 0]}><planeGeometry args={[0.6, 0.42]} /><meshStandardMaterial color="#101014" roughness={0.3} /></mesh>
        {[-0.34, -0.24, -0.14].map((z, i) => (
          <mesh key={i} position={[-0.35, 0.02, z]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.018, 0.018, 0.006, 16]} /><meshStandardMaterial color="#33333a" /></mesh>
        ))}
        <mesh position={[0.2, 0.03, 0.18]} rotation-z={0.3} rotation-y={-0.4}><cylinderGeometry args={[0.012, 0.016, 0.34, 12]} /><meshStandardMaterial color="#23232a" roughness={0.4} /></mesh>
      </group>
      {/* headphones resting on the drawer block */}
      <group position={[2.35, 1.06, -0.55]} rotation-y={-0.3}>
        <mesh rotation-x={Math.PI / 2}><torusGeometry args={[0.22, 0.03, 12, 28, Math.PI]} /><meshStandardMaterial color="#222228" roughness={0.5} /></mesh>
        <mesh position={[0.22, -0.12, 0]}><sphereGeometry args={[0.1, 20, 16]} /><meshStandardMaterial color="#2a2a30" roughness={0.45} /></mesh>
        <mesh position={[-0.22, -0.12, 0]}><sphereGeometry args={[0.1, 20, 16]} /><meshStandardMaterial color="#2a2a30" roughness={0.45} /></mesh>
      </group>
      {/* small papers */}
      <mesh position={[-1.2, 1.0, -0.4]} rotation={[-Math.PI / 2, 0, 0.2]} receiveShadow><planeGeometry args={[0.42, 0.56]} /><meshStandardMaterial color="#d8cfbb" roughness={0.9} /></mesh>
    </group>
  );
}

function Frame({ position, color, w = 0.92, h = 1.12 }) {
  return (
    <group position={position}>
      <mesh castShadow><boxGeometry args={[w, h, 0.06]} /><meshStandardMaterial color="#3a2414" roughness={0.6} metalness={0.1} /></mesh>
      <mesh position={[0, 0, 0.032]}><planeGeometry args={[w - 0.08, h - 0.08]} /><meshStandardMaterial color="#e8dcc4" roughness={0.9} /></mesh>
      <mesh position={[0, 0, 0.034]}><planeGeometry args={[w - 0.22, h - 0.22]} /><meshStandardMaterial color={color} roughness={0.85} /></mesh>
    </group>
  );
}

function WallDecor() {
  return (
    <group position={[0, 0, -3.13]}>
      <Frame position={[-2.4, 3.6, 0]} color="#7a5a82" />
      <Frame position={[-1.35, 3.3, 0]} color="#577a66" w={0.78} h={0.94} />
      <Frame position={[2.3, 3.6, 0]} color="#9a6f48" />
      <Frame position={[1.3, 3.25, 0]} color="#5a6f96" w={0.84} h={1.02} />
      {/* clock */}
      <group position={[0, 3.7, 0.02]}>
        <mesh rotation-x={Math.PI / 2}><cylinderGeometry args={[0.4, 0.4, 0.06, 36]} /><meshStandardMaterial color="#2a1c12" roughness={0.6} /></mesh>
        <mesh position={[0, 0, 0.04]}><circleGeometry args={[0.35, 36]} /><meshStandardMaterial color="#e8e0cf" roughness={0.8} /></mesh>
        <mesh position={[0, 0.12, 0.05]}><boxGeometry args={[0.02, 0.2, 0.01]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
        <mesh position={[0.08, 0.04, 0.05]} rotation-z={-1}><boxGeometry args={[0.02, 0.16, 0.01]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      </group>
      {/* floating shelf with trinkets */}
      <group position={[-3.2, 2.5, 0.16]}>
        <mesh castShadow><boxGeometry args={[1.4, 0.08, 0.3]} /><meshStandardMaterial color="#4a2e16" roughness={0.6} /></mesh>
        <mesh position={[-0.4, 0.18, 0]}><boxGeometry args={[0.12, 0.28, 0.12]} /><meshStandardMaterial color="#b5603a" roughness={0.6} /></mesh>
        <mesh position={[-0.1, 0.14, 0]}><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color="#5a8f49" roughness={0.6} /></mesh>
        <mesh position={[0.35, 0.16, 0]} rotation-y={0.3}><boxGeometry args={[0.5, 0.22, 0.04]} /><meshStandardMaterial color="#356f8a" roughness={0.8} /></mesh>
      </group>
    </group>
  );
}

function StringLights() {
  const pts = useMemo(() => {
    const arr = [];
    for (let i = 0; i <= 20; i++) {
      const x = -4 + (i / 20) * 8;
      const y = 5.1 + Math.sin((i / 20) * Math.PI * 4) * -0.25 - Math.cos((i / 20) * Math.PI) * 0.0;
      arr.push([x, 5.0 - Math.abs(Math.sin((i / 20) * Math.PI * 5)) * 0.35, -3.0]);
    }
    return arr;
  }, []);
  return (
    <group>
      {pts.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color={i % 2 ? '#ffcf7a' : '#ffb152'} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Chair() {
  return (
    <group position={[0, 0, 0.55]}>
      {/* gas cylinder */}
      <mesh position={[0, 0.34, 0]}><cylinderGeometry args={[0.05, 0.05, 0.5, 16]} /><meshStandardMaterial color="#1a1a1e" metalness={0.7} roughness={0.4} /></mesh>
      {/* 5-star base + casters */}
      {Array.from({ length: 5 }).map((_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <group key={i}>
            <mesh position={[Math.cos(a) * 0.22, 0.08, Math.sin(a) * 0.22]} rotation-y={-a}><boxGeometry args={[0.44, 0.05, 0.07]} /><meshStandardMaterial color="#202024" metalness={0.5} roughness={0.5} /></mesh>
            <mesh position={[Math.cos(a) * 0.42, 0.05, Math.sin(a) * 0.42]}><sphereGeometry args={[0.05, 12, 12]} /><meshStandardMaterial color="#0e0e10" roughness={0.6} /></mesh>
          </group>
        );
      })}
      {/* seat */}
      <RoundedBox args={[0.92, 0.16, 0.86]} radius={0.08} smoothness={4} position={[0, 0.62, 0]} castShadow><meshStandardMaterial color="#2a2a30" roughness={0.7} /></RoundedBox>
      {/* backrest */}
      <RoundedBox args={[0.86, 1.05, 0.14]} radius={0.07} smoothness={4} position={[0, 1.2, -0.4]} rotation-x={-0.12} castShadow><meshStandardMaterial color="#2c2c33" roughness={0.7} /></RoundedBox>
      {/* armrests */}
      {[-0.5, 0.5].map((x, i) => (
        <mesh key={i} position={[x, 0.85, 0]} castShadow><boxGeometry args={[0.08, 0.06, 0.5]} /><meshStandardMaterial color="#1c1c20" roughness={0.6} /></mesh>
      ))}
    </group>
  );
}

function Dust() {
  const pts = useRef();
  const geo = useMemo(() => {
    const N = 110;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 9;
      pos[i * 3 + 1] = Math.random() * 5 + 0.4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  const sprite = useMemo(() => radialTexture('rgba(255,224,180,0.9)', 'rgba(255,210,160,0.3)'), []);
  useFrame(({ clock }) => {
    if (pts.current) pts.current.rotation.y = clock.elapsedTime * 0.015;
  });
  return (
    <points ref={pts} geometry={geo}>
      <pointsMaterial map={sprite} size={0.07} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.5} sizeAttenuation />
    </points>
  );
}

/* ============================================================
   environment lighting (subtle reflections, no network assets)
   ============================================================ */
function Env() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new THREE.Scene(), 0.04);
    scene.environment = env.texture;
    scene.environmentIntensity = 0.25;
    return () => pmrem.dispose();
  }, [gl, scene]);
  return null;
}

/* ============================================================
   scroll-driven camera
   ============================================================ */
function Rig({ progress, glowRef, pointer }) {
  const { camera } = useThree();
  const v = useRef({
    p0: new THREE.Vector3(2.7, 1.95, 1.7),
    p1: new THREE.Vector3(0, 1.66, -1.55),
    l0: new THREE.Vector3(0.1, 1.5, -2.2),
    l1: new THREE.Vector3(0, 1.66, -3.4),
    pos: new THREE.Vector3(),
    look: new THREE.Vector3(),
  }).current;
  useFrame(() => {
    const p = progress.current;
    const e = p * p * (3 - 2 * p);
    glowRef.current = e;
    v.pos.lerpVectors(v.p0, v.p1, e);
    const par = (1 - e) * 0.45;
    v.pos.x += pointer.current.x * par;
    v.pos.y += pointer.current.y * par * 0.5;
    camera.position.lerp(v.pos, 0.1);
    v.look.lerpVectors(v.l0, v.l1, e);
    camera.lookAt(v.look);
    const fov = 42 - e * 9;
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });
  return null;
}

export default function RoomScene({ progress, glowRef }) {
  const pointer = useRef({ x: 0, y: 0 });
  return (
    <>
      <color attach="background" args={['#0b0805']} />
      <fog attach="fog" args={['#160d07', 5, 15]} />
      <SoftShadows size={26} samples={12} focus={0.7} />
      <Env />

      <ambientLight intensity={0.16} color="#ffce9c" />
      <hemisphereLight intensity={0.18} color="#ffcaa0" groundColor="#1a0e06" />
      {/* cool moonlight from the window for contrast */}
      <directionalLight position={[-7, 5, 1]} intensity={0.5} color="#7fa0d8" />

      <group
        onPointerMove={(e) => {
          pointer.current.x = e.pointer?.x ?? 0;
          pointer.current.y = e.pointer?.y ?? 0;
        }}
      >
        <Room />
        <Rug />
        <Window />
        <WallDecor />
        <StringLights />
        <Desk />
        <Monitor glowRef={glowRef} />
        <Keyboard />
        <Mouse />
        <Mug />
        <Lamp glowRef={glowRef} />
        <Plant />
        <DeskExtras />
        <Chair />
        <Dust />
      </group>

      <Rig progress={progress} glowRef={glowRef} pointer={pointer} />

      <EffectComposer disableNormalPass>
        <Bloom intensity={1.15} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.28} darkness={0.85} />
      </EffectComposer>
    </>
  );
}
