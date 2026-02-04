/**
 * Client-Side Image Compression Utilities
 * 
 * Compresses images before upload to ensure:
 * - Max file size of 500KB
 * - Max dimensions of 1920px
 * - WebP format when possible
 * - BlurHash generation for perceived performance
 */

import imageCompression from 'browser-image-compression';
import { encode } from 'blurhash';

export interface CompressionResult {
  file: File;
  width: number;
  height: number;
  blurhash: string;
  originalSize: number;
  compressedSize: number;
}

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxSizeMB: 0.5,           // Max 500KB
  maxWidthOrHeight: 1920,   // Max Full HD
  quality: 0.85,
};

/**
 * Get image dimensions from a File object
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Generate BlurHash from an image file
 * Uses a pre-resized image for large files to prevent memory issues
 */
export async function generateBlurHash(file: File): Promise<string> {
  // For large files (>2MB), pre-resize to avoid memory crashes
  let fileToProcess = file;
  
  if (file.size > 2 * 1024 * 1024) {
    console.log(`[generateBlurHash] File is large (${formatBytes(file.size)}), pre-resizing...`);
    try {
      fileToProcess = await imageCompression(file, {
        maxWidthOrHeight: 300,
        useWebWorker: false,
        initialQuality: 0.8,
      });
      console.log(`[generateBlurHash] Pre-resized to ${formatBytes(fileToProcess.size)}`);
    } catch (resizeError) {
      console.warn(`[generateBlurHash] Pre-resize failed, trying with original:`, resizeError);
    }
  }

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        // Use small dimensions for performance
        const size = 32;
        canvas.width = size;
        canvas.height = size;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(img.src);
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, size, size);
        const imageData = ctx.getImageData(0, 0, size, size);
        
        // Components determine hash complexity (4x3 is a good balance)
        const hash = encode(imageData.data, size, size, 4, 3);
        
        URL.revokeObjectURL(img.src);
        resolve(hash);
      } catch (error) {
        URL.revokeObjectURL(img.src);
        reject(error);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image for BlurHash'));
    };
    img.src = URL.createObjectURL(fileToProcess);
  });
}

/**
 * Compress an image file with smart defaults
 * Returns the compressed file along with metadata
 */
/**
 * Extract metadata from an image file without compression
 * More robust for large files - doesn't compress, just extracts metadata
 */
export async function extractImageMetadata(file: File): Promise<{
  width: number;
  height: number;
  blurhash: string;
}> {
  console.log(`[extractImageMetadata] Starting for ${file.name} (${formatBytes(file.size)})`);
  
  // Get dimensions from original file
  const dimensions = await getImageDimensions(file);
  console.log(`[extractImageMetadata] ✅ Dimensions: ${dimensions.width}x${dimensions.height}`);
  
  // Generate BlurHash (function handles pre-resizing for large files internally)
  const blurhash = await generateBlurHash(file);
  console.log(`[extractImageMetadata] ✅ BlurHash: ${blurhash.substring(0, 10)}...`);
  
  return {
    width: dimensions.width,
    height: dimensions.height,
    blurhash,
  };
}

/**
 * Compress an image file with smart defaults
 * Returns the compressed file along with metadata
 * 
 * NOTE: For the new on-demand optimization system, we skip client-side
 * compression and only extract metadata. Actual optimization happens
 * server-side via the optimize-image edge function.
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const originalSize = file.size;

  console.log(`[compressImage] Starting for ${file.name} (${formatBytes(originalSize)}, type: ${file.type})`);

  // NEW: Skip client-side compression entirely
  // The optimize-image edge function handles resizing server-side
  // We only extract metadata here for immediate database storage
  console.log(`[compressImage] Using on-demand optimization - skipping client-side compression`);
  
  let metadata: { width: number; height: number; blurhash: string };
  
  try {
    metadata = await extractImageMetadata(file);
  } catch (metadataError) {
    console.error(`[compressImage] ❌ Failed to extract metadata:`, metadataError);
    throw metadataError;
  }

  return {
    file: file, // Return original file - server will optimize on-demand
    width: metadata.width,
    height: metadata.height,
    blurhash: metadata.blurhash,
    originalSize,
    compressedSize: file.size, // Same as original since we're not compressing
  };
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
