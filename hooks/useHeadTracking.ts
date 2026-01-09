import { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export function useHeadTracking() {
  const [headPosition, setHeadPosition] = useState({ x: 0, y: 0, z: 0.5 }); // Default z=0.5m
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);

  useEffect(() => {
    let animationFrameId: number;

    const startTracking = async () => {
      // 1. Load MediaPipe Vision Model
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
      );
      
      landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numFaces: 1
      });

      // 2. Setup Webcam
      const video = document.createElement('video');
      video.setAttribute('autoplay', '');
      video.setAttribute('playsinline', '');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' } 
      });
      video.srcObject = stream;
      await video.play();
      videoRef.current = video;

      // 3. Detection Loop
      const detect = () => {
        if (landmarkerRef.current && video.readyState >= 2) {
          const results = landmarkerRef.current.detectForVideo(video, performance.now());
          
          if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const landmarks = results.faceLandmarks[0];

            // --- MATH: Calculate Head Position ---
            
            // X/Y: Average of face bounding box (roughly nose tip)
            // Normalized 0 to 1 (0,0 is top-left)
            const nose = landmarks[1]; 
            
            // Z-Depth: Estimate based on Inter-Pupillary Distance (IPD)
            // Landmarks: 468 (Left Iris), 473 (Right Iris)
            // Rough approximation: Width of face (cheek to cheek)
            // Left Cheek: 454, Right Cheek: 234
            const dx = landmarks[454].x - landmarks[234].x;
            const dy = landmarks[454].y - landmarks[234].y;
            const faceWidthPixel = Math.sqrt(dx * dx + dy * dy);

            // Calibrated constant: Assume standard face width at 50cm matches a certain 'size'
            // As you get closer, 'faceWidthPixel' increases, Z decreases.
            const CALIBRATED_FACE_WIDTH = 0.4; // Tunable constant
            const z = CALIBRATED_FACE_WIDTH / faceWidthPixel;

            // Normalize X/Y to centered coordinates (-1 to 1)
            // Invert X because webcam is mirrored
            const x = (nose.x - 0.5) * 2 * -1; 
            const y = (nose.y - 0.5) * 2; // -1 is top, 1 is bottom

            setHeadPosition({ x, y: -y, z }); // Invert Y for 3D space
          }
        }
        animationFrameId = requestAnimationFrame(detect);
      };
      
      detect();
    };

    startTracking();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return headPosition;
}
