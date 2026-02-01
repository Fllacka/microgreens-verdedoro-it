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
 * Uses a small canvas for performance
 */
export function generateBlurHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
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
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Compress an image file with smart defaults
 * Returns the compressed file along with metadata
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const originalSize = file.size;

  // Skip compression for small files (under 100KB)
  const skipCompression = originalSize < 100 * 1024;

  let compressedFile: File;
  
  if (skipCompression) {
    compressedFile = file;
  } else {
    const compressionOptions = {
      maxSizeMB: opts.maxSizeMB!,
      maxWidthOrHeight: opts.maxWidthOrHeight!,
      useWebWorker: true,
      initialQuality: opts.quality!,
      // Try to output WebP for better compression
      fileType: file.type === 'image/png' ? 'image/webp' : undefined,
    };

    compressedFile = await imageCompression(file, compressionOptions);
  }

  // Get dimensions and BlurHash in parallel
  const [dimensions, blurhash] = await Promise.all([
    getImageDimensions(compressedFile),
    generateBlurHash(compressedFile),
  ]);

  return {
    file: compressedFile,
    width: dimensions.width,
    height: dimensions.height,
    blurhash,
    originalSize,
    compressedSize: compressedFile.size,
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
