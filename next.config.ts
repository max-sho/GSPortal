import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Disable Strict Mode (prevents double-mount crash)
  reactStrictMode: false,

  // 2. 🛡️ TRANSPILATION: Fixes "originalFactory.call" and "undefined" build errors
  // This forces Next.js to digest the 3D libraries correctly.
  transpilePackages: [
    'three', 
    '@react-three/fiber', 
    '@react-three/drei'
  ],
};

export default nextConfig;
