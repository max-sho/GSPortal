'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Splat } from '@react-three/drei';
import * as THREE from 'three';

interface StandardSplatProps {
  url: string;
  scale?: number;
  rotation?: [number, number, number];
  debug?: boolean;
  showBounds?: boolean;
}

export function StandardSplat({ 
  url, 
  scale = 1.0, 
  rotation = [0, 0, 0], 
  debug = false,
  showBounds = false
}: StandardSplatProps) {
  
  const groupRef = useRef<THREE.Group>(null);
  const [offset, setOffset] = useState<[number, number, number]>([0, 0, 0]);
  const [dimensions, setDimensions] = useState<[number, number, number]>([0, 0, 0]);
  
  // 🧮 MATH MODULE: Auto-Centering Logic
  useEffect(() => {
    const timer = setTimeout(() => {
        if (!groupRef.current) return;

        // Measure the group to find the true center of the scan
        const box = new THREE.Box3().setFromObject(groupRef.current);
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        
        box.getCenter(center);
        box.getSize(size);

        // Apply inverse offset to move model to [0,0,0]
        if (size.length() > 0.1) {
            console.log("📏 Math Module: Calibrated Center", center);
            setOffset([-center.x, -center.y, -center.z]);
            setDimensions([size.x, size.y, size.z]);
        }
    }, 500); 

    return () => clearTimeout(timer);
  }, [url]);

  return (
    <group 
      rotation={rotation} 
      scale={scale} 
      position={offset}
    >
      <group ref={groupRef}>
        {/* 🚀 PERFORMANCE FIX: alphaTest discards invisible pixels */}
        <Splat 
            src={url} 
            alphaTest={0.1} 
            renderOrder={1}
        />
      </group>

      {/* Debug Visuals */}
      {debug && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial color="red" wireframe opacity={0.5} transparent />
        </mesh>
      )}

      {showBounds && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[dimensions[0] || 2, dimensions[1] || 2, dimensions[2] || 2]} />
          <meshBasicMaterial color="yellow" wireframe opacity={0.2} transparent />
        </mesh>
      )}
    </group>
  );
}
