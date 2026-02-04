import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Context-specific optimization configurations
const OPTIMIZATION_CONFIGS: Record<string, { width: number; height?: number; quality: number; fit: 'cover' | 'contain' | 'fill' }> = {
  hero: { width: 1920, quality: 85, fit: 'cover' },
  productCard: { width: 800, height: 800, quality: 85, fit: 'cover' },
  productDetail: { width: 1200, height: 1200, quality: 85, fit: 'cover' },
  articleCard: { width: 800, quality: 85, fit: 'cover' },
  featuredArticle: { width: 1200, quality: 80, fit: 'cover' },
  contentImage: { width: 1536, quality: 80, fit: 'contain' },
  textImageBlock: { width: 768, quality: 80, fit: 'contain' },
  sectionImage: { width: 1200, quality: 80, fit: 'cover' },
  thumbnail: { width: 300, height: 300, quality: 70, fit: 'cover' },
  logo: { width: 400, quality: 90, fit: 'contain' },
  ogImage: { width: 1200, height: 630, quality: 85, fit: 'cover' },
};

type ContextType = keyof typeof OPTIMIZATION_CONFIGS;

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { storagePath, mediaId, context } = await req.json();

    if (!storagePath || !mediaId || !context) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: storagePath, mediaId, context' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const config = OPTIMIZATION_CONFIGS[context as ContextType];
    if (!config) {
      return new Response(
        JSON.stringify({ error: `Unknown context: ${context}. Valid contexts: ${Object.keys(OPTIMIZATION_CONFIGS).join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[optimize-image] Processing ${storagePath} for context: ${context}`);

    // Initialize Supabase client with service role for full access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download original image from storage
    console.log(`[optimize-image] Downloading original from: ${storagePath}`);
    const { data: originalData, error: downloadError } = await supabase.storage
      .from('cms-media')
      .download(storagePath);

    if (downloadError || !originalData) {
      console.error('[optimize-image] Download error:', downloadError);
      return new Response(
        JSON.stringify({ error: `Failed to download original image: ${downloadError?.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const originalBytes = await originalData.arrayBuffer();
    const originalSize = originalBytes.byteLength;
    console.log(`[optimize-image] Original size: ${(originalSize / 1024).toFixed(1)} KB`);

    // Use Photon library for image processing in Deno
    // Import photon for image processing
    const { Image, PhotonImage, resize, SamplingFilter } = await import("https://unpkg.com/@aspect-build/photon@0.1.5/dist/index.js");
    
    // Load image into PhotonImage
    const uint8Array = new Uint8Array(originalBytes);
    let photonImage: PhotonImage;
    
    try {
      photonImage = PhotonImage.new_from_byteslice(uint8Array);
    } catch (loadError) {
      console.error('[optimize-image] Failed to load image with Photon:', loadError);
      
      // Fallback: try using native browser APIs
      console.log('[optimize-image] Attempting fallback with Canvas API...');
      
      // Create optimized version using canvas (simpler approach)
      const blob = new Blob([originalBytes]);
      const imageBitmap = await createImageBitmap(blob);
      
      const { width: origWidth, height: origHeight } = imageBitmap;
      let newWidth = config.width;
      let newHeight = config.height;
      
      // Calculate dimensions maintaining aspect ratio if height not specified
      if (!newHeight) {
        const aspectRatio = origHeight / origWidth;
        newHeight = Math.round(newWidth * aspectRatio);
      }
      
      // Don't upscale - use original dimensions if smaller
      if (origWidth < newWidth) {
        newWidth = origWidth;
        newHeight = config.height ? Math.min(config.height, origHeight) : origHeight;
      }
      
      // Create canvas and draw resized image
      const canvas = new OffscreenCanvas(newWidth, newHeight);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');
      
      ctx.drawImage(imageBitmap, 0, 0, newWidth, newHeight);
      
      // Convert to WebP blob
      const webpBlob = await canvas.convertToBlob({ 
        type: 'image/webp', 
        quality: config.quality / 100 
      });
      
      const optimizedBytes = await webpBlob.arrayBuffer();
      const optimizedSize = optimizedBytes.byteLength;
      
      console.log(`[optimize-image] Optimized size (canvas): ${(optimizedSize / 1024).toFixed(1)} KB (${Math.round((1 - optimizedSize / originalSize) * 100)}% reduction)`);
      
      // Generate optimized path
      const pathParts = storagePath.split('/');
      const fileName = pathParts.pop()!;
      const baseName = fileName.replace(/\.[^/.]+$/, '');
      const optimizedPath = `optimized/${context}/${baseName}.webp`;
      
      // Upload optimized version
      const { error: uploadError } = await supabase.storage
        .from('cms-media')
        .upload(optimizedPath, new Uint8Array(optimizedBytes), {
          contentType: 'image/webp',
          cacheControl: '31536000',
          upsert: true,
        });

      if (uploadError) {
        console.error('[optimize-image] Upload error:', uploadError);
        return new Response(
          JSON.stringify({ error: `Failed to upload optimized image: ${uploadError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('cms-media')
        .getPublicUrl(optimizedPath);

      // Update media record with optimized version info
      const { data: currentMedia, error: fetchError } = await supabase
        .from('media')
        .select('optimized_versions')
        .eq('id', mediaId)
        .single();

      if (fetchError) {
        console.error('[optimize-image] Fetch media error:', fetchError);
      }

      const existingVersions = (currentMedia?.optimized_versions as Record<string, unknown>) || {};
      const updatedVersions = {
        ...existingVersions,
        [context]: {
          url: publicUrl,
          width: newWidth,
          height: newHeight,
          size: optimizedSize,
          created_at: new Date().toISOString(),
        },
      };

      const { error: updateError } = await supabase
        .from('media')
        .update({ optimized_versions: updatedVersions })
        .eq('id', mediaId);

      if (updateError) {
        console.error('[optimize-image] Update media error:', updateError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          context,
          optimizedUrl: publicUrl,
          originalSize,
          optimizedSize,
          reduction: Math.round((1 - optimizedSize / originalSize) * 100),
          dimensions: { width: newWidth, height: newHeight },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If Photon loaded successfully, use it for processing
    const origWidth = photonImage.get_width();
    const origHeight = photonImage.get_height();
    
    let newWidth = config.width;
    let newHeight = config.height;
    
    // Calculate dimensions maintaining aspect ratio if height not specified
    if (!newHeight) {
      const aspectRatio = origHeight / origWidth;
      newHeight = Math.round(newWidth * aspectRatio);
    }
    
    // Don't upscale - use original dimensions if smaller
    if (origWidth < newWidth) {
      newWidth = origWidth;
      newHeight = config.height ? Math.min(config.height, origHeight) : origHeight;
    }

    console.log(`[optimize-image] Resizing from ${origWidth}x${origHeight} to ${newWidth}x${newHeight}`);

    // Resize using Lanczos3 for high quality
    const resized = resize(photonImage, newWidth, newHeight, SamplingFilter.Lanczos3);
    
    // Get WebP bytes
    const webpBytes = resized.get_bytes_webp();
    const optimizedSize = webpBytes.length;
    
    console.log(`[optimize-image] Optimized size: ${(optimizedSize / 1024).toFixed(1)} KB (${Math.round((1 - optimizedSize / originalSize) * 100)}% reduction)`);

    // Generate optimized path
    const pathParts = storagePath.split('/');
    const fileName = pathParts.pop()!;
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    const optimizedPath = `optimized/${context}/${baseName}.webp`;

    // Upload optimized version with long cache
    console.log(`[optimize-image] Uploading to: ${optimizedPath}`);
    const { error: uploadError } = await supabase.storage
      .from('cms-media')
      .upload(optimizedPath, webpBytes, {
        contentType: 'image/webp',
        cacheControl: '31536000', // 1 year
        upsert: true,
      });

    if (uploadError) {
      console.error('[optimize-image] Upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: `Failed to upload optimized image: ${uploadError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('cms-media')
      .getPublicUrl(optimizedPath);

    console.log(`[optimize-image] Public URL: ${publicUrl}`);

    // Update media record with optimized version info
    const { data: currentMedia, error: fetchError } = await supabase
      .from('media')
      .select('optimized_versions')
      .eq('id', mediaId)
      .single();

    if (fetchError) {
      console.error('[optimize-image] Fetch media error:', fetchError);
    }

    const existingVersions = (currentMedia?.optimized_versions as Record<string, unknown>) || {};
    const updatedVersions = {
      ...existingVersions,
      [context]: {
        url: publicUrl,
        width: newWidth,
        height: newHeight,
        size: optimizedSize,
        created_at: new Date().toISOString(),
      },
    };

    const { error: updateError } = await supabase
      .from('media')
      .update({ optimized_versions: updatedVersions })
      .eq('id', mediaId);

    if (updateError) {
      console.error('[optimize-image] Update media error:', updateError);
    }

    console.log(`[optimize-image] ✅ Success! Saved ${context} version`);

    return new Response(
      JSON.stringify({
        success: true,
        context,
        optimizedUrl: publicUrl,
        originalSize,
        optimizedSize,
        reduction: Math.round((1 - optimizedSize / originalSize) * 100),
        dimensions: { width: newWidth, height: newHeight },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[optimize-image] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
