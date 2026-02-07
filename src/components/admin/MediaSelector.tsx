import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Check, Upload, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { type ImageSizeKey, IMAGE_SIZES } from "@/lib/image-utils";
import { extractImageMetadata, formatBytes } from "@/lib/image-compression";

interface OptimizedVersion {
  url: string;
  width: number;
  height: number;
  size: number;
  created_at?: string;
}

interface OptimizedVersions {
  [context: string]: OptimizedVersion;
}

interface MediaFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  storage_path: string;
  is_optimized: boolean;
  optimized_versions?: OptimizedVersions | null;
  width?: number | null;
  height?: number | null;
  blurhash?: string | null;
}

interface MediaSelectorProps {
  value: string | null;
  onChange: (
    imageId: string | null, 
    imageUrl: string | null, 
    optimizedUrl?: string | null,
    metadata?: { width?: number; height?: number; blurhash?: string | null }
  ) => void;
  altText?: string;
  onAltTextChange?: (altText: string) => void;
  showAltText?: boolean;
  /** Context determines what optimization size will be generated (hero, productCard, etc.) */
  context?: ImageSizeKey;
}

export const MediaSelector = ({ 
  value, 
  onChange, 
  altText = "", 
  onAltTextChange, 
  showAltText = true,
  context = "contentImage"
}: MediaSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [optimizing, setOptimizing] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ 
    url: string; 
    name: string; 
    optimizedUrl?: string | null;
    width?: number | null;
    height?: number | null;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Get expected dimensions for context
  const contextConfig = IMAGE_SIZES[context];
  const expectedWidth = 'width' in contextConfig ? contextConfig.width : undefined;
  const expectedHeight = 'height' in contextConfig ? contextConfig.height : undefined;

  useEffect(() => {
    if (value) {
      fetchSelectedImage();
    }
  }, [value, context]);

  const fetchSelectedImage = async () => {
    if (!value) return;
    try {
      const { data, error } = await supabase
        .from("media")
        .select("file_path, file_name, optimized_versions, is_optimized, width, height")
        .eq("id", value)
        .single();

      if (error) throw error;
      if (data) {
        const versions = data.optimized_versions as unknown as OptimizedVersions | null;
        const optimizedUrl = versions?.[context]?.url;
        
        setSelectedImage({ 
          url: data.file_path, 
          name: data.file_name,
          optimizedUrl,
          width: data.width,
          height: data.height,
        });
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
        .select("id, file_name, file_path, file_type, storage_path, is_optimized, optimized_versions, width, height, blurhash")
        .or("file_type.eq.image/jpeg,file_type.eq.image/png,file_type.eq.image/webp,file_type.eq.image/jpg")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMedia((data || []) as unknown as MediaFile[]);
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

  const optimizeImage = async (mediaId: string, storagePath: string): Promise<string | null> => {
    setOptimizing(mediaId);
    
    try {
      console.log(`[MediaSelector] Triggering optimization for context: ${context}`);
      const { data, error } = await supabase.functions.invoke('optimize-image', {
        body: { storagePath, mediaId, context },
      });

      if (error) throw error;
      
      if (data.success) {
        console.log(`[MediaSelector] ✅ Optimized: ${formatBytes(data.originalSize)} → ${formatBytes(data.optimizedSize)} (${data.reduction}% reduction)`);
        toast({
          title: "Immagine ottimizzata",
          description: `Riduzione: ${data.reduction}% (${formatBytes(data.optimizedSize)})`,
        });
        await fetchMedia();
        return data.optimizedUrl;
      } else {
        throw new Error(data.error || 'Optimization failed');
      }
    } catch (error: any) {
      console.error('[MediaSelector] Optimization error:', error);
      toast({
        title: "Avviso",
        description: "Ottimizzazione non riuscita, usando l'immagine originale",
        variant: "destructive",
      });
      return null;
    } finally {
      setOptimizing(null);
    }
  };

  const handleSelect = async (file: MediaFile) => {
    const versions = file.optimized_versions as unknown as OptimizedVersions | null;
    let optimizedUrl = versions?.[context]?.url;

    // If no optimized version exists for this context, trigger optimization
    if (!optimizedUrl && file.storage_path) {
      console.log(`[MediaSelector] No ${context} version found, triggering optimization...`);
      optimizedUrl = await optimizeImage(file.id, file.storage_path);
    }

    onChange(file.id, file.file_path, optimizedUrl, {
      width: file.width ?? undefined,
      height: file.height ?? undefined,
      blurhash: file.blurhash,
    });
    
    setSelectedImage({ 
      url: file.file_path, 
      name: file.file_name,
      optimizedUrl,
      width: file.width,
      height: file.height,
    });
    setOpen(false);
  };

  const handleRemove = () => {
    onChange(null, null, null);
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
      // Extract metadata and pre-resize if needed (prevents Edge Function memory issues)
      console.log(`[MediaSelector] Extracting metadata for ${file.name}...`);
      const metadata = await extractImageMetadata(file);
      console.log(`[MediaSelector] Metadata: ${metadata.width}x${metadata.height}, blurhash: ${metadata.blurhash.substring(0, 10)}...`);
      
      // Use the processed (possibly resized) file for upload
      const fileToUpload = metadata.processedFile;

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Upload pre-resized file with 1-year cache
      const { error: uploadError } = await supabase.storage
        .from("cms-media")
        .upload(filePath, fileToUpload, {
          cacheControl: '31536000',
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("cms-media")
        .getPublicUrl(filePath);

      // Save to database with extracted metadata
      const { data: mediaData, error: dbError } = await supabase
        .from("media")
        .insert({
          file_name: file.name,
          file_path: urlData.publicUrl,
          file_type: fileToUpload.type,
          file_size: fileToUpload.size,
          storage_path: filePath,
          is_optimized: false,
          width: metadata.width,
          height: metadata.height,
          blurhash: metadata.blurhash,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast({
        title: "Successo",
        description: "Immagine caricata. Ottimizzazione in corso...",
      });

      // Trigger optimization for the current context
      let optimizedUrl: string | null = null;
      if (mediaData) {
        optimizedUrl = await optimizeImage(mediaData.id, filePath);
      }

      // Auto-select the uploaded image
      if (mediaData) {
        onChange(mediaData.id, mediaData.file_path, optimizedUrl, {
          width: metadata.width,
          height: metadata.height,
          blurhash: metadata.blurhash,
        });
        setSelectedImage({ 
          url: mediaData.file_path, 
          name: mediaData.file_name,
          optimizedUrl,
          width: metadata.width,
          height: metadata.height,
        });
        setOpen(false);
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

  // Check if source resolution is too low for the context
  const isResolutionLow = (file: MediaFile): boolean => {
    if (!file.width || !file.height || !expectedWidth) return false;
    return file.width < expectedWidth * 0.8; // Allow 20% tolerance
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
          {media.map((file) => {
            const versions = file.optimized_versions as unknown as OptimizedVersions | null;
            const hasContextVersion = !!versions?.[context];
            const lowRes = isResolutionLow(file);
            
            return (
              <div
                key={file.id}
                className={`relative cursor-pointer group aspect-square rounded-lg overflow-hidden border hover:border-primary transition-colors ${lowRes ? 'ring-2 ring-warning/50' : ''}`}
                onClick={() => handleSelect(file)}
              >
                <img
                  src={versions?.thumbnail?.url || file.file_path}
                  alt={file.file_name}
                  className="w-full h-full object-cover"
                />
                
                {/* Selection indicator */}
                {value === file.id && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <Check className="h-8 w-8 text-primary" />
                  </div>
                )}
                
                {/* Optimizing indicator */}
                {optimizing === file.id && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-1 right-1 flex flex-col gap-1">
                  {/* Context-optimized badge */}
                  {hasContextVersion && (
                    <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-verde-primary/90 text-white">
                      <Check className="h-3 w-3 mr-0.5" />
                      {context}
                    </Badge>
                  )}
                  
                  {/* Low resolution warning */}
                  {lowRes && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 bg-warning/90 text-warning-foreground border-warning">
                      <AlertCircle className="h-3 w-3 mr-0.5" />
                      Bassa ris.
                    </Badge>
                  )}
                </div>
                
                {/* Dimensions badge */}
                {file.width && file.height && (
                  <div className="absolute bottom-1 left-1">
                    <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-background/80">
                      {file.width}×{file.height}
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  const renderUploadTab = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-2">
          Clicca per selezionare un'immagine o trascinala qui
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Contesto: <strong>{context}</strong> 
          {expectedWidth && ` (${expectedWidth}${expectedHeight ? `×${expectedHeight}` : ''}px)`}
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
              src={selectedImage.optimizedUrl || selectedImage.url}
              alt={altText || selectedImage.name}
              className="w-full h-full object-cover"
            />
            {/* Show dimensions if available */}
            {selectedImage.width && selectedImage.height && (
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className="text-xs bg-background/80">
                  {selectedImage.width}×{selectedImage.height}
                </Badge>
              </div>
            )}
            {/* Show optimized badge */}
            {selectedImage.optimizedUrl && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-xs bg-verde-primary/90 text-white">
                  <Check className="h-3 w-3 mr-1" />
                  Ottimizzato ({context})
                </Badge>
              </div>
            )}
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
                  <DialogTitle>
                    Seleziona Immagine
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      (contesto: {context})
                    </span>
                  </DialogTitle>
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
              <DialogTitle>
                Seleziona Immagine
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  (contesto: {context})
                </span>
              </DialogTitle>
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
