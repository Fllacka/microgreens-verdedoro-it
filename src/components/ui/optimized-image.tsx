import { cn } from "@/lib/utils";

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
}

/**
 * Simple Image Component
 * Just displays images with lazy loading - no optimization, no BlurHash
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
        onLoad={onLoad}
        onError={handleError}
      />
    </div>
  );
};

export default OptimizedImage;
