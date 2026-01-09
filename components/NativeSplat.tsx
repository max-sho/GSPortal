'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
// @ts-ignore
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';

interface NativeSplatProps {
  url: string;
  rotation?: [number, number, number];
  scale?: number;
  showBounds?: boolean;
}

export const NativeSplat = React.memo(function NativeSplat({ 
  url, 
  rotation = [0, 0, 0], 
  scale = 1.0, 
  showBounds = false 
}: NativeSplatProps) {
  
  const wrapperRef = useRef<THREE.Group>(null);
  const [status, setStatus] = useState("Initializing...");
  const [details, setDetails] = useState("Waiting...");
  const [offset, setOffset] = useState<[number, number, number]>([0, 0, 0]);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const runDiagnostics = async () => {
        try {
            setStatus("🔍 PHASE 1: DOWNLOAD");
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const blob = await response.blob();
            const sizeMB = (blob.size / (1024 * 1024)).toFixed(2);
            setDetails(`${sizeMB} MB`);

            setStatus("⚙️ PHASE 2: PARSE");
            // @ts-ignore
            const viewer = new GaussianSplats3D.DropInViewer({
                'gpuAcceleratedSort': true,
                'sharedMemoryForWorkers': false,
                'alphaRemovalThreshold': 0, // 👈 CRITICAL: Show everything!
                'splatScale': 1.0           // Ensure points have size
            });
            wrapperRef.current?.add(viewer);

            await viewer.addSplatScenes([{
                path: url,
                rotation: [0, 0, 0, 1],
                scale: [1, 1, 1]
            }], false);

            let pointCount = 0;
            // @ts-ignore
            if (viewer.getSplatCount) pointCount = viewer.getSplatCount();
            // @ts-ignore
            else if (viewer.splatMesh?.getSplatCount) pointCount = viewer.splatMesh.getSplatCount();
            
            if (pointCount === 0) {
                 setStatus("❌ ERROR: 0 POINTS");
                 return;
            }

            setStatus("📏 PHASE 3: MEASURE");
            
            setTimeout(() => {
                if (!wrapperRef.current) return;
                
                const box = new THREE.Box3().setFromObject(viewer);
                const size = new THREE.Vector3();
                const center = new THREE.Vector3();
                box.getSize(size);
                box.getCenter(center);

                if (size.length() < 0.1) {
                    setStatus("⚠️ INVISIBLE");
                    setDetails(`Points: ${pointCount} | Bounds: 0`);
                } else {
                    setStatus("✅ READY");
                    setDetails(`${pointCount.toLocaleString()} pts | Size: [${size.x.toFixed(1)}, ${size.y.toFixed(1)}]`);
                    setOffset([-center.x, -center.y, -center.z]);
                }
            }, 500);

        } catch (err: any) {
            setStatus("❌ FAILURE");
            setDetails(err.message);
        }
    };

    runDiagnostics();
  }, [url]); 

  return (
    <group rotation={rotation} scale={scale} position={offset}>
      <group ref={wrapperRef} />

      {/* HUD (Top Left) */}
      <Html position={[-2, 2, 0]} style={{ pointerEvents: 'none', width: '300px' }} zIndexRange={[100, 0]}>
        <div style={{ 
          background: 'rgba(0, 0, 0, 0.8)', 
          border: '1px solid #555',
          color: 'white', 
          padding: '15px', 
          borderRadius: '8px', 
          fontFamily: 'monospace',
          textAlign: 'left',
        }}>
          <div style={{ color: '#888', fontSize: '10px' }}>STATUS</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: status.includes("ERROR") ? '#f44' : '#4f4' }}>
            {status}
          </div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>
            {details}
          </div>
        </div>
      </Html>

      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="red" wireframe opacity={0.5} transparent />
      </mesh>
    </group>
  );
}, () => true);
