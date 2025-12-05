import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  itemCount: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  lastAddedTimestamp: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isOpen, setIsOpen] = useState(false);
  const [lastAddedTimestamp, setLastAddedTimestamp] = useState(0);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const openCart = useCallback(() => setIsOpen(true), []);

  const addItem = (newItem: CartItem) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === newItem.id);
      if (existing) {
        return prev.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prev, newItem];
    });
    
    // Trigger badge animation
    setLastAddedTimestamp(Date.now());
    
    // Show toast notification instead of opening drawer
    toast({
      title: "Aggiunto al carrello",
      description: `${newItem.name} (${newItem.quantity}g)`,
      action: (
        <button 
          onClick={openCart}
          className="text-sm font-medium text-primary hover:underline"
        >
          Vedi carrello
        </button>
      ),
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const itemCount = items.length;

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      clearCart,
      totalItems,
      itemCount,
      isOpen,
      openCart,
      closeCart: () => setIsOpen(false),
      lastAddedTimestamp,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
