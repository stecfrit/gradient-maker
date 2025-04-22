import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

const FullscreenButton = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  };

  return (
    <Button variant="outline" onClick={toggleFullscreen} size="icon">
      {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
    </Button>
  );
};

export default FullscreenButton;
