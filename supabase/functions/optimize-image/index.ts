import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  ImageMagick,
  initializeImageMagick,
  MagickFormat,
} from "npm:@imagemagick/magick-wasm@0.0.30";

// Initialize ImageMagick at module level
const wasmBytes = await Deno.readFile(
  new URL(
    "magick.wasm",
    import.meta.resolve("npm:@imagemagick/magick-wasm@0.0.30"),
  ),
);
await initializeImageMagick(wasmBytes);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Context-specific optimization configurations
const OPTIMIZATION_CONFIGS: Record<string, { width: number; height?: number; quality: number; fit: 'cover' | 'contain' | 'fill' }> = {
  hero: { width: 1920, quality: 80, fit: 'cover' },
  productCard: { width: 800, height: 800, quality: 80, fit: 'cover' },
  productDetail: { width: 1200, height: 1200, quality: 80, fit: 'cover' },
  articleCard: { width: 800, quality: 80, fit: 'cover' },
  featuredArticle: { width: 1200, quality: 75, fit: 'cover' },
  contentImage: { width: 1536, quality: 75, fit: 'contain' },
  textImageBlock: { width: 768, quality: 75, fit: 'contain' },
  sectionImage: { width: 1200, quality: 75, fit: 'cover' },
  thumbnail: { width: 300, height: 300, quality: 65, fit: 'cover' },
  logo: { width: 400, quality: 85, fit: 'contain' },
  ogImage: { width: 1200, height: 630, quality: 80, fit: 'cover' },
};

type ContextType = keyof typeof OPTIMIZATION_CONFIGS;

// Size threshold for aggressive compression (2MB)
const SIZE_THRESHOLD_AGGRESSIVE = 2 * 1024 * 1024;

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

    // Apply more aggressive compression for large files
    let effectiveQuality = config.quality;
    if (originalSize > SIZE_THRESHOLD_AGGRESSIVE) {
      effectiveQuality = Math.max(config.quality - 15, 50);
      console.log(`[optimize-image] Large file detected, reducing quality to ${effectiveQuality}`);
    }

    // Use ImageMagick WASM for processing
    console.log(`[optimize-image] Optimizing to ${config.width}x${config.height || 'auto'} at quality ${effectiveQuality}`);
    
    const originalUint8 = new Uint8Array(originalBytes);
    
    // Use ImageMagick.read synchronously (returns the result of the callback)
    const optimizedBytes = ImageMagick.read(originalUint8, (img): Uint8Array => {
      // Resize the image
      const targetWidth = config.width;
      const targetHeight = config.height;
      
      if (targetHeight) {
        // Fixed dimensions - resize to fill and crop center
        const aspectRatio = img.width / img.height;
        const targetAspect = targetWidth / targetHeight;
        
        if (aspectRatio > targetAspect) {
          // Image is wider, resize to target height then crop width
          const newWidth = Math.round(targetHeight * aspectRatio);
          img.resize(newWidth, targetHeight);
        } else {
          // Image is taller, resize to target width then crop height
          const newHeight = Math.round(targetWidth / aspectRatio);
          img.resize(targetWidth, newHeight);
        }
        
        // Center crop to exact dimensions
        const cropX = Math.round((img.width - targetWidth) / 2);
        const cropY = Math.round((img.height - targetHeight) / 2);
        img.crop(targetWidth, targetHeight, cropX, cropY);
      } else {
        // Width only, maintain aspect ratio
        const aspectRatio = img.height / img.width;
        const newHeight = Math.round(targetWidth * aspectRatio);
        img.resize(targetWidth, newHeight);
      }
      
      // Set quality
      img.quality = effectiveQuality;
      
      // Write as WebP for better compression
      return img.write(MagickFormat.Webp, (data) => data);
    });
    
    const optimizedSize = optimizedBytes.byteLength;
    const reduction = Math.round((1 - optimizedSize / originalSize) * 100);
    
    console.log(`[optimize-image] Optimized size: ${(optimizedSize / 1024).toFixed(1)} KB (${reduction}% reduction)`);
    
    // Generate optimized path
    const pathParts = storagePath.split('/');
    const fileName = pathParts.pop()!;
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    const optimizedPath = `optimized/${context}/${baseName}.webp`;
    
    // Upload optimized version with long cache
    console.log(`[optimize-image] Uploading to: ${optimizedPath}`);
    const { error: uploadError } = await supabase.storage
      .from('cms-media')
      .upload(optimizedPath, optimizedBytes, {
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
        width: config.width,
        height: config.height || null,
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
        reduction,
        dimensions: { width: config.width, height: config.height || 'auto' },
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
