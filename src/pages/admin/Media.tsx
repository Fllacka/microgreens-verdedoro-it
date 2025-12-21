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

interface OptimizedUrls {
  thumbnail?: string;
  medium?: string;
  large?: string;
  original?: string;
  webp_thumbnail?: string;
  webp_medium?: string;
  webp_large?: string;
}

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
  optimized_urls: OptimizedUrls | null;
}

export default function AdminMedia() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
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
        title: "Error",
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

  const processImage = async (mediaId: string, storagePath: string) => {
    setProcessingIds(prev => new Set(prev).add(mediaId));
    
    try {
      const { data, error } = await supabase.functions.invoke('process-image', {
        body: { storagePath, mediaId },
      });

      if (error) throw error;
      
      if (data.success) {
        toast({
          title: "Successo",
          description: "Immagine ottimizzata con successo",
        });
        fetchMedia();
      } else {
        throw new Error(data.error || 'Processing failed');
      }
    } catch (error: any) {
      console.error('Image processing error:', error);
      toast({
        title: "Errore",
        description: `Ottimizzazione fallita: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(mediaId);
        return newSet;
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("cms-media")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("cms-media")
          .getPublicUrl(filePath);

        // Save to database
        const { data: mediaData, error: dbError } = await supabase.from("media").insert([
          {
            file_name: file.name,
            file_type: file.type,
            file_path: publicUrl,
            storage_path: filePath,
            file_size: file.size,
            uploaded_by: user.id,
            is_optimized: false,
          },
        ]).select().single();

        if (dbError) throw dbError;

        // Process image in background if it's an image
        if (file.type.startsWith("image/") && mediaData) {
          processImage(mediaData.id, filePath);
        }
      }

      toast({
        title: "Success",
        description: "Files uploaded successfully. Optimization in progress...",
      });
      fetchMedia();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string, storagePath: string) => {
    try {
      // Get optimized URLs to delete those too
      const file = media.find(f => f.id === id);
      const pathsToDelete = [storagePath];
      
      if (file?.optimized_urls) {
        // Extract storage paths from optimized URLs
        const baseDir = storagePath.split('/').slice(0, -1).join('/');
        const prefix = baseDir ? `${baseDir}/` : '';
        const baseName = storagePath.split('/').pop()?.replace(/\.[^.]+$/, '') || '';
        
        ['thumbnail', 'medium', 'large'].forEach(size => {
          pathsToDelete.push(`${prefix}optimized/${baseName}_${size}.jpg`);
          pathsToDelete.push(`${prefix}optimized/${baseName}_${size}.webp`);
        });
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("cms-media")
        .remove(pathsToDelete);

      if (storageError) console.warn('Storage delete warning:', storageError);

      // Delete from database
      const { error: dbError } = await supabase
        .from("media")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "File deleted successfully",
      });
      fetchMedia();
    } catch (error: any) {
      toast({
        title: "Error",
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
      title: "Copied",
      description: "URL copied to clipboard",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          Loading...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <h1 className="text-2xl md:text-3xl font-bold">Media Library</h1>
          <Label
            htmlFor="file-upload"
            className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : "Carica File"}
          </Label>
          <Input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
          {media.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex items-center justify-center min-h-[200px] text-muted-foreground">
                No media files yet. Upload your first file!
              </CardContent>
            </Card>
          ) : (
            media.map((file) => (
              <Card key={file.id} className="overflow-hidden">
                <div className="aspect-square bg-muted flex items-center justify-center relative">
                  {file.file_type.startsWith("image/") ? (
                    <img
                      src={file.optimized_urls?.thumbnail || file.file_path}
                      alt={file.alt_text || file.file_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-2xl md:text-4xl text-muted-foreground">📄</div>
                  )}
                  
                  {/* Processing indicator */}
                  {processingIds.has(file.id) && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                  
                  {/* Optimization badge */}
                  {file.file_type.startsWith("image/") && (
                    <div className="absolute top-1 right-1">
                      {file.is_optimized ? (
                        <Badge variant="secondary" className="text-[10px] px-1 py-0">
                          <Check className="h-3 w-3 mr-0.5" />
                          Opt
                        </Badge>
                      ) : !processingIds.has(file.id) && (
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
                    {(file.file_size / 1024).toFixed(0)} KB
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const file = media.find((f) => f.id === deleteId);
                if (file) handleDelete(file.id, file.storage_path);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}