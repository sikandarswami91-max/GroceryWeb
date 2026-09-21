import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    cartItems,
    subtotal,
    shippingFee,
    grandTotal,
    totalItems,
    freeShippingThreshold,
    amountNeededForFreeShipping,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  if (!isAuthenticated && cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Your Basket is Empty</h2>
        <p className="text-sm text-slate-600 max-w-sm mx-auto">
          Explore fresh farm vegetables, seasonal fruits, dairy, and kitchen staples to fill your basket.
        </p>
        <Link
          to="/products"
          className="inline-block px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-xs"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          icon={ShoppingBag}
          title="Your grocery basket is empty"
          description="Explore fresh farm vegetables, seasonal fruits, dairy, and kitchen staples to fill your basket."
          actionText="Start Shopping"
          actionLink="/products"
        />
      </div>
    );
  }

  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-emerald-600" />
            <span>Shopping Basket ({totalItems})</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Review your items and proceed with Cash on Delivery
          </p>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Basket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free shipping progress bar */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-emerald-900">
              <span className="flex items-center gap-1.5 min-w-0">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                {amountNeededForFreeShipping > 0 ? (
                  <span>
                    Add <strong className="text-emerald-700 font-bold">₹{amountNeededForFreeShipping}</strong> more for FREE Express Delivery
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    You unlocked FREE Express Delivery!
                  </span>
                )}
              </span>
              <span className="shrink-0">₹{subtotal} / ₹{freeShippingThreshold}</span>
            </div>
            <div className="w-full h-2 bg-emerald-200/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100">
            {cartItems.map((item) => {
              const prod = item.product || {};
              const imgUrl =
                prod.images && prod.images.length > 0
                  ? prod.images[0].url
                  : 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';

              return (
                <div
                  key={prod._id || item._id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={imgUrl}
                      alt={item.name}
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                    />
                    <div className="space-y-1 min-w-0">
                      <Link
                        to={`/products/${prod.slug || prod._id}`}
                        className="text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <span>₹{item.price}</span>
                        {(prod.unit || item.unit) && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                              {prod.unit || item.unit}
                            </span>
                          </>
                        )}
                      </p>
                      {prod.stock > 0 && prod.stock <= 5 && (
                        <p className="text-[11px] text-amber-600 font-medium">
                          Only {prod.stock} left in stock!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper & Subtotal */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(prod._id || item.product, item.quantity - 1)
                        }
                        className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-colors"
                        title="Decrease"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-slate-900 min-w-[28px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(prod._id || item.product, item.quantity + 1)
                        }
                        disabled={prod.stock && item.quantity >= prod.stock}
                        className="p-1.5 hover:bg-white rounded-lg text-slate-600 disabled:opacity-40 transition-colors"
                        title="Increase"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <span className="text-sm font-bold text-slate-900 block">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(prod._id || item.product)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/products"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              &larr; Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Box (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span>Items Total ({totalItems} items)</span>
              <span className="font-semibold text-slate-900">₹{subtotal}</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Delivery Fee</span>
              {shippingFee === 0 ? (
                <span className="text-emerald-700 font-bold uppercase">
                  Free Delivery
                </span>
              ) : (
                <span className="font-semibold text-slate-900">₹{shippingFee}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span>Packaging & Handling</span>
              <span className="text-emerald-700 font-semibold">FREE</span>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-base font-bold text-slate-900">
              <span>Total Payable</span>
              <span className="text-emerald-800 text-lg">₹{grandTotal}</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Payment mode: <strong>Cash on Delivery</strong> only
            </p>
          </div>

          <button
            type="button"
            id="proceed-checkout-btn"
            onClick={() => navigate('/checkout')}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Safe & Contactless Delivery Guaranteed</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Dispatched within 10 minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
