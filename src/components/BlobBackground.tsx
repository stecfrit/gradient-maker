import { useEffect, useRef, RefObject, useMemo } from "react";

interface BlobBackgroundProps {
  colors: string[];
  blobCount: number;
  size: number;
  pointCount: number;
  backgroundColor: string;
  randomSeed: number;
  blurAmount: number;
  grainAmount: number;
  canvasRef?: RefObject<HTMLCanvasElement | null>;
}

const BlobBackground = ({
  colors = ["#e42542", "#f0e328", "#9ca5e7"],
  blobCount = 3,
  size = 0.5,
  pointCount = 8,
  backgroundColor = "#191c33",
  randomSeed = 0,
  blurAmount = 100,
  grainAmount = 16,
  canvasRef: externalCanvasRef,
}: Partial<BlobBackgroundProps>) => {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = externalCanvasRef || internalCanvasRef;

  // Generate blob data based only on randomSeed, blobCount and pointCount
  const blobData = useMemo(() => {
    const generateBlobPoints = (count: number) => {
      return Array.from({ length: count }).map(() => ({
        angle: 0,
        radius: 0.5 + Math.random() * 0.3,
      }));
    };

    // Use randomSeed to set the random seed
    // This ensures the same "random" positions for the same randomSeed value
    const pseudoRandom = (seed: number) => {
      return function () {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
      };
    };

    const random = pseudoRandom(randomSeed);

    return Array.from({ length: blobCount }).map((_, i) => ({
      points: generateBlobPoints(pointCount),
      colorIndex: i % colors.length,
      x: random() * 100, // Store as percentage of canvas width
      y: random() * 100, // Store as percentage of canvas height
      scale: 1 + random() * 1.5, // Larger blobs that overlap more
    }));
  }, [randomSeed, blobCount, pointCount, colors.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Initial sizing
    resizeCanvas();

    // Parse hex color to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 0, g: 0, b: 0 };
    };

    // Draw a single blob with gradient
    function drawBlob(
      ctx: CanvasRenderingContext2D,
      points: Array<{
        angle: number;
        radius: number;
      }>,
      color: string,
      centerX: number,
      centerY: number,
      size: number,
      scale: number
    ) {
      if (!canvas) return;

      const smallerDimension = Math.min(canvas.width, canvas.height);
      const radius = smallerDimension * size * scale;

      // Calculate points around a circle
      points.forEach((point, i) => {
        point.angle = (i / points.length) * Math.PI * 2;
      });

      // First create a path for the blob
      ctx.beginPath();

      // Connect points with bezier curves for smooth blob
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const nextPoint = points[(i + 1) % points.length];

        const x = centerX + Math.cos(point.angle) * point.radius * radius;
        const y = centerY + Math.sin(point.angle) * point.radius * radius;

        const nextX =
          centerX + Math.cos(nextPoint.angle) * nextPoint.radius * radius;
        const nextY =
          centerY + Math.sin(nextPoint.angle) * nextPoint.radius * radius;

        // Control points for bezier curve
        const cp1x = x + (nextX - x) * 0.4;
        const cp1y = y + (nextY - y) * 0.4;
        const cp2x = nextX - (nextX - x) * 0.4;
        const cp2y = nextY - (nextY - y) * 0.4;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, nextX, nextY);
        }
      }

      ctx.closePath();

      // Create a radial gradient from the center of the blob
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        radius
      );

      // Parse the color to RGB
      const rgb = hexToRgb(color);

      // Create gradient that fades to transparent
      gradient.addColorStop(0, `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
      gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Apply grain effect to canvas
    function applyGrain(ctx: CanvasRenderingContext2D, amount: number) {
      if (amount <= 0 || !canvas) return;

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Apply grain
      for (let i = 0; i < data.length; i += 4) {
        // Generate random noise value between -range and +range
        const noise = (Math.random() - 0.5) * amount * 2;

        // Apply noise to each RGB channel
        data[i] = Math.min(255, Math.max(0, data[i] + noise)); // Red
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise)); // Green
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise)); // Blue
        // Don't modify alpha channel (i + 3)
      }

      // Put the modified image data back on the canvas
      ctx.putImageData(imageData, 0, 0);
    }

    // Render the gradient image
    const renderGradient = () => {
      // Fill background first
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // We'll use multiple passes with different blend modes to achieve a smoother gradient

      // First pass - normal blending with lower opacity
      ctx.globalAlpha = 0.6;
      ctx.globalCompositeOperation = "source-over";

      // Apply blur for smoother gradients
      if (blurAmount > 0) {
        ctx.filter = `blur(${blurAmount}px)`;
      }

      // Draw blobs with stable positions based on blob data
      blobData.forEach((blob) => {
        // Convert percentage coordinates to actual pixel coordinates
        const x = (blob.x / 100) * canvas.width;
        const y = (blob.y / 100) * canvas.height;

        drawBlob(
          ctx,
          blob.points,
          colors[blob.colorIndex],
          x,
          y,
          size,
          blob.scale
        );
      });

      // Reset filters and blend mode
      ctx.filter = "none";
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = "source-over";

      // Apply grain effect after everything else
      if (grainAmount > 0) {
        applyGrain(ctx, grainAmount);
      }
    };

    renderGradient();

    // Handle window resize
    const handleResize = () => {
      resizeCanvas();
      renderGradient();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [
    colors,
    size,
    backgroundColor,
    blurAmount,
    grainAmount,
    blobData,
    canvasRef,
  ]);

  return (
    <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-10" />
  );
};

export default BlobBackground;
