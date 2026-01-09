# GSPortal: Spatial Head-Tracking Viewer

A high-performance Next.js application for viewing 3D Gaussian Splats (`.splat`) with real-time, webcam-based head tracking to create a window-like parallax effect.

![Project Status](https://img.shields.io/badge/Status-Prototype-green)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js_15_|_R3F_|_Three.js-blue)

## 🌟 Features

* **Gaussian Splat Rendering:** Native support for `.splat` files using standard `@react-three/drei` loaders.
* **Head Tracking:** Real-time face detection uses webcam input to shift the 3D camera, simulating a holographic display.
* **Auto-Calibration:** "Math Module" automatically measures the model's bounding box and centers it at world origin `(0,0,0)`.
* **Performance Mode:** Optimized for constrained hardware (Intel Macs) with adaptive resolution and alpha culling.
* **Debug Suite:** Built-in FPS counter, bounding box visualizers, and scene controls via Leva.

## 🛠️ Architecture

This project uses a **Clean Architecture** approach to avoid "Frankenstein" conflicts between React and the GPU.

* **`components/SpatialViewer.tsx`**: The main controller. Handles the Canvas, camera physics, and global optimization settings (DPR, ToneMapping).
* **`components/StandardSplat.tsx`**: A smart wrapper around the 3D model. It handles the "Auto-Center" math and performance culling (discarding invisible pixels).
* **`hooks/useHeadTracking.ts`**: The logic layer that interprets webcam data into X/Y coordinates.

## 🚀 Getting Started

### Prerequisites
* Node.js 18+
* npm

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/max-sho/GSPortal.git](https://github.com/max-sho/GSPortal.git)
    cd GSPortal
    ```

2.  **Install Dependencies**
    ```bash
    npm install --legacy-peer-deps
    ```

3.  **Run the Development Server**
    ```bash
    npm run dev
    ```

4.  **Open in Browser**
    Navigate to `http://localhost:3000`. Allow camera permissions when prompted to enable head tracking.

## ⚙️ Configuration & Controls

### Adding Your Own Scans
Place your `.splat` files inside the `public/` folder.
Update the URL in `components/SpatialViewer.tsx`:
```tsx
<StandardSplat url="/your-file.splat" ... />
