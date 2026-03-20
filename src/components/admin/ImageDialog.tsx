import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Upload, Loader2, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImageCropper } from "@/components/ImageCropper";

interface MediaFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  storage_path: string;
}

interface ImageDialogProps {
  children: React.ReactNode;
  onSelectImage: (url: string, alt: string) => void;
  aspectRatio?: number;
}

export const ImageDialog = ({ children, onSelectImage, aspectRatio = 16 / 9 }: ImageDialogProps) => {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<MediaFile | null>(null);
  const [altText, setAltText] = useState("");
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [tempFileRef, setTempFileRef] = useState<{ name: string; type: string } | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchMedia();
    }
  }, [open]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("media")
        .select("id, file_name, file_path, file_type, storage_path")
        .or(
          "file_type.eq.image/jpeg,file_type.eq.image/png,file_type.eq.image/webp,file_type.eq.image/jpg,file_type.eq.image/gif",
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMedia((data || []) as MediaFile[]);
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Errore", description: "Seleziona un file immagine valido", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const storagePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("cms-media").upload(storagePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("cms-media").getPublicUrl(storagePath);

      const { error: dbError } = await supabase
        .from("media")
        .insert({
          file_name: file.name,
          file_path: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
          storage_path: storagePath,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast({ title: "Successo", description: "Immagine caricata nella libreria media." });
      await fetchMedia();
    } catch (error: any) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSelect = (file: MediaFile) => {
    setSelectedImage(file);
    setAltText(file.file_name.split(".")[0]);
  };

  const handleInsertClick = () => {
    if (selectedImage) {
      setTempFileRef({ name: selectedImage.file_name, type: selectedImage.file_type });
      setImageToCrop(selectedImage.file_path);
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!selectedImage || !tempFileRef) return;
    setUploading(true);
    setImageToCrop(null);

    try {
      const fileName = `cropped-${Date.now()}-${tempFileRef.name}`;
      const storagePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("cms-media").upload(storagePath, croppedBlob);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("cms-media").getPublicUrl(storagePath);

      const { data: mediaData, error: dbError } = await supabase
        .from("media")
        .insert({
          file_name: `cropped-${tempFileRef.name}`,
          file_path: urlData.publicUrl,
          file_type: "image/jpeg",
          file_size: croppedBlob.size,
          storage_path: storagePath,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      onSelectImage(mediaData.file_path, altText);
      setOpen(false);
      setSelectedImage(null);
      setAltText("");
      toast({ title: "Applicato", description: "Immagine ritagliata inserita nel blog." });
    } catch (error: any) {
      toast({ title: "Errore", description: "Errore nell'applicazione del ritaglio finale.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Inserisci Immagine (Blog)</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Libreria Media</TabsTrigger>
            <TabsTrigger value="upload">Carica Nuova</TabsTrigger>
          </TabsList>
          <TabsContent value="library" className="mt-4">
            <ScrollArea className="h-[45vh]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : media.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  Nessuna immagine nella libreria media
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 p-1">
                  {media.map((file) => (
                    <div
                      key={file.id}
                      className={`relative cursor-pointer group aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage?.id === file.id
                          ? "border-verde-primary ring-2 ring-verde-primary/20"
                          : "border-transparent hover:border-muted-foreground/30"
                      }`}
                      onClick={() => handleSelect(file)}
                    >
                      <img src={file.file_path} alt={file.file_name} className="w-full h-full object-cover" />
                      {selectedImage?.id === file.id && (
                        <div className="absolute inset-0 bg-verde-primary/10 flex items-center justify-center">
                          <Check className="h-8 w-8 text-verde-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="upload" className="mt-4">
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">Trascina un'immagine o clicca per selezionare</p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="max-w-xs"
              />
              {uploading && (
                <div className="flex items-center gap-2 mt-4 text-sm text-verde-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Caricamento...</span>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {selectedImage && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-4">
              <img
                src={selectedImage.file_path}
                alt={selectedImage.file_name}
                className="w-16 h-16 object-cover rounded border"
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="alt-text">Testo alternativo (Alt) per SEO</Label>
                <Input
                  id="alt-text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Descrizione dell'immagine per SEO e accessibilità"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleInsertClick} className="bg-verde-primary hover:bg-verde-light">
                <GripVertical className="h-4 w-4 mr-2" />
                Ritaglia e Inserisci nel Blog
              </Button>
            </div>
          </div>
        )}

        {imageToCrop && (
          <ImageCropper
            image={imageToCrop}
            aspectRatio={aspectRatio}
            onCropComplete={handleCropComplete}
            onCancel={() => setImageToCrop(null)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
