import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Menu, ShoppingBasket, Leaf, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { getImageUrl, isSupabaseStorageUrl } from "@/lib/image-utils";

// Marker for dropdown items in navigation
const DROPDOWN_MARKER = "#microgreens-dropdown";

// Default dropdown items (fallback)
const defaultDropdownItems = [
  { id: "1", name: "Cosa sono i microgreens", url: "/cosa-sono-i-microgreens" },
  { id: "2", name: "I nostri microgreens", url: "/microgreens" },
  { id: "3", name: "Microgreens su misura", url: "/microgreens-su-misura" },
];

interface DropdownSubItem {
  id: string;
  name: string;
  url: string;
}

interface NavigationItem {
  id: string;
  name: string;
  url: string;
  visible: boolean;
  order: number;
  dropdown_items?: DropdownSubItem[];
}

interface CtaButton {
  text: string;
  url: string;
  visible: boolean;
}

interface HeaderSettings {
  navigation_items: NavigationItem[];
  cta_button: CtaButton;
}

const defaultNavigationItems: NavigationItem[] = [
  { id: "1", name: "Home", url: "/", visible: true, order: 0 },
  { id: "2", name: "Chi Siamo", url: "/chi-siamo", visible: true, order: 1 },
  { id: "3", name: "Microgreens", url: "/microgreens", visible: true, order: 2 },
  { id: "4", name: "Su Misura", url: "/microgreens-su-misura", visible: true, order: 3 },
  { id: "5", name: "Blog", url: "/blog", visible: true, order: 4 },
  { id: "6", name: "Contatti", url: "/contatti", visible: true, order: 5 },
];

