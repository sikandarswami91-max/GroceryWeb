import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus, Minus, Heart, MoreVertical } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';

export default function ProductCard({ product }) {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  if (!product) return null;

  const currentQty = getItemQuantity(product._id);
  const inWishlist = isInWishlist(product._id);

  // Local card stepper state for picking quantity before clicking Add to Cart
  const [selectedQty, setSelectedQty] = React.useState(currentQty > 0 ? currentQty : 1);

  React.useEffect(() => {
    if (currentQty > 0) {
      setSelectedQty(currentQty);
    }
  }, [currentQty]);

  const FALLBACK_PRODUCT_IMAGE =
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';

  const [imgSrc, setImgSrc] = React.useState(
    product.images && product.images.length > 0 && product.images[0].url
      ? product.images[0].url
      : FALLBACK_PRODUCT_IMAGE
  );

  React.useEffect(() => {
    if (product.images && product.images.length > 0 && product.images[0].url) {
      setImgSrc(product.images[0].url);
    } else {
      setImgSrc(FALLBACK_PRODUCT_IMAGE);
    }
  }, [product.images]);

  const isOutOfStock = product.stock <= 0;

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      if (currentQty > 0) {
        updateQuantity(product._id, selectedQty);
      } else {
        addToCart(product, selectedQty);
      }
    }
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const max = product.stock || 99;
    if (selectedQty < max) {
      const next = selectedQty + 1;
      setSelectedQty(next);
      if (currentQty > 0) {
        updateQuantity(product._id, next);
      }
    }
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedQty > 1) {
      const next = selectedQty - 1;
      setSelectedQty(next);
      if (currentQty > 0) {
        updateQuantity(product._id, next);
      }
    } else if (currentQty > 0) {
      updateQuantity(product._id, 0);
      setSelectedQty(1);
    }
  };

  return (
    <div
      id={`product-card-${product._id}`}
      className="group relative bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between hover:shadow-md hover:border-emerald-300 transition-all duration-200"
    >
      <div>
        {/* Product Image Area with Heart / 3-dots top right */}
        <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-transparent mb-2.5 flex items-center justify-center">
          <Link to={`/products/${product.slug || product._id}`} className="w-full h-full flex items-center justify-center">
            <img
              src={imgSrc}
              alt={product.name}
              onError={() => setImgSrc(FALLBACK_PRODUCT_IMAGE)}
              className="max-h-full max-w-full object-contain p-1 group-hover:scale-105 transition-transform duration-300 ease-out"
              loading="lazy"
            />
          </Link>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center">
              <span className="px-2.5 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded shadow-xs uppercase tracking-wider">
                Out of Stock
              </span>
            </div>
          )}

          {/* Wishlist Heart button at top-right */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            className="absolute top-1 right-1 p-1 text-slate-400 hover:text-rose-500 rounded-full transition-colors cursor-pointer"
            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                inWishlist ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
              }`}
            />
          </button>
        </div>

        {/* Product Title (short, clean, exactly as in reference: Apple Red, Banana, Orange, Tomato, Onion...) */}
        <Link
          to={`/products/${product.slug || product._id}`}
          className="block text-xs sm:text-[13px] font-bold text-slate-900 hover:text-emerald-700 transition-colors line-clamp-1 leading-snug mb-0.5"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Unit / Weight Subtitle */}
        <div className="text-[11px] text-slate-500 mb-1 font-normal">
          {product.unit || '1 kg'}
        </div>

        {/* Rating and Reviews count */}
        <div className="flex items-center gap-1 mb-2 text-[11px] text-slate-600">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
          <span className="font-bold text-slate-800">
            {product.rating > 0 ? product.rating.toFixed(1) : '4.5'}
          </span>
          <span className="text-slate-400">
            ({product.numReviews || product.reviewCount || 95})
          </span>
        </div>

        {/* Price row */}
        <div className="flex items-baseline gap-1.5 mb-2.5">
          <span className="text-sm sm:text-base font-extrabold text-slate-900">
            ₹{product.price}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[11px] text-slate-400 line-through">
              ₹{product.originalPrice}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Controls: [- qty +] stepper on left, [Add to Cart] button on right */}
      <div className="flex items-center gap-2 pt-1">
        {/* Stepper box */}
        <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden text-xs h-7 px-0.5">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={isOutOfStock || (selectedQty <= 1 && currentQty === 0)}
            className="w-5 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
            title="Decrease"
          >
            <Minus className="w-2.5 h-2.5" />
          </button>
          <span className="w-5 text-center text-xs font-semibold text-slate-800 select-none">
            {currentQty > 0 ? currentQty : selectedQty}
          </span>
          <button
            type="button"
            onClick={handleIncrement}
            disabled={isOutOfStock || selectedQty >= (product.stock || 99)}
            className="w-5 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
            title="Increase"
          >
            <Plus className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Add to Cart button */}
        {isOutOfStock ? (
          <button
            type="button"
            disabled
            className="flex-1 h-7 bg-slate-100 text-slate-400 rounded-lg text-[11px] font-semibold cursor-not-allowed text-center"
          >
            Sold Out
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex-1 h-7 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center ${
              currentQty > 0
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {currentQty > 0 ? 'Added' : 'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
}
