import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

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
  optimizedUrls?: OptimizedUrls | null;
  size?: "thumbnail" | "medium" | "large" | "original";
}

/**
 * Optimized Image Component for better Core Web Vitals
 * - Lazy loading for below-fold images (priority=false)
 * - Eager loading for above-fold images (priority=true)
 * - Explicit dimensions to prevent CLS
 * - Intersection Observer for efficient lazy loading
 * - Skeleton placeholder while loading
 * - WebP support with JPEG fallback via picture element
 * - Multiple size variants (thumbnail, medium, large, original)
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
  optimizedUrls,
  size = "large",
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

  // Get the best available image URL based on size preference and optimization status
  const getImageUrl = (): string => {
    if (hasError && fallbackSrc) return fallbackSrc;
    if (!optimizedUrls) return src;

    // Try to get the requested size, fall back to original
    const sizeUrl = optimizedUrls[size];
    if (sizeUrl) return sizeUrl;

    // Fall back to any available size
    return optimizedUrls.original || optimizedUrls.large || optimizedUrls.medium || src;
  };

  // Get WebP URL if available
  const getWebPUrl = (): string | null => {
    if (!optimizedUrls) return null;
    
    const webpKey = `webp_${size}` as keyof OptimizedUrls;
    const webpUrl = optimizedUrls[webpKey];
    if (webpUrl) return webpUrl;

    // Fall back to any available WebP
    return optimizedUrls.webp_large || optimizedUrls.webp_medium || optimizedUrls.webp_thumbnail || null;
  };

  // Generate srcset for responsive images
  const getSrcSet = (): string | undefined => {
    if (!optimizedUrls) return undefined;

    const srcsetParts: string[] = [];
    
    if (optimizedUrls.thumbnail) {
      srcsetParts.push(`${optimizedUrls.thumbnail} 150w`);
    }
    if (optimizedUrls.medium) {
      srcsetParts.push(`${optimizedUrls.medium} 600w`);
    }
    if (optimizedUrls.large) {
      srcsetParts.push(`${optimizedUrls.large} 1200w`);
    }

    return srcsetParts.length > 0 ? srcsetParts.join(", ") : undefined;
  };

  // Generate WebP srcset
  const getWebPSrcSet = (): string | undefined => {
    if (!optimizedUrls) return undefined;

    const srcsetParts: string[] = [];
    
    if (optimizedUrls.webp_thumbnail) {
      srcsetParts.push(`${optimizedUrls.webp_thumbnail} 150w`);
    }
    if (optimizedUrls.webp_medium) {
      srcsetParts.push(`${optimizedUrls.webp_medium} 600w`);
    }
    if (optimizedUrls.webp_large) {
      srcsetParts.push(`${optimizedUrls.webp_large} 1200w`);
    }

    return srcsetParts.length > 0 ? srcsetParts.join(", ") : undefined;
  };

  const imageSrc = getImageUrl();
  const webpUrl = getWebPUrl();
  const srcSet = getSrcSet();
  const webpSrcSet = getWebPSrcSet();

  const objectFitClass = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
    none: "object-none",
  }[objectFit];

  // Determine sizes attribute based on size prop
  const sizesAttr = size === "thumbnail" 
    ? "150px"
    : size === "medium"
    ? "(max-width: 640px) 100vw, 600px"
    : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 1200px";

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

      {/* Image with picture element for WebP support */}
      {shouldLoad && (
        <picture>
          {/* WebP source */}
          {webpSrcSet && (
            <source
              type="image/webp"
              srcSet={webpSrcSet}
              sizes={sizesAttr}
            />
          )}
          {webpUrl && !webpSrcSet && (
            <source type="image/webp" srcSet={webpUrl} />
          )}
          
          {/* JPEG/PNG source with srcset */}
          {srcSet && (
            <source
              type="image/jpeg"
              srcSet={srcSet}
              sizes={sizesAttr}
            />
          )}
          
          {/* Fallback img element */}
          <img
            src={imageSrc}
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
        </picture>
      )}
    </div>
  );
};

export default OptimizedImage;