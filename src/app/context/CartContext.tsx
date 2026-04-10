'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  cartItemId: string;
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
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateItemSizeColor: (cartItemId: string, newSize: string, newColor: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getTotalDiscount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const createCartItemId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `cart-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const normalizeStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    : [];

const normalizeLocalizedText = (value: unknown) => {
  if (typeof value === 'string') {
    return { fr: value, ar: value };
  }

  if (value && typeof value === 'object') {
    const localizedValue = value as Record<string, unknown>;

    return {
      fr: typeof localizedValue.fr === 'string' ? localizedValue.fr : '',
      ar: typeof localizedValue.ar === 'string' ? localizedValue.ar : '',
    };
  }

  return { fr: '', ar: '' };
};

const normalizeDescription = (value: unknown) => {
  if (!value) return undefined;

  const normalized = normalizeLocalizedText(value);
  return normalized.fr || normalized.ar ? normalized : undefined;
};

const normalizeCartItem = (value: unknown): CartItem | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const rawItem = value as Record<string, unknown>;
  const productId =
    typeof rawItem._id === 'string'
      ? rawItem._id
      : typeof rawItem.id === 'string'
        ? rawItem.id
        : '';

  if (!productId) {
    return null;
  }

  const availableSizes = normalizeStringArray(rawItem.availableSizes);
  const availableColors = normalizeStringArray(rawItem.availableColors);

  return {
    cartItemId:
      typeof rawItem.cartItemId === 'string' && rawItem.cartItemId
        ? rawItem.cartItemId
        : createCartItemId(),
    _id: productId,
    name: normalizeLocalizedText(rawItem.name),
    price: typeof rawItem.price === 'number' ? rawItem.price : 0,
    originalPrice: typeof rawItem.originalPrice === 'number' ? rawItem.originalPrice : undefined,
    discount: typeof rawItem.discount === 'number' ? rawItem.discount : 0,
    images: normalizeStringArray(rawItem.images),
    category: typeof rawItem.category === 'string' ? rawItem.category : '',
    size: typeof rawItem.size === 'string' ? rawItem.size : '',
    color: typeof rawItem.color === 'string' ? rawItem.color : '',
    quantity: typeof rawItem.quantity === 'number' && rawItem.quantity > 0 ? rawItem.quantity : 1,
    availableSizes,
    availableColors,
    description: normalizeDescription(rawItem.description),
  };
};

const buildCartItem = (product: any, size: string, color: string, quantity: number, cartItemId?: string): CartItem => ({
  cartItemId: cartItemId ?? createCartItemId(),
  _id: product._id,
  name: normalizeLocalizedText(product.name),
  price: typeof product.price === 'number' ? product.price : 0,
  originalPrice: typeof product.originalPrice === 'number' ? product.originalPrice : undefined,
  discount: typeof product.discount === 'number' ? product.discount : 0,
  images: normalizeStringArray(product.images),
  category: typeof product.category === 'string' ? product.category : '',
  size,
  color,
  quantity,
  availableSizes: normalizeStringArray(product.size),
  availableColors: normalizeStringArray(product.color),
  description: normalizeDescription(product.description),
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    let cancelled = false;

    const hydrateCart = async () => {
      const savedCart = localStorage.getItem('cart');
      if (!savedCart) {
        return;
      }

      try {
        const parsedCart = JSON.parse(savedCart);
        const normalizedItems = Array.isArray(parsedCart)
          ? parsedCart
              .map(normalizeCartItem)
              .filter((item): item is CartItem => item !== null)
          : [];

        setItems(normalizedItems);

        if (normalizedItems.length === 0) {
          return;
        }

        const uniqueProductIds = [...new Set(normalizedItems.map((item) => item._id))];
        const productEntries = await Promise.all(
          uniqueProductIds.map(async (productId) => {
            try {
              const response = await fetch(`/api/products/${productId}`, { cache: 'no-store' });

              if (!response.ok) {
                return null;
              }

              const data = await response.json();
              if (!data.success || !data.data) {
                return null;
              }

              return [productId, data.data] as const;
            } catch (error) {
              console.error('Error refreshing cart product:', error);
              return null;
            }
          })
        );

        if (cancelled) {
          return;
        }

        const productMap = new Map(
          productEntries.filter((entry): entry is readonly [string, any] => entry !== null)
        );

        if (productMap.size === 0) {
          return;
        }

        setItems((prevItems) =>
          prevItems.map((item) => {
            const product = productMap.get(item._id);

            if (!product) {
              return item;
            }

            return {
              ...item,
              name: normalizeLocalizedText(product.name),
              price: typeof product.price === 'number' ? product.price : item.price,
              originalPrice:
                typeof product.originalPrice === 'number' ? product.originalPrice : item.originalPrice,
              discount: typeof product.discount === 'number' ? product.discount : item.discount,
              images: normalizeStringArray(product.images).length > 0 ? normalizeStringArray(product.images) : item.images,
              category: typeof product.category === 'string' ? product.category : item.category,
              availableSizes: normalizeStringArray(product.size),
              availableColors: normalizeStringArray(product.color),
              description: normalizeDescription(product.description) ?? item.description,
            };
          })
        );
      } catch {
        setItems([]);
      }

    };

    void hydrateCart();

    return () => {
      cancelled = true;
    };
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: any, size: string = '', color: string = '', quantity: number = 1) => {
    setItems(prevItems => {
      if (!product || typeof product !== 'object' || typeof product._id !== 'string') {
        return prevItems;
      }

      const existingItemIndex = prevItems.findIndex(
        item => item._id === product._id && item.size === size && item.color === color
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      }

      const newItem = buildCartItem(product, size || '', color || '', quantity);
      return [...prevItems, newItem];
    });
  };

  const updateItemSizeColor = (cartItemId: string, newSize: string, newColor: string) => {
    setItems(prevItems => {
      const currentItem = prevItems.find((item) => item.cartItemId === cartItemId);
      if (!currentItem) {
        return prevItems;
      }

      const existingItemIndex = prevItems.findIndex(
        item =>
          item.cartItemId !== cartItemId &&
          item._id === currentItem._id &&
          item.size === newSize &&
          item.color === newColor
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += currentItem.quantity;

        return updatedItems.filter(item => item.cartItemId !== cartItemId);
      }

      return prevItems.map(item =>
        item.cartItemId === cartItemId
          ? { ...item, size: newSize, color: newColor }
          : item
      );
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
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
