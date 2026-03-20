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
      // --- FIX CORS: Questa riga permette al pulsante di funzionare ---
      img.crossOrigin = "anonymous";
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
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-white">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Ritaglia per Verde D'Oro</DialogTitle>
        </DialogHeader>

        {/* FIX MOVIMENTO: 'touch-none' e altezza corretta permettono il trascinamento */}
        <div className="relative w-full h-[400px] mt-4 bg-muted touch-none">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteInternal}
            classes={{ containerClassName: "cursor-move" }}
          />
        </div>

        <div className="p-6 space-y-4">
          <label className="text-sm font-medium">Zoom (usa la rotellina o lo slider)</label>
          <Slider min={1} max={3} step={0.1} value={[zoom]} onValueChange={(v) => setZoom(v[0])} />
          <DialogFooter>
            <Button variant="outline" onClick={onCancel}>
              Annulla
            </Button>
            <Button onClick={getCroppedImg} className="bg-verde-primary hover:bg-verde-light text-white">
              Conferma e Applica
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
