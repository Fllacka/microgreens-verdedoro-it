import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  ImageMagick,
  initializeImageMagick,
  MagickFormat,
} from "npm:@imagemagick/magick-wasm@0.0.30";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Target widths for responsive images
const SIZES = [
  { name: 'sm', width: 400 },
  { name: 'md', width: 800 },
  { name: 'lg', width: 1200 },
];

const WEBP_QUALITY = 80;

// Initialize magick-wasm once
const wasmBytes = await Deno.readFile(
  new URL(
    "magick.wasm",
    import.meta.resolve("npm:@imagemagick/magick-wasm@0.0.30"),
  ),
);
await initializeImageMagick(wasmBytes);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { storagePath, mediaId } = await req.json();

    if (!storagePath || !mediaId) {
      throw new Error('storagePath and mediaId are required');
    }

    console.log(`Processing image: ${storagePath}, mediaId: ${mediaId}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download original image
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('cms-media')
      .download(storagePath);

    if (downloadError) {
      throw new Error(`Failed to download image: ${downloadError.message}`);
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const originalBytes = new Uint8Array(arrayBuffer);

    // Get base name for responsive files
    const pathParts = storagePath.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const baseName = fileName.replace(/\.[^.]+$/, '');

    // Store original URL
    const { data: originalUrlData } = supabase.storage
      .from('cms-media')
      .getPublicUrl(storagePath);

    const optimizedUrls: Record<string, string> = {
      original: originalUrlData.publicUrl,
    };

    // Get original dimensions
    let originalWidth = 0;
    let originalHeight = 0;

    ImageMagick.read(originalBytes, (img) => {
      originalWidth = img.width;
      originalHeight = img.height;
    });

    console.log(`Original dimensions: ${originalWidth}x${originalHeight}`);

    // Generate each responsive size
    for (const size of SIZES) {
      // Skip if original is smaller than target
      if (originalWidth <= size.width) {
        console.log(`Skipping ${size.name}: original (${originalWidth}w) <= target (${size.width}w)`);
        optimizedUrls[size.name] = originalUrlData.publicUrl;
        continue;
      }

      try {
        const resizedBytes = ImageMagick.read(originalBytes, (img): Uint8Array => {
          // Resize maintaining aspect ratio (width-constrained)
          const ratio = size.width / img.width;
          const targetHeight = Math.round(img.height * ratio);
          img.resize(size.width, targetHeight);
          img.quality = WEBP_QUALITY;

          return img.write(MagickFormat.Webp, (data) => new Uint8Array(data));
        });

        const responsivePath = `uploads/responsive/${baseName}_${size.name}.webp`;

        const { error: uploadError } = await supabase.storage
          .from('cms-media')
          .upload(responsivePath, resizedBytes, {
            contentType: 'image/webp',
            upsert: true,
            cacheControl: '31536000',
          });

        if (uploadError) {
          console.error(`Failed to upload ${size.name}:`, uploadError);
          optimizedUrls[size.name] = originalUrlData.publicUrl;
          continue;
        }

        const { data: sizedUrl } = supabase.storage
          .from('cms-media')
          .getPublicUrl(responsivePath);

        optimizedUrls[size.name] = sizedUrl.publicUrl;
        console.log(`Created ${size.name} (${size.width}w): ${resizedBytes.length} bytes`);
      } catch (resizeError) {
        console.error(`Error resizing ${size.name}:`, resizeError);
        optimizedUrls[size.name] = originalUrlData.publicUrl;
      }
    }

    // Update media record
    const { error: updateError } = await supabase
      .from('media')
      .update({
        optimized_urls: optimizedUrls,
        is_optimized: true,
        width: originalWidth,
        height: originalHeight,
      })
      .eq('id', mediaId);

    if (updateError) {
      throw new Error(`Failed to update media record: ${updateError.message}`);
    }

    console.log('Successfully processed image:', optimizedUrls);

    return new Response(
      JSON.stringify({ success: true, optimizedUrls }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error processing image:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
