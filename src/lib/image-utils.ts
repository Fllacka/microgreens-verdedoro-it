/**
 * Supabase Image Transformation Utilities
 * Uses Supabase's built-in image transformation API for on-the-fly resizing and optimization
 * https://supabase.com/docs/guides/storage/serving/image-transformations
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number; // 1-100, default 80
  resize?: 'cover' | 'contain' | 'fill';
  format?: 'origin' | 'avif' | 'webp'; // Not yet fully supported, but browser auto-negotiation works
}

/**
 * Predefined size configurations optimized for each use case
 * Sizes are based on actual display dimensions with 2x for retina
 */
export const IMAGE_SIZES = {
  // Product cards: 400x192 display → 800x384 for retina
  productCard: { width: 800, height: 384, quality: 75, resize: 'cover' as const },
  
  // Blog article cards: 400x192 display → 800x384 for retina  
  articleCard: { width: 800, height: 384, quality: 75, resize: 'cover' as const },
  
  // Featured article: 600x400 display → 1200x800 for retina
  featuredArticle: { width: 1200, height: 800, quality: 80, resize: 'cover' as const },
  
  // Content block images in articles: max 768px wide → 1536 for retina
  contentImage: { width: 1536, height: 1024, quality: 80, resize: 'cover' as const },
  
  // Text-image blocks: half width ~384px → 768 for retina
  textImageBlock: { width: 768, height: 576, quality: 80, resize: 'cover' as const },
  
  // Section images (what are microgreens, custom, etc): 600x320 → 1200x640 retina
  sectionImage: { width: 1200, height: 640, quality: 80, resize: 'cover' as const },
  
  // Hero backgrounds: full width, critical for LCP
  hero: { width: 1920, height: 1080, quality: 85, resize: 'cover' as const },
  
  // Thumbnails for media library
  thumbnail: { width: 300, height: 300, quality: 70, resize: 'cover' as const },
  
  // Medium size for general use
  medium: { width: 600, height: 600, quality: 80, resize: 'cover' as const },
  
  // Large for full-width content
  large: { width: 1200, height: 900, quality: 85, resize: 'cover' as const },
  
  // Original quality, no resize (for downloads)
  original: { quality: 90 },
  // Full-width fallback
  full: { width: 1200, height: 800, quality: 85, resize: 'cover' as const },
} as const;

export type ImageSizeKey = keyof typeof IMAGE_SIZES;

/**
 * Check if a URL is a Supabase storage URL
 */
export function isSupabaseStorageUrl(url: string): boolean {
  if (!url || !SUPABASE_URL) return false;
  return url.startsWith(SUPABASE_URL) && url.includes('/storage/v1/object/');
}

/**
 * Extract the storage path from a Supabase storage URL
 * e.g., https://xxx.supabase.co/storage/v1/object/public/cms-media/uploads/image.jpg
 *       -> cms-media/uploads/image.jpg
 */
export function extractStoragePath(url: string): string | null {
  if (!isSupabaseStorageUrl(url)) return null;
  
  // Match both public and private paths
  const match = url.match(/\/storage\/v1\/object\/(?:public|sign)\/(.+)/);
  return match ? match[1] : null;
}

/**
 * Transform a Supabase storage URL to use image transformations
 * This uses the /render/image/ endpoint instead of /object/
 * 
 * @param url - The original Supabase storage URL
 * @param options - Transformation options
 * @returns The transformed URL with resize/quality parameters
 */
export function getTransformedImageUrl(
  url: string,
  options: ImageTransformOptions = {}
): string {
  if (!url) return url;
  
  // If not a Supabase URL, return as-is
  if (!isSupabaseStorageUrl(url)) return url;
  
  const storagePath = extractStoragePath(url);
  if (!storagePath) return url;
  
  // Build the render URL with transformation parameters
  const params = new URLSearchParams();
  
  if (options.width) params.set('width', options.width.toString());
  if (options.height) params.set('height', options.height.toString());
  if (options.quality) params.set('quality', options.quality.toString());
  if (options.resize) params.set('resize', options.resize);
  
  const queryString = params.toString();
  const renderUrl = `${SUPABASE_URL}/storage/v1/render/image/public/${storagePath}`;
  
  return queryString ? `${renderUrl}?${queryString}` : renderUrl;
}

/**
 * Get a transformed image URL using a predefined size
 */
export function getImageUrl(url: string, size: ImageSizeKey = 'medium'): string {
  const config = IMAGE_SIZES[size];
  return getTransformedImageUrl(url, config);
}

/**
 * Generate srcset for responsive images
 * Returns a comma-separated list of URLs with width descriptors
 */
export function getResponsiveSrcSet(url: string): string {
  if (!isSupabaseStorageUrl(url)) return url;
  
  const sizes = [
    { width: 320, quality: 70 },
    { width: 640, quality: 75 },
    { width: 960, quality: 80 },
    { width: 1280, quality: 85 },
    { width: 1920, quality: 85 },
  ];
  
  return sizes
    .map(({ width, quality }) => {
      const transformedUrl = getTransformedImageUrl(url, { width, quality, resize: 'cover' });
      return `${transformedUrl} ${width}w`;
    })
    .join(', ');
}

/**
 * Generate sizes attribute for responsive images based on layout context
 */
export function getImageSizes(context: ImageContext): string {
  switch (context) {
    case 'thumbnail':
      return '150px';
    case 'productCard':
    case 'articleCard':
      // Cards: full width on mobile, 50% on tablet, ~400px on desktop
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px';
    case 'featuredArticle':
      // Featured: full width on mobile, 50% on desktop (in 2-col grid)
      return '(max-width: 768px) 100vw, 50vw';
    case 'contentImage':
      // Content images in articles: max ~768px container
      return '(max-width: 768px) 100vw, 768px';
    case 'textImageBlock':
      // Text-image blocks: full on mobile, half on desktop
      return '(max-width: 1024px) 100vw, 50vw';
    case 'sectionImage':
      // Section images: full on mobile, half on desktop grid
      return '(max-width: 1024px) 100vw, 50vw';
    case 'hero':
      return '100vw';
    case 'full':
    default:
      return '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px';
  }
}

// ImageContext is the same as ImageSizeKey for consistency
export type ImageContext = ImageSizeKey;
