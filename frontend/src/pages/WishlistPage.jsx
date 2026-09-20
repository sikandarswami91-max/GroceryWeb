import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const { wishlist, removeFromWishlist, moveToCart } = useWishlist();

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Your Wishlist</h2>
        <p className="text-sm text-slate-700 max-w-sm mx-auto">
          Please sign in to save and manage your favorite grocery picks and repeat essentials.
        </p>
        <Link
          to="/login?redirect=/wishlist"
          className="inline-block px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl text-xs sm:text-sm"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Explore seasonal fruits, dairy, and pantry goods and tap the heart icon to bookmark favorites."
          actionText="Discover Groceries"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
            <span>My Wishlist ({wishlist.length})</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 mt-1">
            Items you have saved for later
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((prod) => {
          if (!prod) return null;
          const imgUrl =
            prod.images && prod.images.length > 0
              ? prod.images[0].url
              : 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';

          return (
            <div
              key={prod._id}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 mb-3">
                  <Link to={`/products/${prod.slug || prod._id}`}>
                    <img
                      src={imgUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(prod._id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-slate-400 hover:text-rose-600 rounded-full shadow-xs transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-[11px] font-bold text-emerald-700">
                  {prod.brand || 'MegaBasket'}
                </span>
                <Link
                  to={`/products/${prod.slug || prod._id}`}
                  className="block text-sm font-semibold text-slate-900 hover:text-emerald-700 transition-colors line-clamp-2 mt-0.5"
                >
                  {prod.name}
                </Link>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-base font-bold text-slate-900">
                    ₹{prod.price}
                  </span>
                  {prod.originalPrice && prod.originalPrice > prod.price && (
                    <span className="text-xs text-slate-600 line-through">
                      ₹{prod.originalPrice}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => moveToCart(prod._id)}
                  disabled={prod.stock <= 0}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{prod.stock > 0 ? 'Move to Basket' : 'Out of Stock'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
