import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface MediaFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
}

interface MediaSelectorProps {
  value: string | null;
  onChange: (imageId: string | null, imageUrl: string | null) => void;
  altText?: string;
  onAltTextChange?: (altText: string) => void;
  showAltText?: boolean;
}

export const MediaSelector = ({ value, onChange, altText = "", onAltTextChange, showAltText = true }: MediaSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);
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
        .select("*")
        .or("file_type.eq.image/jpeg,file_type.eq.image/png,file_type.eq.image/webp,file_type.eq.image/jpg")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMedia(data || []);
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

  const handleSelect = (imageId: string, imageUrl: string) => {
    onChange(imageId, imageUrl);
    const selectedMedia = media.find(m => m.id === imageId);
    if (selectedMedia) {
      setSelectedImage({ url: imageUrl, name: selectedMedia.file_name });
    }
    setOpen(false);
  };

  const handleRemove = () => {
    onChange(null, null);
    setSelectedImage(null);
  };

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
                <ScrollArea className="h-[60vh]">
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
                          onClick={() => handleSelect(file.id, file.file_path)}
                        >
                          <img
                            src={file.file_path}
                            alt={file.file_name}
                            className="w-full h-full object-cover"
                          />
                          {value === file.id && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <Check className="h-8 w-8 text-primary" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={handleRemove}>
              Rimuovi
            </Button>
          </div>
        </div>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={() => fetchMedia()}>
              <Image className="mr-2 h-4 w-4" />
              Seleziona Immagine
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Seleziona Immagine</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh]">
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
                      onClick={() => handleSelect(file.id, file.file_path)}
                    >
                      <img
                        src={file.file_path}
                        alt={file.file_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
