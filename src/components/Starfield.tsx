import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '../contexts/ThemeContext';

const createCircleTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
  }
  return new THREE.CanvasTexture(canvas);
};

function StarfieldPoints() {
  const { size } = useThree();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isMobile = size.width < 768;
  const count = isMobile ? 1000 : 2500;

  const texture = useMemo(() => createCircleTexture(), []);

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const color1 = new THREE.Color(isDark ? '#d4a373' : '#a67c6d'); // Primary
    const color2 = new THREE.Color(isDark ? '#a3b18a' : '#7b8c73'); // Accent
    const color3 = new THREE.Color(isDark ? '#12100e' : '#fdfbf7'); // Bg/Light

    for (let i = 0; i < count; i++) {
      const r = 5 + Math.random() * 30;
      const theta = 2 * Math.PI * Math.random();
      const z = (Math.random() - 0.5) * 120;

      positions[i * 3] = r * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(theta);
      positions[i * 3 + 2] = z;

      const mixedColor = color1.clone().lerp(Math.random() > 0.5 ? color2 : color3, Math.random());
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }
    return [positions, colors];
  }, [count, isDark]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.elapsedTime;
    pointsRef.current.rotation.z = time * 0.02;
    pointsRef.current.rotation.y = Math.sin(time * 0.05) * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.8}
        vertexColors
        transparent
        opacity={0.4}
        sizeAttenuation
        map={texture}
        blending={THREE.NormalBlending}
        depthWrite={false}
      />
    </points>
  );
}

function CameraController() {
  const { camera } = useThree();

  useFrame((state) => {
    const scrollY = window.scrollY;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(scrollY / maxScroll, 1));

    const targetZ = 50 - progress * 80;
    const targetY = progress * 30;

    const mouseX = (state.pointer.x * Math.PI) / 15;
    const mouseY = (state.pointer.y * Math.PI) / 15;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouseX, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouseY - targetY, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);

    camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, progress * Math.PI * 0.25 + mouseX * 0.1, 0.03);
  });
  return null;
}

export default function Starfield() {
  return (
    <Canvas
      camera={{ position: [0, 0, 50], fov: 60 }}
      gl={{ antialias: false, alpha: true }}
      dpr={[1, 1.5]}
    >
      <StarfieldPoints />
      <CameraController />
    </Canvas>
  );
}
