'use client';

import React from 'react';
// 🛑 COMMENTED OUT: We are disabling the complex library to prove stability.
// import { Splat } from '@react-three/drei'; 

interface SmartSplatProps {
  url: string;
  rotation?: [number, number, number];
  scale?: number;
  showBounds?: boolean;
}

export const SmartSplat = React.memo(function SmartSplat({ 
  url, 
  rotation = [0, 0, 0], 
  scale = 1.0,
  showBounds = false
}: SmartSplatProps) {
  
  return (
    <group rotation={rotation} scale={scale}>
        {/* 🟥 THE RED BOX OF TRUTH */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} /> 
          <meshStandardMaterial color="red" wireframe />
        </mesh>
        
        {/* White Center Marker */}
        <mesh position={[0, 0, 0]}>
             <boxGeometry args={[0.2, 0.2, 0.2]} /> 
             <meshStandardMaterial color="white" />
        </mesh>
    </group>
  );
}, () => true);
