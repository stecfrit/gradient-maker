import { useState, useRef } from "react";
import BlobBackground from "./components/BlobBackground";
import SettingsDialog from "./components/SettingsDialog";

function App() {
  const [settings, setSettings] = useState({
    colors: ["#ff7e5f", "#feb47b"],
    blobCount: 2,
    size: 0.5,
    pointCount: 8,
    backgroundColor: "#121212",
    blurAmount: 40,
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
        randomSeed={randomSeed}
        canvasRef={canvasRef}
      />

      <SettingsDialog
        colors={settings.colors}
        blobCount={settings.blobCount}
        size={settings.size}
        pointCount={settings.pointCount}
        backgroundColor={settings.backgroundColor}
        blurAmount={settings.blurAmount}
        onSettingsChange={handleSettingsChange}
        onDownload={handleDownload}
        onRandomize={handleRandomize}
      />
    </div>
  );
}

export default App;
