'use client';

import dynamic from 'next/dynamic';

// 🛑 LAZY LOAD: This tells Next.js "Don't touch this file on the server."
// It solves the "Hydration Mismatch" AND the "Double Mount" crash.
const SpatialViewer = dynamic(() => import('@/components/SpatialViewer'), {
  ssr: false,
  loading: () => (
    // Optional: A simple loading screen while the engine boots
    <div className="flex items-center justify-center w-screen h-screen bg-black text-white">
      <p className="font-mono text-sm opacity-50">Initializing Spatial Engine...</p>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="w-full h-screen bg-black overflow-hidden">
      <SpatialViewer />
    </main>
  );
}
