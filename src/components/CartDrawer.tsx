import { useCart } from '@/contexts/CartContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Format price in euros
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
};

export function CartDrawer() {
  const {
    items,
    removeItem,
    totalItems,
    totalPrice,
    isOpen,
    closeCart
  } = useCart();
  
  const hasPrices = items.some(item => item.price !== undefined && item.price > 0);
  
  return (
    <Sheet open={isOpen} onOpenChange={open => !open && closeCart()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <ShoppingBag className="h-5 w-5" />
            Il tuo carrello
            {totalItems > 0}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 px-6 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">
              Il carrello è vuoto
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              Aggiungi dei microgreens per iniziare il tuo ordine
            </p>
            <Button variant="oro" asChild onClick={closeCart}>
              <Link to="/microgreens">
                Scopri i prodotti
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 py-4">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 p-2 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-semibold text-xs truncate mb-0.5">
                        {item.name}
                      </h4>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {item.quantity}g
                        </p>
                        {item.price !== undefined && item.price > 0 && (
                          <p className="text-xs font-semibold text-verde-primary">
                            {formatPrice(item.price)}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeItem(item.id)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t px-6 py-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Quantità totale</span>
                <span className="font-semibold">{totalItems}g</span>
              </div>
              
              {hasPrices && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Subtotale</span>
                  <span className="font-bold text-verde-primary">{formatPrice(totalPrice)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="space-y-2">
                <Button variant="oro" size="lg" className="w-full" asChild onClick={closeCart}>
                  <Link to="/contatti">
                    Richiedi preventivo
                    {hasPrices && ` - ${formatPrice(totalPrice)}`}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                
                <Button 
                  size="sm" 
                  className="w-full bg-verde-primary text-white hover:bg-verde-primary/90" 
                  onClick={closeCart} 
                  asChild
                >
                  <Link to="/microgreens">
                    Continua gli acquisti
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
