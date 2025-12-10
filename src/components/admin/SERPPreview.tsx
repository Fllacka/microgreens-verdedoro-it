import { cn } from "@/lib/utils";

interface SERPPreviewProps {
  title: string;
  description: string;
  url: string;
  className?: string;
}

export const SERPPreview = ({ title, description, url, className }: SERPPreviewProps) => {
  const displayTitle = title || "Titolo della pagina";
  const displayDescription = description || "Descrizione della pagina che apparirà nei risultati di ricerca...";
  const displayUrl = url || "verdedoro.it/pagina";

  // Truncate title at ~60 chars and description at ~160 chars (Google's limits)
  const truncatedTitle = displayTitle.length > 60 ? displayTitle.substring(0, 57) + "..." : displayTitle;
  const truncatedDescription = displayDescription.length > 160 ? displayDescription.substring(0, 157) + "..." : displayDescription;

  return (
    <div className={cn("bg-card border rounded-lg p-4", className)}>
      <p className="text-xs text-muted-foreground mb-3 font-medium">Anteprima Google</p>
      <div className="bg-background rounded-md p-4 border">
        {/* Google-style result */}
        <div className="space-y-1">
          {/* URL line */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">V</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Verde d'Oro</span>
              <span className="text-xs text-muted-foreground">{displayUrl}</span>
            </div>
          </div>
          
          {/* Title */}
          <h3 className="text-lg text-[#1a0dab] hover:underline cursor-pointer font-normal leading-snug">
            {truncatedTitle}
          </h3>
          
          {/* Description */}
          <p className="text-sm text-[#545454] leading-relaxed">
            {truncatedDescription}
          </p>
        </div>
      </div>
    </div>
  );
};
