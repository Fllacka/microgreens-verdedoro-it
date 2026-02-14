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
}

export const MediaSelector = ({ 
  value, 
  onChange, 
  altText = "", 
  onAltTextChange, 
  showAltText = true,
}: MediaSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (value) {
      fetchSelectedImage();
    }
  }, [value]);

  const fetchSelectedImage = async () => {
    if (!value) return;
    try {
      const { data, error } = await supabase
        .from("media")
        .select("file_path, file_name")
        .eq("id", value)
        .single();

      if (error) throw error;
      if (data) {
        setSelectedImage({ url: data.file_path, name: data.file_name });
      }
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
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (file: MediaFile) => {
    onChange(file.id, file.file_path);
    setSelectedImage({ url: file.file_path, name: file.file_name });
    setOpen(false);
  };

  const handleRemove = () => {
    onChange(null, null);
    setSelectedImage(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Errore",
        description: "Seleziona un file immagine valido",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Upload file directly - no compression
      const { error: uploadError } = await supabase.storage
        .from("cms-media")
        .upload(filePath, file, {
          cacheControl: '31536000',
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("cms-media")
        .getPublicUrl(filePath);

      // Save to database
      const { data: mediaData, error: dbError } = await supabase
        .from("media")
        .insert({
          file_name: file.name,
          file_path: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
          storage_path: filePath,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast({
        title: "Successo",
        description: "Immagine caricata",
      });

      // Auto-select the uploaded image
      if (mediaData) {
        onChange(mediaData.id, mediaData.file_path);
        setSelectedImage({ url: mediaData.file_path, name: mediaData.file_name });
        setOpen(false);

        // Generate responsive versions in background
        supabase.functions.invoke('generate-responsive-images', {
          body: { storagePath: filePath, mediaId: mediaData.id },
        }).then(({ error }) => {
          if (error) console.error('Responsive image generation failed:', error);
        });
      }
    } catch (error: any) {
      console.error('[MediaSelector] Upload error:', error);
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const renderMediaGrid = () => (
    <>
      {loading ? (
        <div className="flex items-center justify-center py-8">Caricamento...</div>
      ) : media.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          Nessuna immagine nella libreria media
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
          {media.map((file) => (
            <div
              key={file.id}
              className="relative cursor-pointer group aspect-square rounded-lg overflow-hidden border hover:border-primary transition-colors"
              onClick={() => handleSelect(file)}
            >
              <img
                src={file.file_path}
                alt={file.file_name}
                className="w-full h-full object-cover"
              />
              
              {/* Selection indicator */}
              {value === file.id && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <Check className="h-8 w-8 text-primary" />
                </div>
              )}
              
              {/* Dimensions badge */}
              {file.width && file.height && (
                <div className="absolute bottom-1 left-1">
                  <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-background/80">
                    {file.width}×{file.height}
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );

  const renderUploadTab = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-4">
          Clicca per selezionare un'immagine o trascinala qui
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          id="media-upload"
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Caricamento...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Seleziona File
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {selectedImage ? (
        <div className="space-y-4">
          <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden border">
            <img
              src={selectedImage.url}
              alt={altText || selectedImage.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {showAltText && onAltTextChange && (
            <div className="space-y-2 max-w-md">
              <Label htmlFor="image-alt">Testo alternativo (Alt Text)</Label>
              <Input
                id="image-alt"
                value={altText}
                onChange={(e) => onAltTextChange(e.target.value)}
                placeholder="Descrivi l'immagine per SEO e accessibilità"
              />
              <p className="text-xs text-muted-foreground">
                Importante per SEO e accessibilità. Descrivi brevemente cosa mostra l'immagine.
              </p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => fetchMedia()}>
                  <Image className="mr-2 h-4 w-4" />
                  Sostituisci
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Seleziona Immagine</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="library" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="library">Libreria Media</TabsTrigger>
                    <TabsTrigger value="upload">Carica Nuova</TabsTrigger>
                  </TabsList>
                  <TabsContent value="library">
                    <ScrollArea className="h-[55vh]">
                      {renderMediaGrid()}
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="upload">
                    {renderUploadTab()}
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm" onClick={handleRemove}>
              Rimuovi
            </Button>
          </div>
        </div>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full max-w-md h-32 border-dashed" onClick={() => fetchMedia()}>
              <div className="flex flex-col items-center gap-2">
                <Image className="h-8 w-8 text-muted-foreground" />
                <span className="text-muted-foreground">Seleziona Immagine</span>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Seleziona Immagine</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="library" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="library">Libreria Media</TabsTrigger>
                <TabsTrigger value="upload">Carica Nuova</TabsTrigger>
              </TabsList>
              <TabsContent value="library">
                <ScrollArea className="h-[55vh]">
                  {renderMediaGrid()}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="upload">
                {renderUploadTab()}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
