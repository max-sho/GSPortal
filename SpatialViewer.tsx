'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stats, Html } from '@react-three/drei';
import { useHeadTracking } from '../hooks/useHeadTracking';
import { useControls, Leva } from 'leva';
import * as THREE from 'three';
import { StandardSplat } from './StandardSplat';

function HeadTrackedCamera() {
  const { x, y, z } = useHeadTracking();

  // 🎛️ YOUR GOLDEN SETTINGS
  const config = useControls('Camera Physics', {
    enabled: true,
    sensitivityX: { value: 3.2, min: 0, max: 10 },
    sensitivityY: { value: 0.0, min: 0, max: 10 },
    baseZ: { value: 2.4, min: 0.1, max: 10 }, 
    dollyStrength: { value: 2.0, min: 0, max: 10 },
    fovBase: { value: 60.3, min: 10, max: 100 }, 
    fovMultiplier: { value: 14.0, min: 0, max: 100 },
    smoothness: { value: 0.1, min: 0.01, max: 1.0 },
  });

  useFrame((state) => {
    if (!config.enabled) return;
    
    const targetX = x * config.sensitivityX;
    const targetY = y * config.sensitivityY;
    const targetZ = config.baseZ - (z * config.dollyStrength);

    state.camera.position.lerp(
      new THREE.Vector3(targetX, targetY, targetZ),
      config.smoothness
    );

    if (state.camera instanceof THREE.PerspectiveCamera) {
        const depthIntensity = Math.max(0, z); 
        const targetFov = config.fovBase + (depthIntensity * config.fovMultiplier);
        
        state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, targetFov, config.smoothness);
        state.camera.lookAt(0, 0, 0);
        state.camera.updateProjectionMatrix();
    }
  });

  return null;
}

function Loader() {
  return (
    <Html center>
      <div className="text-white font-mono text-sm bg-black/80 p-4 rounded border border-gray-700 backdrop-blur-md">
        LOADING SCENE...
      </div>
    </Html>
  );
}

export default function SpatialViewer() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const stage = useControls('Stage Manager', {
    scale: { value: 3.7, min: 0.1, max: 10.0, step: 0.1 },
    rotateX: { value: 0, min: 0, max: 6.28 },
    rotateY: { value: 3.0, min: 0, max: 6.28 },
    rotateZ: { value: 0, min: 0, max: 6.28 },
    showGrid: { value: false, label: "Show Grid" },
  });

  const debug = useControls('Debug Tools', {
    showSphere: { value: false, label: "Center Sphere" },
    showBounds: { value: true, label: "Bounding Box" },
    showFPS: { value: true, label: "FPS Counter" }
  });

  if (!mounted) return <div className="w-screen h-screen bg-black" />;

  return (
    <div className="w-screen h-screen bg-black">
      <Leva collapsed={false} />

      <Canvas 
        style={{ width: '100%', height: '100%' }}
        events={null}
        
        // 🚀 CRITICAL FIX: Cap Resolution to 1 (Fixes Retina Lag)
        dpr={1}
        
        // 🚀 PERFORMANCE MODE: Low power preference keeps the GPU cool
        gl={{ 
          antialias: false, 
          toneMapping: THREE.NoToneMapping,
          powerPreference: "default", // Changed from 'high-performance' to avoid overheating
          stencil: false,
          depth: true
        }}
      >
        {debug.showFPS && <Stats className="!left-0 !top-0" />}

        <HeadTrackedCamera />
        <ambientLight intensity={5} />
        
        <Suspense fallback={<Loader />}>
            <StandardSplat 
                url="/dancehall.splat" 
                scale={stage.scale}
                rotation={[stage.rotateX, stage.rotateY, stage.rotateZ]}
                debug={debug.showSphere}
                showBounds={debug.showBounds}
            />
        </Suspense>

        {stage.showGrid && (
          <gridHelper 
            args={[20, 20, "#666", "#444"]} 
            rotation={[Math.PI/2, 0, 0]} 
            position={[0, 0, -5]} 
          />
        )}
      </Canvas>
      
      <div className="absolute bottom-4 left-4 text-white font-mono z-10 pointer-events-none opacity-40">
        <p className="text-xs">
            Mode: Optimized (DPR 1)
        </p>
      </div>
    </div>
  );
}
