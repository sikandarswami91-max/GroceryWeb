import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistService } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';
import { useCart } from './CartContext.jsx';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const { fetchCart } = useCart();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    try {
      setLoading(true);
      const res = await wishlistService.getWishlist();
      if (res.data.success && res.data.wishlist) {
        setWishlist(res.data.wishlist.products || []);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item._id || item) === productId);
  };

  const addToWishlist = async (product) => {
    if (!isAuthenticated) {
      error('Please sign in to save items to your wishlist');
      return;
    }

    const prodId = product._id || product.id;
    try {
      const res = await wishlistService.addToWishlist(prodId);
      if (res.data.success) {
        setWishlist(res.data.wishlist.products || []);
        success(`Added "${product.name}" to wishlist`);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error adding to wishlist');
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) return;

    try {
      const res = await wishlistService.removeFromWishlist(productId);
      if (res.data.success) {
        setWishlist(res.data.wishlist.products || []);
        success('Removed from wishlist');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error removing from wishlist');
    }
  };

  const moveToCart = async (productId) => {
    if (!isAuthenticated) return;

    try {
      const res = await wishlistService.moveToCart(productId);
      if (res.data.success) {
        // Refresh wishlist and cart
        await fetchWishlist();
        await fetchCart();
        success('Item moved to your cart!');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error moving item to cart');
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        totalWishlist: wishlist.length,
        loading,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        moveToCart,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
