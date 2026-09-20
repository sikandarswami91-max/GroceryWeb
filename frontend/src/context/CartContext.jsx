import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const CartContext = createContext(null);
const LOCAL_CART_KEY = 'megabasket_guest_cart';

const getInitialCart = () => {
  try {
    const saved = localStorage.getItem(LOCAL_CART_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    // Ignore parse error
  }
  return { items: [], subtotal: 0, totalItems: 0 };
};

const calculateCartTotals = (items) => {
  const subtotal = items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  return { items, subtotal, totalItems };
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const [cart, setCart] = useState(getInitialCart);
  const [loading, setLoading] = useState(false);

  // Sync to localStorage whenever cart changes (useful for guest & offline preservation)
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
    } catch (e) {
      // Ignore storage error
    }
  }, [cart]);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(getInitialCart());
      return;
    }
    try {
      setLoading(true);
      const res = await cartService.getCart();
      if (res.data.success && res.data.cart) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('Failed to load cart from server:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add to cart - works for both authenticated users and guests!
  const addToCart = async (product, quantity = 1) => {
    if (!product) return false;

    // 1. If authenticated, update backend first
    if (isAuthenticated) {
      try {
        const res = await cartService.addToCart(product._id || product.id, quantity);
        if (res.data.success) {
          setCart(res.data.cart);
          success(`Added "${product.name}" to cart`);
          return true;
        }
      } catch (err) {
        error(err.response?.data?.message || 'Could not add to cart');
        return false;
      }
    }

    // 2. Guest fallback: store in state + localStorage
    setCart((prev) => {
      const items = [...(prev.items || [])];
      const prodId = product._id || product.id;
      const existingIndex = items.findIndex(
        (i) => (i.product?._id || i.product?.id || i.product) === prodId
      );

      if (existingIndex > -1) {
        items[existingIndex] = {
          ...items[existingIndex],
          quantity: items[existingIndex].quantity + quantity,
        };
      } else {
        items.push({
          product,
          quantity,
        });
      }

      return calculateCartTotals(items);
    });

    success(`Added "${product.name}" to cart`);
    return true;
  };

  // Update quantity
  const updateQuantity = async (productId, quantity) => {
    if (isAuthenticated) {
      try {
        const res = await cartService.updateQuantity(productId, quantity);
        if (res.data.success) {
          setCart(res.data.cart);
          return;
        }
      } catch (err) {
        error(err.response?.data?.message || 'Error updating quantity');
        fetchCart();
        return;
      }
    }

    // Guest update
    setCart((prev) => {
      let items = [...(prev.items || [])];
      if (quantity <= 0) {
        items = items.filter(
          (i) => (i.product?._id || i.product?.id || i.product) !== productId
        );
      } else {
        items = items.map((i) => {
          if ((i.product?._id || i.product?.id || i.product) === productId) {
            return { ...i, quantity };
          }
          return i;
        });
      }
      return calculateCartTotals(items);
    });
  };

  // Remove single item
  const removeItem = async (productId) => {
    if (isAuthenticated) {
      try {
        const res = await cartService.removeItem(productId);
        if (res.data.success) {
          setCart(res.data.cart);
          success('Item removed from cart');
          return;
        }
      } catch (err) {
        error(err.response?.data?.message || 'Error removing item');
        return;
      }
    }

    setCart((prev) => {
      const items = (prev.items || []).filter(
        (i) => (i.product?._id || i.product?.id || i.product) !== productId
      );
      return calculateCartTotals(items);
    });
    success('Item removed from cart');
  };

  // Clear cart
  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        const res = await cartService.clearCart();
        if (res.data.success) {
          setCart(res.data.cart);
          success('Cart cleared');
          return;
        }
      } catch (err) {
        error(err.response?.data?.message || 'Error clearing cart');
        return;
      }
    }

    setCart({ items: [], subtotal: 0, totalItems: 0 });
    try {
      localStorage.removeItem(LOCAL_CART_KEY);
    } catch (e) {}
    success('Cart cleared');
  };

  // Helper to check if a product is in cart and get quantity
  const getItemQuantity = (productId) => {
    const item = cart.items?.find(
      (i) => (i.product?._id || i.product?.id || i.product) === productId
    );
    return item ? item.quantity : 0;
  };

  // Calculate pricing rules (Free delivery above 499, else 40)
  const subtotal = cart.subtotal || 0;
  const shippingFee = subtotal >= 499 || subtotal === 0 ? 0 : 40;
  const grandTotal = subtotal + shippingFee;
  const freeShippingThreshold = 499;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems: cart.items || [],
        totalItems: cart.totalItems || 0,
        subtotal,
        shippingFee,
        grandTotal,
        amountNeededForFreeShipping,
        freeShippingThreshold,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
