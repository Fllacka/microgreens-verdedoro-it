import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

interface CroppedAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropperProps {
  image: string;
  aspectRatio: number;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
}

export const ImageCropper = ({ image, aspectRatio, onCropComplete, onCancel }: ImageCropperProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);

  const onCropCompleteInternal = useCallback((_: unknown, pixels: CroppedAreaPixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const getCroppedImg = async () => {
    try {
      const img = new Image();
      img.src = image;
      await img.decode();

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx || !croppedAreaPixels) return;

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
      );

      canvas.toBlob(
        (blob) => {
          if (blob) onCropComplete(blob);
        },
        "image/jpeg",
        0.9,
      );
    } catch (e) {
      console.error("Errore durante il ritaglio:", e);
    }
  };

  return (
    <Dialog open onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
        {" "}
        {/* Fix Padding */}
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Ritaglia l'immagine per Verde D'Oro</DialogTitle>
        </DialogHeader>
        {/* --- FIX CSS QUI --- */}
        {/* Usiamo un'altezza fissa e 'relative' per react-easy-crop */}
        <div className="relative w-full h-[450px] bg-muted">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteInternal}
            // Aggiungiamo classi per assicurarci che sia cliccabile
            classes={{
              containerClassName: "cursor-move",
              mediaClassName: "max-w-none",
            }}
          />
        </div>
        {/* -------------------- */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Zoom</label>
            <Slider min={1} max={3} step={0.1} value={[zoom]} onValueChange={(value) => setZoom(value[0])} />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={onCancel}>
              Annulla
            </Button>
            <Button onClick={getCroppedImg} className="bg-verde-primary hover:bg-verde-light">
              Conferma e Applica
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
