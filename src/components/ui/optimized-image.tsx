import { cn } from "@/lib/utils";
import { buildSrcSet, type ResponsiveUrls } from "@/lib/image-utils";

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
  /** Responsive image URLs for srcset generation */
  optimizedUrls?: ResponsiveUrls | null;
  /** Layout-specific sizes hint for the browser */
  sizes?: string;
}

/**
 * Responsive Image Component
 * Supports srcset/sizes for responsive image delivery
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
  sizes,
}: OptimizedImageProps) => {
  const objectFitClass = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
    none: "object-none",
  }[objectFit];

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (fallbackSrc && e.currentTarget.src !== fallbackSrc) {
      e.currentTarget.src = fallbackSrc;
    }
    onError?.();
  };

  const srcSet = buildSrcSet(optimizedUrls);
  const defaultSizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 1200px";

  return (
    <div
      className={cn("relative overflow-hidden", containerClassName)}
      style={{
        aspectRatio: aspectRatio,
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
      }}
    >
      <img
        src={src || fallbackSrc || ""}
        alt={alt}
        className={cn("w-full h-full", objectFitClass, className)}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        srcSet={srcSet}
        sizes={srcSet ? (sizes || defaultSizes) : undefined}
        onLoad={onLoad}
        onError={handleError}
      />
    </div>
  );
};

export default OptimizedImage;
