import { useState, useRef, useEffect } from "react";
import { Blurhash } from "react-blurhash";
import { cn } from "@/lib/utils";
import { 
  getImageUrl, 
  getResponsiveSrcSet, 
  getImageSizes, 
  isSupabaseStorageUrl,
  type ImageSizeKey,
} from "@/lib/image-utils";

interface SmartImageProps {
  src: string;
  alt: string;
  blurhash?: string | null;
  width?: number;
  height?: number;
  priority?: boolean;
  context?: ImageSizeKey;
  className?: string;
  containerClassName?: string;
  objectFit?: "cover" | "contain" | "fill" | "none";
  aspectRatio?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  /** Pre-optimized URL from CMS (takes priority over src) */
  optimizedUrl?: string | null;
}

/**
 * SmartImage Component - Optimized for Core Web Vitals
 * 
 * Features:
 * - BlurHash placeholder for perceived instant loading
 * - Prioritizes optimizedUrl from CMS when available
 * - Responsive srcset with WebP format (via Supabase transforms)
 * - Lazy loading with IntersectionObserver for below-fold images
 * - Priority loading for LCP images (eager + high fetchPriority)
 * - Proper width/height to prevent CLS
 */
const SmartImage = ({
  src,
  alt,
  blurhash,
  width,
  height,
  priority = false,
  context = "medium",
  className,
  containerClassName,
  objectFit = "cover",
  aspectRatio,
  fallbackSrc,
  onLoad,
  onError,
  optimizedUrl,
}: SmartImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lazy loading with Intersection Observer for non-priority images
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

    if (containerRef.current) {
      observer.observe(containerRef.current);
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

  // Get the best available image URL
  // Priority: optimizedUrl > transformed src > original src > fallback
  const getOptimizedSrc = (): string => {
    if (hasError && fallbackSrc) return fallbackSrc;
    
    // Use pre-optimized URL from CMS if available
    if (optimizedUrl) return optimizedUrl;
    
    if (!src) return fallbackSrc || "";
    
    // For Supabase URLs, apply transformation
    if (isSupabaseStorageUrl(src)) {
      return getImageUrl(src, context);
    }
    
    return src;
  };

  // Get responsive srcset for Supabase images
  // Only used if no pre-optimized URL is provided
  const getSrcSet = (): string | undefined => {
    if (optimizedUrl) return undefined; // Pre-optimized, no need for srcset
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

  // Show BlurHash only when we have it and image isn't loaded yet
  const showBlurhash = blurhash && !isLoaded && !hasError;

  // Calculate aspect ratio from width/height if not provided
  const computedAspectRatio = aspectRatio || (width && height ? `${width}/${height}` : undefined);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden",
        containerClassName
      )}
      style={{
        aspectRatio: computedAspectRatio,
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
      }}
    >
      {/* BlurHash placeholder - renders instantly */}
      {showBlurhash && (
        <div className="absolute inset-0 z-10">
          <Blurhash
            hash={blurhash}
            width="100%"
            height="100%"
            resolutionX={32}
            resolutionY={32}
            punch={1}
          />
        </div>
      )}

      {/* Fallback skeleton when no BlurHash */}
      {!blurhash && !isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-muted/50" />
      )}

      {/* Actual image with responsive srcset */}
      {shouldLoad && imageSrc && (
        <img
          src={imageSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          className={cn(
            "w-full h-full transition-opacity duration-300",
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

export default SmartImage;