const defaultCtaButton: CtaButton = {
  text: "Richiedi Preventivo",
  url: "/contatti",
  visible: true
};

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null | undefined>(undefined);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>(defaultNavigationItems);
  const [ctaButton, setCtaButton] = useState<CtaButton>(defaultCtaButton);
  const location = useLocation();
  const { itemCount, openCart, lastAddedTimestamp } = useCart();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select(`
            logo_id,
            header_settings,
            media:logo_id (
              file_path,
              optimized_urls
            )
          `)
          .eq("id", "default")
          .maybeSingle();

        if (error) throw error;

        if (data?.media && typeof data.media === 'object' && 'file_path' in data.media) {
          const mediaData = data.media as { file_path: string };
          // Use on-the-fly transformation for optimal logo size
          const optimizedUrl = isSupabaseStorageUrl(mediaData.file_path)
            ? getImageUrl(mediaData.file_path, 'logo')
            : mediaData.file_path;
          setLogoUrl(optimizedUrl);
        } else {
          setLogoUrl(null);
        }

        if (data?.header_settings) {
          const settings = data.header_settings as unknown as HeaderSettings;
          if (settings.navigation_items) {
            setNavigationItems(settings.navigation_items);
          }
          if (settings.cta_button) {
            setCtaButton(settings.cta_button);
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        setLogoUrl(null);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    if (lastAddedTimestamp > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [lastAddedTimestamp]);

  const visibleNavItems = navigationItems
    .filter(item => item.visible)
    .sort((a, b) => a.order - b.order);

  const isActive = (path: string) => location.pathname === path;

  const FallbackLogo = ({ className }: { className?: string }) => (
    <div className={cn("flex items-center space-x-3", className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-verde">
        <Leaf className="h-6 w-6 text-primary-foreground" />
      </div>
      <div>
        <h1 className="font-display text-xl font-bold text-primary">
          Verde D'Oro
        </h1>
        <p className="text-xs text-muted-foreground font-body">Microgreens</p>
      </div>
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-width">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="h-14 min-w-[140px] flex items-center">
              {logoUrl === undefined ? (
                <div className="h-14 w-36 bg-muted/30 rounded animate-pulse" />
              ) : logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Verde D'Oro - Microgreens" 
                  className="h-14 w-auto"
                  width={144}
                  height={56}
                  fetchPriority="high"
                  decoding="async"
                />
              ) : (
                <FallbackLogo />
              )}
            </div>
          </Link>

          {/* Right side navigation */}
          <div className="flex items-center space-x-8">
            {/* Desktop Navigation */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList className="space-x-6">
                {!isLoaded ? (
                  // Skeleton loader for navigation
                  <div className="flex space-x-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-4 w-16 bg-muted/30 rounded animate-pulse" />
                    ))}
                  </div>
                ) : visibleNavItems.map((item) => {
                    // Check if this is the dropdown placeholder
                    if (item.url === DROPDOWN_MARKER) {
                      const dropdownItems = item.dropdown_items || defaultDropdownItems;
                      const dropdownUrls = dropdownItems.map(sub => sub.url);
                      return (
                        <NavigationMenuItem key={item.id}>
                          <NavigationMenuTrigger 
                            className={cn(
                              "font-body font-medium text-base bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent",
                              dropdownUrls.some(url => isActive(url)) 
                                ? "text-foreground" 
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {item.name}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <ul className="grid w-[280px] gap-1 p-3 bg-background border border-border rounded-lg shadow-lg">
                              {dropdownItems.map((subItem) => (
                                <li key={subItem.url}>
                                  <NavigationMenuLink asChild>
                                    <Link
                                      to={subItem.url}
                                      className={cn(
                                        "block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors",
                                        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                        isActive(subItem.url) 
                                          ? "bg-accent text-accent-foreground font-medium" 
                                          : "text-foreground"
                                      )}
                                    >
                                      {subItem.name}
                                    </Link>
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          </NavigationMenuContent>
                        </NavigationMenuItem>
                      );
                    }
                    
                    // Regular link
                    return (
                      <NavigationMenuItem key={item.id}>
                        <Link 
                          to={item.url} 
                          className={cn(
                            "relative font-body font-medium transition-colors hover:text-foreground px-3 py-2",
                            "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:scale-x-0 after:bg-foreground after:transition-transform after:duration-300 hover:after:scale-x-100",
                            isActive(item.url) ? "text-foreground after:scale-x-100" : "text-muted-foreground"
                          )}
                        >
                          {item.name}
                        </Link>
                      </NavigationMenuItem>
                    );
                  })}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Desktop Cart */}
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
                  <div className="flex items-center mb-8">
                    {logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt="Verde D'Oro - Microgreens" 
                        className="h-10 w-auto"
                      />
                    ) : (
                      <FallbackLogo className="scale-90" />
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-4">
                    {!isLoaded ? (
                      // Skeleton loader for mobile menu
                      [1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-10 bg-muted/30 rounded-lg animate-pulse" />
                      ))
                    ) : visibleNavItems.map(item => {
                        // Check if this is the dropdown placeholder
                        if (item.url === DROPDOWN_MARKER) {
                          const dropdownItems = item.dropdown_items || defaultDropdownItems;
                          return (
                            <div key={item.id} className="space-y-2">
                              {/* Section header */}
                              <div className="px-4 py-2 font-body font-medium text-foreground">
                                {item.name}
                              </div>
                              {/* Sub-items with indentation */}
                              <div className="pl-4 space-y-1">
                                {dropdownItems.map((subItem) => (
                                  <Link
                                    key={subItem.url}
                                    to={subItem.url}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                      "block px-4 py-2 rounded-lg font-body transition-colors",
                                      isActive(subItem.url)
                                        ? "bg-secondary text-foreground font-medium"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                    )}
                                  >
                                    {subItem.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          );
                        }

                        // Regular link
                        return (
                          <Link 
                            key={item.id} 
                            to={item.url} 
                            onClick={() => setIsOpen(false)} 
                            className={cn(
                              "block px-4 py-3 rounded-lg font-body font-medium transition-colors",
                              isActive(item.url) 
                                ? "bg-secondary text-foreground" 
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                            )}
                          >
                            {item.name}
                          </Link>
                        );
                      })}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
