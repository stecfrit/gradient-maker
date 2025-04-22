import { useState, useRef } from "react";
import BlobBackground from "./components/BlobBackground";
import SettingsDialog from "./components/SettingsDialog";
import FullscreenButton from "./components/FullscreenButton";

function App() {
  const [settings, setSettings] = useState({
    colors: ["#e42542", "#f0e328", "#9ca5e7"],
    blobCount: 3,
    size: 0.5,
    pointCount: 8,
    backgroundColor: "#191c33",
    blurAmount: 100,
    grainAmount: 13,
  });

  const [randomSeed, setRandomSeed] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSettingsChange = (newSettings: {
    colors: string[];
    blobCount: number;
    size: number;
    pointCount: number;
    backgroundColor: string;
    blurAmount: number;
    grainAmount: number;
  }) => {
    setSettings(newSettings);
  };

  const handleRandomize = () => {
    setRandomSeed((prev) => prev + 1);
  };

  const handleDownload = (width = 1920, height = 1080) => {
    if (!canvasRef.current) return;

    // Create a temporary canvas for the exported image
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = width;
    exportCanvas.height = height;
    const exportCtx = exportCanvas.getContext("2d");

    if (!exportCtx) return;

    // Get the original canvas
    const originalCanvas = canvasRef.current;

    // Draw resized content
    exportCtx.drawImage(originalCanvas, 0, 0, width, height);

    // Create a temporary link element
    const link = document.createElement("a");
    link.download = `gradient-blob-${width}x${height}.png`;

    // Convert the canvas to a data URL
    link.href = exportCanvas.toDataURL("image/png");

    // Append to the document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative min-h-screen">
      <BlobBackground
        colors={settings.colors}
        blobCount={settings.blobCount}
        size={settings.size}
        pointCount={settings.pointCount}
        backgroundColor={settings.backgroundColor}
        blurAmount={settings.blurAmount}
        grainAmount={settings.grainAmount}
        randomSeed={randomSeed}
        canvasRef={canvasRef}
      />

      <div className="fixed bottom-5 right-5 z-10 flex gap-2">
        <FullscreenButton />
        <SettingsDialog
          colors={settings.colors}
          blobCount={settings.blobCount}
          size={settings.size}
          pointCount={settings.pointCount}
          backgroundColor={settings.backgroundColor}
          blurAmount={settings.blurAmount}
          grainAmount={settings.grainAmount}
          onSettingsChange={handleSettingsChange}
          onDownload={handleDownload}
          onRandomize={handleRandomize}
        />
      </div>
    </div>
  );
}

export default App;
