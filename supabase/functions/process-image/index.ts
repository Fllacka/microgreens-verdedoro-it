import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Image size configurations
const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  medium: { width: 600, height: 600 },
  large: { width: 1200, height: 1200 },
};

// Quality settings
const JPEG_QUALITY = 85;
const WEBP_QUALITY = 80;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Authentication: require admin or editor role ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verify the caller's identity using their JWT
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.claims.sub;

    // Check that user has admin or editor role
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await serviceClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .in('role', ['admin', 'editor'])
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Forbidden: admin or editor role required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // --- End authentication ---

    const { storagePath, mediaId } = await req.json();
    
    if (!storagePath || !mediaId) {
      throw new Error('storagePath and mediaId are required');
    }

    console.log(`Processing image: ${storagePath}, mediaId: ${mediaId}`);

    // Use service role client for storage/db operations
    const supabase = serviceClient;

    // Download original image
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('cms-media')
      .download(storagePath);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw new Error(`Failed to download image: ${downloadError.message}`);
    }

    // Get file extension and base name
    const pathParts = storagePath.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const baseName = fileName.replace(/\.[^.]+$/, '');
    const baseDir = pathParts.slice(0, -1).join('/');
    const prefix = baseDir ? `${baseDir}/` : '';

    // Convert blob to array buffer
    const arrayBuffer = await fileData.arrayBuffer();
    const originalBytes = new Uint8Array(arrayBuffer);

    const blob = new Blob([originalBytes], { type: 'image/jpeg' });
    
    const optimizedUrls: Record<string, string> = {};
    
    // Store original
    const { data: originalUrl } = supabase.storage
      .from('cms-media')
      .getPublicUrl(storagePath);
    optimizedUrls.original = originalUrl.publicUrl;

    // For each size, create a copy
    for (const [sizeName, dimensions] of Object.entries(IMAGE_SIZES)) {
      const sizedPath = `${prefix}optimized/${baseName}_${sizeName}.jpg`;
      const webpPath = `${prefix}optimized/${baseName}_${sizeName}.webp`;

      const { error: uploadJpegError } = await supabase.storage
        .from('cms-media')
        .upload(sizedPath, originalBytes, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (!uploadJpegError) {
        const { data: jpegUrl } = supabase.storage
          .from('cms-media')
          .getPublicUrl(sizedPath);
        optimizedUrls[sizeName] = jpegUrl.publicUrl;
        console.log(`Created ${sizeName}: ${jpegUrl.publicUrl}`);
      } else {
        console.error(`Failed to upload ${sizeName}:`, uploadJpegError);
      }

      const { error: uploadWebpError } = await supabase.storage
        .from('cms-media')
        .upload(webpPath, originalBytes, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (!uploadWebpError) {
        const { data: webpUrl } = supabase.storage
          .from('cms-media')
          .getPublicUrl(webpPath);
        optimizedUrls[`webp_${sizeName}`] = webpUrl.publicUrl;
        console.log(`Created webp_${sizeName}: ${webpUrl.publicUrl}`);
      } else {
        console.error(`Failed to upload webp_${sizeName}:`, uploadWebpError);
      }
    }

    // Update the media record with optimized URLs
    const { error: updateError } = await supabase
      .from('media')
      .update({
        optimized_urls: optimizedUrls,
        is_optimized: true,
      })
      .eq('id', mediaId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw new Error(`Failed to update media record: ${updateError.message}`);
    }

    console.log('Successfully processed image');

    return new Response(
      JSON.stringify({
        success: true,
        optimizedUrls,
        message: 'Image processed successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing image:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
