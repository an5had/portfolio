import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import RoomScene from '../three/Room.jsx';

export default function LabPage() {
  const progress = useRef(0);
  const glowRef = useRef(0);
  const [fade, setFade] = useState(0);
  const [hint, setHint] = useState(1);
  const navigate = useNavigate();
  const navigated = useRef(false);

  useEffect(() => {
    document.body.classList.add('lab-active');
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      progress.current = p;
      setFade(p > 0.86 ? (p - 0.86) / 0.14 : 0);
      setHint(Math.max(0, 1 - p * 6));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.body.classList.remove('lab-active');
    };
  }, []);

  useEffect(() => {
    if (fade >= 1 && !navigated.current) {
      navigated.current = true;
      const t = setTimeout(() => navigate('/'), 520);
      return () => clearTimeout(t);
    }
  }, [fade, navigate]);

  return (
    <div className="lab">
      <div className="lab-stage">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [2.85, 2.1, 2.5], fov: 44, near: 0.1, far: 100 }}
          gl={{ antialias: true }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
          }}
        >
          <RoomScene progress={progress} glowRef={glowRef} />
        </Canvas>

        <div className="lab-vignette" />
        <div className="lab-title" style={{ opacity: hint }}>
          <p className="lab-kicker">A designer’s room</p>
          <h1>Step inside the screen.</h1>
          <span className="lab-scrollcue">scroll to enter ↓</span>
        </div>
        <div className="lab-fade" style={{ opacity: fade }} />
      </div>
      <div className="lab-spacer" />
    </div>
  );
}
