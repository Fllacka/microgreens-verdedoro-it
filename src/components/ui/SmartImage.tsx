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
}

/**
 * SmartImage Component - Optimized for Core Web Vitals
 * 
 * Features:
 * - BlurHash placeholder for perceived instant loading
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

  // Get optimized image URL
  const getOptimizedSrc = (): string => {
    if (hasError && fallbackSrc) return fallbackSrc;
    if (!src) return fallbackSrc || "";
    
    if (isSupabaseStorageUrl(src)) {
      return getImageUrl(src, context);
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

  // Show BlurHash only when we have it and image isn't loaded yet
  const showBlurhash = blurhash && !isLoaded && !hasError;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden",
        containerClassName
      )}
      style={{
        aspectRatio: aspectRatio,
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
