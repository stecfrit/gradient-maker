import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { Download, Trash2, Settings } from "lucide-react";

interface SettingsDialogProps {
  colors: string[];
  blobCount: number;
  size: number;
  pointCount: number;
  backgroundColor: string;
  blurAmount: number;
  grainAmount: number;
  onSettingsChange: (settings: {
    colors: string[];
    blobCount: number;
    size: number;
    pointCount: number;
    backgroundColor: string;
    blurAmount: number;
    grainAmount: number;
  }) => void;
  onDownload: (width?: number, height?: number) => void;
  onRandomize: () => void;
}

const SettingsDialog = ({
  colors,
  blobCount,
  size,
  pointCount,
  backgroundColor,
  blurAmount,
  grainAmount,
  onSettingsChange,
  onDownload,
  onRandomize,
}: SettingsDialogProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [localColors, setLocalColors] = useState<string[]>(colors);
  const [localBlobCount, setLocalBlobCount] = useState(blobCount);
  const [localSize, setLocalSize] = useState(size);
  const [localPointCount, setLocalPointCount] = useState(pointCount);
  const [localBackgroundColor, setLocalBackgroundColor] =
    useState(backgroundColor);
  const [localBlurAmount, setLocalBlurAmount] = useState(blurAmount);
  const [localGrainAmount, setLocalGrainAmount] = useState(grainAmount);

  const handleApplySettings = () => {
    onSettingsChange({
      colors: localColors,
      blobCount: localBlobCount,
      size: localSize,
      pointCount: localPointCount,
      backgroundColor: localBackgroundColor,
      blurAmount: localBlurAmount,
      grainAmount: localGrainAmount,
    });
  };

  const handleColorChange = (index: number, value: string) => {
    const newColors = [...localColors];
    newColors[index] = value;
    setLocalColors(newColors);
  };

  const addColor = () => {
    setLocalColors([...localColors, "#ffffff"]);
  };

  const removeColor = (index: number) => {
    if (localColors.length <= 1) return;
    const newColors = [...localColors];
    newColors.splice(index, 1);
    setLocalColors(newColors);
  };

  useEffect(() => {
    setLocalColors(colors);
    setLocalBlobCount(blobCount);
    setLocalSize(size);
    setLocalPointCount(pointCount);
    setLocalBackgroundColor(backgroundColor);
    setLocalBlurAmount(blurAmount);
    setLocalGrainAmount(grainAmount);
  }, [
    colors,
    blobCount,
    size,
    pointCount,
    backgroundColor,
    blurAmount,
    grainAmount,
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background/20 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>gradient maker</DialogTitle>
        </DialogHeader>

        <div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>background</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={localBackgroundColor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setLocalBackgroundColor(e.target.value)
                  }
                  className="w-10 p-0.5"
                />
                <Input
                  type="text"
                  value={localBackgroundColor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setLocalBackgroundColor(e.target.value)
                  }
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>colors</Label>
              <div className="space-y-1">
                {localColors.map((color, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={color}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleColorChange(index, e.target.value)
                      }
                      className="w-10 p-0.5"
                    />
                    <Input
                      type="text"
                      value={color}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleColorChange(index, e.target.value)
                      }
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeColor(index)}
                      disabled={localColors.length <= 1}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addColor}
                  className="w-full"
                >
                  add color
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label>blob count</Label>
                <span className="text-muted-foreground">{localBlobCount}</span>
              </div>
              <Slider
                value={[localBlobCount]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value: number[]) => setLocalBlobCount(value[0])}
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label>blob size</Label>
                <span className="text-muted-foreground">
                  {localSize.toFixed(2)}
                </span>
              </div>
              <Slider
                value={[localSize * 100]}
                min={10}
                max={100}
                step={1}
                onValueChange={(value: number[]) =>
                  setLocalSize(value[0] / 100)
                }
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label>point count</Label>
                <span className="text-muted-foreground">{localPointCount}</span>
              </div>
              <Slider
                value={[localPointCount]}
                min={3}
                max={24}
                step={1}
                onValueChange={(value: number[]) =>
                  setLocalPointCount(value[0])
                }
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label>blur</Label>
                <span className="text-muted-foreground">
                  {localBlurAmount}px
                </span>
              </div>
              <Slider
                value={[localBlurAmount]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value: number[]) =>
                  setLocalBlurAmount(value[0])
                }
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label>grain</Label>
                <span className="text-muted-foreground">
                  {localGrainAmount}
                </span>
              </div>
              <Slider
                value={[localGrainAmount]}
                min={0}
                max={50}
                step={1}
                onValueChange={(value: number[]) =>
                  setLocalGrainAmount(value[0])
                }
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                onClick={onRandomize}
                variant="secondary"
                className="flex-1"
              >
                randomize
              </Button>

              <Button
                type="button"
                onClick={handleApplySettings}
                className="flex-1"
              >
                apply
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Download />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-background/20 backdrop-blur-md"
                >
                  <DropdownMenuItem onClick={() => onDownload(640, 480)}>
                    640x480 (sd)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDownload(1280, 720)}>
                    1280x720 (hd)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDownload(1920, 1080)}>
                    1920×1080 (fhd)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDownload(2560, 1440)}>
                    2560x1440 (qhd)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDownload(3840, 2160)}>
                    3840×2160 (4k)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
