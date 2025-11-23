'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  _id: string;
  name: {
    fr: string;
    ar: string;
  };
  price: number;
  originalPrice?: number;
  discount: number;
  images: string[];
  category: string;
  size: string; // Can be empty initially
  color: string; // Can be empty initially
  quantity: number;
  availableSizes?: string[]; // From product data
  availableColors?: string[]; // From product data
  description?: {
    fr: string;
    ar: string;
  };
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, size?: string, color?: string, quantity?: number) => void;
  removeFromCart: (itemId: string, size: string, color: string) => void;
  updateQuantity: (itemId: string, size: string, color: string, quantity: number) => void;
  updateItemSizeColor: (itemId: string, oldSize: string, oldColor: string, newSize: string, newColor: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getTotalDiscount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        setItems([]);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: any, size: string = '', color: string = '', quantity: number = 1) => {
    setItems(prevItems => {
      // If size and color are provided, check if item already exists with same size and color
      if (size && color) {
        const existingItemIndex = prevItems.findIndex(
          item => item._id === product._id && item.size === size && item.color === color
        );

        if (existingItemIndex > -1) {
          // Update quantity of existing item
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex].quantity += quantity;
          return updatedItems;
        }
      }
      
      // Add new item (either new variant or item without size/color)
      const newItem: CartItem = {
        _id: product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        images: product.images,
        category: product.category,
        size: size || '',
        color: color || '',
        quantity: quantity,
        availableSizes: product.size || [],
        availableColors: product.color || [],
        description: product.description
      };
      return [...prevItems, newItem];
    });
  };

  const updateItemSizeColor = (itemId: string, oldSize: string, oldColor: string, newSize: string, newColor: string) => {
    setItems(prevItems => {
      // Check if new size/color combination already exists
      const existingItemIndex = prevItems.findIndex(
        item => item._id === itemId && item.size === newSize && item.color === newColor
      );

      if (existingItemIndex > -1 && (oldSize !== newSize || oldColor !== newColor)) {
        // Merge quantities if same product with same size/color exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += prevItems.find(
          item => item._id === itemId && item.size === oldSize && item.color === oldColor
        )?.quantity || 0;
        // Remove old item
        return updatedItems.filter(item => !(item._id === itemId && item.size === oldSize && item.color === oldColor));
      } else {
        // Update size and color
        return prevItems.map(item =>
          item._id === itemId && item.size === oldSize && item.color === oldColor
            ? { ...item, size: newSize, color: newColor }
            : item
        );
      }
    });
  };

  const removeFromCart = (itemId: string, size: string, color: string) => {
    setItems(prevItems => 
      prevItems.filter(item => {
        // Handle empty size/color by using index or unique identifier
        if (!size && !color) {
          // If both are empty, we need a different way to identify
          // For now, we'll match by _id only if both are empty
          return !(item._id === itemId && !item.size && !item.color);
        }
        return !(item._id === itemId && item.size === size && item.color === color);
      })
    );
  };

  const updateQuantity = (itemId: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId, size, color);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item => {
        // Handle empty size/color matching
        if (!size && !color) {
          if (item._id === itemId && !item.size && !item.color) {
            return { ...item, quantity };
          }
        } else if (item._id === itemId && item.size === size && item.color === color) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalDiscount = () => {
    return items.reduce((total, item) => {
      if (item.originalPrice && item.originalPrice > item.price) {
        return total + ((item.originalPrice - item.price) * item.quantity);
      }
      return total;
    }, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateItemSizeColor,
      clearCart,
      getTotalItems,
      getTotalPrice,
      getTotalDiscount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
