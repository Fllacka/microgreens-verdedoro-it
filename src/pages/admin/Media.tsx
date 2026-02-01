import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Copy, Check, Loader2, ImageIcon } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { compressImage, formatBytes } from "@/lib/image-compression";

interface MediaFile {
  id: string;
  file_name: string;
  file_type: string;
  file_path: string;
  storage_path: string;
  file_size: number;
  alt_text: string | null;
  created_at: string;
  is_optimized: boolean;
  optimized_urls: Record<string, string> | null;
  width: number | null;
  height: number | null;
  blurhash: string | null;
}

export default function AdminMedia() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMedia = async () => {
    try {
      const { data, error } = await supabase
        .from("media")
        .select("*")
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

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utente non autenticato");

      const fileArray = Array.from(files);
      
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const isImage = file.type.startsWith("image/");
        
        setUploadProgress(`Processando ${i + 1}/${fileArray.length}: ${file.name}`);

        let fileToUpload = file;
        let width: number | null = null;
        let height: number | null = null;
        let blurhash: string | null = null;
        let originalSize = file.size;

        // PHASE 2: Compress images before upload
        if (isImage) {
          try {
            console.log(`[Upload] Starting compression for ${file.name} (${formatBytes(originalSize)}, type: ${file.type})`);
            setUploadProgress(`Comprimendo ${file.name}...`);
            const result = await compressImage(file);
            fileToUpload = result.file;
            width = result.width;
            height = result.height;
            blurhash = result.blurhash;
            
            // Show compression stats
            const savings = originalSize - result.compressedSize;
            console.log(
              `[Compression] ${file.name}: ${formatBytes(originalSize)} → ${formatBytes(result.compressedSize)} (saved ${formatBytes(savings)}, blurhash: ${blurhash ? 'yes' : 'no'})`
            );
          } catch (compressError) {
            console.error("[Compression] Failed:", compressError);
            // Continue with original file if compression fails
          }
        } else {
          console.log(`[Upload] Skipping compression for non-image: ${file.name} (type: ${file.type})`);
        }

        // Generate unique filename
        const fileExt = fileToUpload.name.split(".").pop() || file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        setUploadProgress(`Caricando ${file.name}...`);

        // Upload to storage with 1-year cache
        const { error: uploadError } = await supabase.storage
          .from("cms-media")
          .upload(filePath, fileToUpload, {
            cacheControl: '31536000', // 1 year cache
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("cms-media")
          .getPublicUrl(filePath);

        // Save to database with dimensions and blurhash
        const { error: dbError } = await supabase.from("media").insert([
          {
            file_name: file.name,
            file_type: fileToUpload.type,
            file_path: publicUrl,
            storage_path: filePath,
            file_size: fileToUpload.size,
            uploaded_by: user.id,
            is_optimized: true, // Already optimized client-side
            width,
            height,
            blurhash,
          },
        ]);

        if (dbError) throw dbError;
      }

      toast({
        title: "Successo",
        description: `${fileArray.length} file caricati e ottimizzati`,
      });
      fetchMedia();
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress("");
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string, storagePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("cms-media")
        .remove([storagePath]);

      if (storageError) console.warn('Storage delete warning:', storageError);

      // Delete from database
      const { error: dbError } = await supabase
        .from("media")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      toast({
        title: "Successo",
        description: "File eliminato",
      });
      fetchMedia();
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    }
    setDeleteId(null);
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast({
      title: "Copiato",
      description: "URL copiato negli appunti",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <h1 className="text-2xl md:text-3xl font-bold">Media Library</h1>
          <div className="flex items-center gap-2">
            {uploadProgress && (
              <span className="text-sm text-muted-foreground">{uploadProgress}</span>
            )}
            <Label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {uploading ? "Caricando..." : "Carica File"}
            </Label>
            <Input
              id="file-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
          {media.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex items-center justify-center min-h-[200px] text-muted-foreground">
                Nessun file. Carica il tuo primo file!
              </CardContent>
            </Card>
          ) : (
            media.map((file) => (
              <Card key={file.id} className="overflow-hidden">
                <div className="aspect-square bg-muted flex items-center justify-center relative">
                  {file.file_type.startsWith("image/") ? (
                    <img
                      src={file.file_path}
                      alt={file.alt_text || file.file_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-2xl md:text-4xl text-muted-foreground">📄</div>
                  )}
                  
                  {/* Dimension badge */}
                  {file.width && file.height && (
                    <div className="absolute top-1 left-1">
                      <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-background/80">
                        {file.width}×{file.height}
                      </Badge>
                    </div>
                  )}
                  
                  {/* Optimization badge */}
                  {file.file_type.startsWith("image/") && (
                    <div className="absolute top-1 right-1">
                      {file.blurhash ? (
                        <Badge variant="secondary" className="text-[10px] px-1 py-0">
                          <Check className="h-3 w-3 mr-0.5" />
                          Opt
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] px-1 py-0 bg-background/80">
                          <ImageIcon className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <CardContent className="p-2 md:p-4 space-y-1 md:space-y-2">
                  <p className="font-medium text-xs md:text-sm truncate" title={file.file_name}>
                    {file.file_name}
                  </p>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    {formatBytes(file.file_size)}
                  </p>
                  <div className="flex gap-1 md:gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 md:h-8 px-2"
                      onClick={() => copyToClipboard(file.file_path, file.id)}
                    >
                      {copiedId === file.id ? (
                        <Check className="h-3 w-3 md:h-4 md:w-4" />
                      ) : (
                        <Copy className="h-3 w-3 md:h-4 md:w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 md:h-8 px-2"
                      onClick={() => setDeleteId(file.id)}
                    >
                      <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. Il file verrà eliminato permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const file = media.find((f) => f.id === deleteId);
                if (file) handleDelete(file.id, file.storage_path);
              }}
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
