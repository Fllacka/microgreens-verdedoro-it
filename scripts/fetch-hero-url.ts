/**
 * Build-time script to fetch the current Hero image URL from Supabase
 * Used by the Vite plugin to inject preload tags during build
 */

import { createClient } from '@supabase/supabase-js';

// These are loaded from environment variables during build
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface HeroContent {
  background_image_id?: string;
}

interface HomepageSection {
  content: HeroContent;
}

interface Media {
  file_path: string;
}

/**
 * Fetches the current Hero image URL from the CMS
 * Returns null if not found or on error
 */
export async function getHeroImageUrl(): Promise<string | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('[Hero Preload] Missing Supabase credentials, skipping preload injection');
    return null;
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Fetch hero section content
    const { data: heroSection, error: heroError } = await supabase
      .from('homepage_sections')
      .select('content')
      .eq('id', 'hero')
      .single();

    if (heroError || !heroSection) {
      console.warn('[Hero Preload] Could not fetch hero section:', heroError?.message);
      return null;
    }

    const content = heroSection.content as HeroContent;
    const imageId = content?.background_image_id;

    if (!imageId) {
      console.warn('[Hero Preload] No background_image_id found in hero section');
      return null;
    }

    // Fetch the media record
    const { data: mediaRecord, error: mediaError } = await supabase
      .from('media')
      .select('file_path')
      .eq('id', imageId)
      .single();

    if (mediaError || !mediaRecord) {
      console.warn('[Hero Preload] Could not fetch media record:', mediaError?.message);
      return null;
    }

    return mediaRecord.file_path;
  } catch (error) {
    console.error('[Hero Preload] Unexpected error:', error);
    return null;
  }
}

/**
 * Transforms a Supabase storage URL to use image transformations
 */
export function getOptimizedHeroUrl(url: string): string {
  if (!url || !SUPABASE_URL) return url;
  
  // Check if it's a Supabase storage URL
  if (!url.startsWith(SUPABASE_URL) || !url.includes('/storage/v1/object/')) {
    return url;
  }

  // Extract storage path
  const match = url.match(/\/storage\/v1\/object\/(?:public|sign)\/(.+)/);
  if (!match) return url;

  const storagePath = match[1];
  
  // Build render URL with hero size optimization (1920px wide, WebP, quality 85)
  const params = new URLSearchParams({
    width: '1920',
    quality: '85',
    format: 'webp',
  });

  return `${SUPABASE_URL}/storage/v1/render/image/public/${storagePath}?${params}`;
}
