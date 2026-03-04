import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  publishedAt: string;
  imageUrl?: string;
  readTime?: string;
  showButton?: boolean;
  buttonText?: string;
  className?: string;
  priority?: boolean;
}

const ArticleCard = ({
  title,
  slug,
  excerpt,
  category,
  publishedAt,
  imageUrl,
  readTime,
  showButton = true,
  buttonText = "Leggi",
  className,
  priority = false,
}: ArticleCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const cardContent = (
    <Card className={cn("overflow-hidden hover-lift border-border/50 bg-card flex flex-col h-full", className)}>
      {/* Image - 16:9 aspect ratio */}
      <div className="relative aspect-video overflow-hidden bg-muted/30">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${title} - articolo blog`}
            className="w-full h-full object-cover"
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <div className="w-full h-full bg-gradient-hero" />
        )}
      </div>

      {/* Content */}
      <CardContent className="p-6 flex flex-col flex-1">
        {/* Header: Category + Read Time */}
        <div className="flex items-center justify-between mb-3">
          {category && (
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          )}
          {readTime && (
            <div className="flex items-center text-xs text-muted-foreground gap-1">
              <Clock className="w-3 h-3" />
              {readTime}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-lg font-semibold text-foreground mb-3 line-clamp-2">{title}</h3>

        {/* Excerpt */}
        {excerpt && (
          <p className="font-body text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
            {excerpt.replace(/<[^>]*>/g, "")}
          </p>
        )}

        {/* Footer: Date + Button */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xs text-muted-foreground">{formatDate(publishedAt)}</span>
          {showButton && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/blog/${slug}`}>{buttonText}</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // If no button, make the entire card clickable
  if (!showButton) {
    return (
      <Link to={`/blog/${slug}`} className="block h-full">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default ArticleCard;
