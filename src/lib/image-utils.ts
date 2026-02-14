/**
 * Image Utilities
 * Helpers for responsive image delivery
 */

export interface ResponsiveUrls {
  sm?: string;
  md?: string;
  lg?: string;
  original?: string;
  [key: string]: string | undefined;
}

/**
 * Build a srcset string from responsive URLs
 */
export function buildSrcSet(urls: ResponsiveUrls | null | undefined): string | undefined {
  if (!urls) return undefined;

  const entries: string[] = [];
  if (urls.sm) entries.push(`${urls.sm} 400w`);
  if (urls.md) entries.push(`${urls.md} 800w`);
  if (urls.lg) entries.push(`${urls.lg} 1200w`);

  return entries.length > 0 ? entries.join(', ') : undefined;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
