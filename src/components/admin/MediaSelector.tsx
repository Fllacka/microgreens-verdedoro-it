import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Check, Upload, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { formatBytes } from "@/lib/image-utils";
import { ImageCropper } from "@/components/ImageCropper";

interface MediaFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  storage_path: string;
  file_size?: number;
  width?: number | null;
  height?: number | null;
}

interface MediaSelectorProps {
  value: string | null;
  onChange: (imageId: string | null, imageUrl: string | null) => void;
  altText?: string;
  onAltTextChange?: (altText: string) => void;
  showAltText?: boolean;
  aspectRatio?: number; // Aggiunto per gestire ratio diversi
}

export const MediaSelector = ({
  value,
  onChange,
  altText = "",
  onAltTextChange,
  showAltText = true,
  aspectRatio = 1, // Default a 1:1
}: MediaSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [tempFileRef, setTempFileRef] = useState<{ name: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (value) fetchSelectedImage();
  }, [value]);

  const fetchSelectedImage = async () => {
    if (!value) return;
    try {
      const { data, error } = await supabase.from("media").select("file_path, file_name").eq("id", value).single();
      if (error) throw error;
      if (data) setSelectedImage({ url: data.file_path, name: data.file_name });
    } catch (error) {
      console.error("Error fetching selected image:", error);
    }
  };

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("media")
        .select("id, file_name, file_path, file_type, storage_path, file_size, width, height")
        .or("file_type.eq.image/jpeg,file_type.eq.image/png,file_type.eq.image/webp,file_type.eq.image/jpg")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setMedia((data || []) as MediaFile[]);
    } catch (error: any) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Quando selezioni un'immagine dalla griglia, apri il CROPPER
  const handleSelect = (file: MediaFile) => {
    setTempFileRef({ name: file.file_name, type: file.file_type });
    setImageToCrop(file.file_path);
  };

  const handleRemove = () => {
    onChange(null, null);
    setSelectedImage(null);
  };

  // Step 2: L'upload ora carica SOLO l'originale senza ritagliarlo
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;
      const { error: uploadError } = await supabase.storage.from("cms-media").upload(filePath, file);
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("cms-media").getPublicUrl(filePath);
      const { error: dbError } = await supabase.from("media").insert({
        file_name: file.name,
        file_path: publicUrl,
        file_type: file.type,
        file_size: file.size,
        storage_path: filePath,
      });
      if (dbError) throw dbError;
      toast({ title: "Caricato", description: "Immagine originale aggiunta alla libreria." });
      await fetchMedia();
    } catch (error: any) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  // Step 3: Dopo il ritaglio, carichiamo la versione "cropped" e la applichiamo al campo
  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!tempFileRef) return;
    setUploading(true);
    setImageToCrop(null);
    try {
      const fileName = `cropped-${Date.now()}-${tempFileRef.name}`;
      const { error: uploadError } = await supabase.storage.from("cms-media").upload(fileName, croppedBlob);
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("cms-media").getPublicUrl(fileName);
      const { data: mediaData, error: dbError } = await supabase
        .from("media")
        .insert({
          file_name: `cropped-${tempFileRef.name}`,
          file_path: publicUrl,
          file_type: "image/jpeg",
          file_size: croppedBlob.size,
          storage_path: fileName,
        })
        .select()
        .single();
      if (dbError) throw dbError;
      onChange(mediaData.id, mediaData.file_path);
      setSelectedImage({ url: mediaData.file_path, name: mediaData.file_name });
      setOpen(false);
      toast({ title: "Applicato", description: "Immagine ritagliata inserita nel contenuto." });
    } catch (error: any) {
      toast({ title: "Errore", description: "Errore durante l'applicazione del ritaglio", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const renderMediaGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {media.map((file) => (
        <div
          key={file.id}
          className="relative cursor-pointer group aspect-square rounded-lg overflow-hidden border hover:border-primary"
          onClick={() => handleSelect(file)}
        >
          <img src={file.file_path} alt={file.file_name} className="w-full h-full object-cover" />
          {value === file.id && (
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
              <Check className="h-8 w-8 text-primary" />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {selectedImage ? (
        <div className="space-y-4">
          <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden border">
            <img src={selectedImage.url} alt={altText || selectedImage.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setOpen(true);
                fetchMedia();
              }}
            >
              <Image className="mr-2 h-4 w-4" />
              Sostituisci
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRemove}>
              Rimuovi
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full max-w-md h-32 border-dashed"
          onClick={() => {
            setOpen(true);
            fetchMedia();
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <Image className="h-8 w-8 text-muted-foreground" />
            <span className="text-muted-foreground">Seleziona Immagine</span>
          </div>
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Libreria Media</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="library">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="library">Libreria</TabsTrigger>
              <TabsTrigger value="upload">Carica Nuova</TabsTrigger>
            </TabsList>
            <TabsContent value="library">
              <ScrollArea className="h-[55vh]">
                {loading ? <div className="p-8 text-center">Caricamento...</div> : renderMediaGrid()}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="upload">
              <div className="py-12 text-center space-y-4">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? "Caricando..." : "Carica Originale"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      {imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          aspectRatio={aspectRatio}
          onCropComplete={handleCropComplete}
          onCancel={() => setImageToCrop(null)}
        />
      )}
    </div>
  );
};
