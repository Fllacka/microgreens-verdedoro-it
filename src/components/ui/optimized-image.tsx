import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  getImageUrl, 
  getResponsiveSrcSet, 
  getImageSizes, 
  isSupabaseStorageUrl,
  type ImageSizeKey 
} from "@/lib/image-utils";

// Legacy interface for backwards compatibility
export interface OptimizedUrls {
  thumbnail?: string;
  medium?: string;
  large?: string;
  original?: string;
  webp_thumbnail?: string;
  webp_medium?: string;
  webp_large?: string;
}

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  objectFit?: "cover" | "contain" | "fill" | "none";
  aspectRatio?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  /** @deprecated Use size prop instead - Supabase transforms images on-the-fly */
  optimizedUrls?: OptimizedUrls | null;
  /** Size preset: thumbnail (150px), card (400px), medium (600px), large (1200px), hero (1920px) */
  size?: ImageSizeKey;
  /** Layout context for responsive sizing */
  context?: 'card' | 'hero' | 'thumbnail' | 'full';
}

/**
 * Optimized Image Component for better Core Web Vitals
 * - Uses Supabase's built-in image transformation API for on-the-fly resizing
 * - Lazy loading for below-fold images (priority=false)
 * - Eager loading for above-fold images (priority=true)
 * - Responsive srcset for optimal image delivery
 * - Skeleton placeholder while loading
 */
const OptimizedImage = ({
  src,
  alt,
  className,
  containerClassName,
  width,
  height,
  priority = false,
  objectFit = "cover",
  aspectRatio,
  fallbackSrc,
  onLoad,
  onError,
  optimizedUrls, // Legacy - ignored now, kept for backwards compatibility
  size = "medium",
  context = "full",
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (priority || shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "200px", // Start loading 200px before entering viewport
        threshold: 0,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, shouldLoad]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Get the optimized image URL using Supabase transformations
  const getOptimizedSrc = (): string => {
    if (hasError && fallbackSrc) return fallbackSrc;
    if (!src) return fallbackSrc || '';
    
    // Use Supabase image transformation if it's a Supabase URL
    if (isSupabaseStorageUrl(src)) {
      return getImageUrl(src, size);
    }
    
    return src;
  };

  // Get responsive srcset for Supabase images
  const getSrcSet = (): string | undefined => {
    if (!src || !isSupabaseStorageUrl(src)) return undefined;
    return getResponsiveSrcSet(src);
  };

  const imageSrc = getOptimizedSrc();
  const srcSet = getSrcSet();
  const sizes = getImageSizes(context);

  const objectFitClass = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
    none: "object-none",
  }[objectFit];

  return (
    <div
      ref={imgRef}
      className={cn(
        "relative overflow-hidden bg-muted/30",
        containerClassName
      )}
      style={{
        aspectRatio: aspectRatio,
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
      }}
    >
      {/* Skeleton placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-muted/50" />
      )}

      {/* Optimized image with responsive srcset */}
      {shouldLoad && imageSrc && (
        <img
          src={imageSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          className={cn(
            "transition-opacity duration-300",
            objectFitClass,
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
