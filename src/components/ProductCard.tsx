import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, Zap, Shield } from "lucide-react";
import OptimizedImage from "@/components/ui/optimized-image";

interface ProductCardProps {
  name: string;
  category: string;
  description: string;
  gridDescription?: string;
  benefits: string[];
  uses: string[];
  image: string;
  rating?: number;
  popular?: boolean;
  onCardClick?: () => void;
  priority?: boolean;
}

const ProductCard = ({
  name,
  category,
  description,
  gridDescription,
  benefits,
  uses,
  image,
  rating,
  popular,
  onCardClick,
  priority = false,
}: ProductCardProps) => {
  return (
    <Card 
      className="product-card overflow-hidden border-border/50 relative cursor-pointer group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex flex-col"
      onClick={onCardClick}
    >
      {/* Product Image - Optimized with WebP support and fixed 1:1 aspect ratio */}
      <div className="relative aspect-square overflow-hidden">
        <OptimizedImage
          src={image}
          alt={`${name} - microgreen fresco`}
          className="w-full h-full"
          containerClassName="w-full h-full"
          priority={priority}
          objectFit="cover"
          aspectRatio="1/1"
          size="productCard"
          context="productCard"
        />
        
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none" />
        
        {/* Popular badge - outline style with gold */}
        {popular && (
          <div className="absolute top-3 right-3 z-10">
            <Badge variant="outline" className="border-oro-primary text-oro-primary bg-white/90 backdrop-blur-sm">
              <Star className="h-3 w-3 mr-1" />
              Popolare
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-5 flex flex-col flex-grow">
        {/* Product name - larger and bolder */}
        <h3 className="font-display text-2xl font-bold text-primary mb-3 leading-tight">
          {name}
        </h3>
        
        {/* Description - uses gridDescription if available, otherwise falls back to description */}
        <p className="font-body text-muted-foreground mb-4 text-sm leading-relaxed line-clamp-2">
          {gridDescription || description}
        </p>
        
        {/* Benefits - horizontal pills with icons, max 3 */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {benefits.slice(0, 3).map((benefit, i) => {
              const icons = [Heart, Zap, Shield];
              const IconComponent = icons[i % icons.length];
              return (
                <Badge key={i} variant="secondary" className="bg-verde-primary/10 text-verde-primary border-verde-primary/20 text-xs px-3 py-1">
                  <IconComponent className="h-3 w-3 mr-1" />
                  {benefit}
                </Badge>
              );
            })}
          </div>
        </div>
        
        {/* Uses - small outlined tags in single row, max 3 */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {uses.slice(0, 3).map((use, i) => (
              <Badge key={i} variant="outline" className="text-xs px-2 py-0.5 border-muted-foreground/30 text-muted-foreground">
                {use}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;