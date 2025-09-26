import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, Heart, Zap, Shield } from "lucide-react";

interface ProductCardProps {
  name: string;
  category: string;
  description: string;
  benefits: string[];
  uses: string[];
  image: string;
  rating?: number;
  popular?: boolean;
  onCardClick?: () => void;
  onAddToCart?: () => void;
}

const ProductCard = ({
  name,
  category,
  description,
  benefits,
  uses,
  image,
  rating,
  popular,
  onCardClick,
  onAddToCart
}: ProductCardProps) => {
  return (
    <Card 
      className="product-card overflow-hidden border-border/50 relative cursor-pointer group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex flex-col"
      onClick={onCardClick}
    >
      {/* Product Image */}
      <div className="h-48 bg-cover bg-center relative" style={{
        backgroundImage: `url(${image})`
      }}>
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
        
        {/* Category badge - top-left, semi-transparent white with backdrop blur */}
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-white/90 text-foreground border-0 backdrop-blur-sm text-xs">
            {category}
          </Badge>
        </div>
        
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
        
        {/* Description - limited to 2 lines with ellipsis */}
        <p className="font-body text-muted-foreground mb-4 text-sm leading-relaxed line-clamp-2">
          {description}
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
        <div className="mb-6 flex-grow">
          <div className="flex flex-wrap gap-1">
            {uses.slice(0, 3).map((use, i) => (
              <Badge key={i} variant="outline" className="text-xs px-2 py-0.5 border-muted-foreground/30 text-muted-foreground">
                {use}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* CTA Button - gold outline, reduced padding, hover animation - pushed to bottom */}
        <div className="mt-auto">
          <Button 
            variant="outline" 
            className="cta-button w-full border-oro-primary text-oro-primary hover:bg-oro-primary hover:text-white px-4 py-2 transition-all duration-300"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.();
            }}
          >
            <ShoppingCart className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            Aggiungi al Carrello
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;