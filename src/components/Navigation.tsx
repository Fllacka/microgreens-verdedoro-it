import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Menu, X, Leaf, ShoppingBasket } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const location = useLocation();
  const { itemCount, openCart, lastAddedTimestamp } = useCart();

  // Trigger animation when item is added
  useEffect(() => {
    if (lastAddedTimestamp > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [lastAddedTimestamp]);
  const navigationItems = [{
    name: "Home",
    href: "/"
  }, {
    name: "Chi Siamo",
    href: "/chi-siamo"
  }, {
    name: "Microgreens",
    href: "/microgreens"
  }, {
    name: "Su Misura",
    href: "/microgreens-su-misura"
  }, {
    name: "Blog",
    href: "/blog"
  }, {
    name: "Contatti",
    href: "/contatti"
  }];
  const isActive = (path: string) => location.pathname === path;
  return <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-width">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover-lift">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-verde">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-primary">
                Verde D'Oro
              </h1>
              <p className="text-xs text-muted-foreground font-body">Microgreens</p>
            </div>
          </Link>

          {/* Right side navigation */}
          <div className="flex items-center space-x-8">
            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              {navigationItems.map(item => <Link key={item.name} to={item.href} className={cn("relative font-body font-medium transition-colors hover:text-primary", "after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-full after:scale-x-0 after:bg-gradient-verde after:transition-transform after:duration-300 hover:after:scale-x-100", isActive(item.href) ? "text-primary after:scale-x-100" : "text-muted-foreground")}>
                  {item.name}
                </Link>)}
            </div>

            {/* Desktop CTA & Cart */}
            <div className="hidden md:flex md:items-center md:gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-primary/10"
                onClick={openCart}
                aria-label="Apri carrello"
              >
                <ShoppingBasket className="h-6 w-6 text-primary" />
                {itemCount > 0 && (
                  <Badge 
                    variant="default"
                    className={cn(
                      "absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-oro-primary text-primary-foreground transition-transform",
                      isAnimating && "animate-cart-bounce"
                    )}
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Mobile Cart & Menu */}
            <div className="flex items-center gap-2 md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-primary/10"
                onClick={openCart}
                aria-label="Apri carrello"
              >
                <ShoppingBasket className="h-6 w-6 text-primary" />
                {itemCount > 0 && (
                  <Badge 
                    variant="default"
                    className={cn(
                      "absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-oro-primary text-primary-foreground transition-transform",
                      isAnimating && "animate-cart-bounce"
                    )}
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </Badge>
                )}
              </Button>
              
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Toggle menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              <SheetContent side="right" className="w-80">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-verde">
                    <Leaf className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="font-display text-lg font-bold text-primary">
                    Verde D'Oro
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close menu">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex flex-col space-y-4">
                {navigationItems.map(item => <Link key={item.name} to={item.href} onClick={() => setIsOpen(false)} className={cn("block px-4 py-3 rounded-lg font-body font-medium transition-colors", isActive(item.href) ? "bg-secondary text-primary" : "text-muted-foreground hover:text-primary hover:bg-secondary/50")}>
                    {item.name}
                  </Link>)}
                
                <div className="pt-4 border-t border-border">
                  <Button variant="oro" className="w-full" asChild>
                    <Link to="/contatti" onClick={() => setIsOpen(false)}>
                      Richiedi Preventivo
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>;
};
export default Navigation;