/**
 * Build-time script to fetch the current Hero image URL from Supabase
 * Used by the Vite plugin to inject preload tags during build
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Parse .env file manually (runs during build, not in browser)
function loadEnvVars(): Record<string, string> {
  try {
    const envFile = readFileSync(resolve(process.cwd(), '.env'), 'utf-8');
    const vars: Record<string, string> = {};
    for (const line of envFile.split('\n')) {
      const match = line.match(/^(\w+)=["']?(.+?)["']?$/);
      if (match) vars[match[1]] = match[2];
    }
    return vars;
  } catch { return {}; }
}

const env = loadEnvVars();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface HeroContent {
  background_image_id?: string;
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
 * Returns the URL as-is to match the <img src> on the page
 */
export function getOptimizedHeroUrl(url: string): string {
  return url;
}
