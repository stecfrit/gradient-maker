import { useEffect, useRef, RefObject } from "react";

interface BlobBackgroundProps {
  colors: string[];
  blobCount: number;
  size: number;
  pointCount: number;
  backgroundColor: string;
  randomSeed: number;
  blurAmount: number;
  canvasRef?: RefObject<HTMLCanvasElement | null>;
}

const BlobBackground = ({
  colors = ["#ff7e5f", "#feb47b", "#7ac5d8", "#9d94ff"],
  blobCount = 4,
  size = 0.5,
  pointCount = 8,
  backgroundColor = "#ffffff",
  randomSeed = 0,
  blurAmount = 40,
  canvasRef: externalCanvasRef,
}: Partial<BlobBackgroundProps>) => {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = externalCanvasRef || internalCanvasRef;

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

    // Create blob points with larger, overlapping blobs for gradient effect
    const blobs = Array.from({ length: blobCount }).map((_, i) => ({
      points: generateBlobPoints(pointCount),
      color: colors[i % colors.length],
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      scale: 1 + Math.random() * 1.5, // Larger blobs that overlap more
    }));

    // Generate random points for blob
    function generateBlobPoints(count: number) {
      return Array.from({ length: count }).map(() => ({
        angle: 0,
        radius: 0.5 + Math.random() * 0.3,
      }));
    }

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

      // Draw blobs with random positions
      blobs.forEach((blob) => {
        drawBlob(
          ctx,
          blob.points,
          blob.color,
          blob.x,
          blob.y,
          size,
          blob.scale
        );
      });

      // Reset filters and blend mode
      ctx.filter = "none";
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = "source-over";
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
    blobCount,
    size,
    pointCount,
    backgroundColor,
    randomSeed,
    blurAmount,
    canvasRef,
  ]);

  return (
    <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-10" />
  );
};

export default BlobBackground;
