import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Plus,
  Minus,
  Heart,
  ShoppingBag,
  Truck,
  Banknote,
  ShieldCheck,
  ChevronRight,
  Trash2,
  Send,
  Leaf,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { productService, reviewService } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { success, error } = useToast();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review submission form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProductData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await productService.getByIdOrSlug(id);
      if (res.data.success) {
        const prod = res.data.product;
        setProduct(prod);

        // Fetch related products and reviews in parallel
        const [relatedRes, reviewRes] = await Promise.all([
          productService.getRelated(prod._id, 4),
          reviewService.getProductReviews(prod._id),
        ]);

        if (relatedRes.data.success) {
          setRelatedProducts(relatedRes.data.products);
        }
        if (reviewRes.data.success) {
          setReviews(reviewRes.data.reviews);
        }
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProductData();
    window.scrollTo(0, 0);
  }, [fetchProductData]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <SkeletonLoader type="product" count={1} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-sm text-slate-700 mb-6">
          The grocery item you are looking for may have been retired or moved.
        </p>
        <Link
          to="/products"
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const currentCartQty = getItemQuantity(product._id);
  const inWishlist = isInWishlist(product._id);
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [
          {
            url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
          },
        ];

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    addToCart(product, quantity);
  };

  const handleBuyNow = async () => {
    if (product.stock <= 0) return;
    const added = await addToCart(product, quantity);
    if (added) {
      navigate('/checkout');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      error('Please sign in to write a product review');
      return;
    }
    if (!newComment.trim()) {
      error('Please provide your review feedback');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await reviewService.addReview({
        productId: product._id,
        rating: newRating,
        comment: newComment,
      });

      if (res.data.success) {
        success('Thank you! Your review has been published.');
        setNewComment('');
        // Refresh product and reviews
        fetchProductData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const res = await reviewService.deleteReview(reviewId);
      if (res.data.success) {
        success('Review removed');
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
        fetchProductData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error deleting review');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-700">
        <Link to="/" className="hover:text-emerald-700 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-emerald-700 transition-colors">
          Products
        </Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              to={`/products?category=${product.category.slug}`}
              className="hover:text-emerald-700 transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold truncate max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* Main Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Gallery / Images (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200">
            <img
              src={images[selectedImage]?.url}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {discount && (
              <span className="absolute top-3 left-3 px-2.5 py-1 bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-sm">
                {discount}% OFF
              </span>
            )}
            <button
              type="button"
              onClick={() =>
                inWishlist
                  ? removeFromWishlist(product._id)
                  : addToWishlist(product)
              }
              className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                inWishlist
                  ? 'bg-rose-50 text-rose-500 shadow-md'
                  : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white shadow-xs'
              }`}
            >
              <Heart
                className={`w-5 h-5 ${inWishlist ? 'fill-rose-500' : ''}`}
              />
            </button>
          </div>

          {/* Thumbnail list */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === idx
                      ? 'border-emerald-600 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs">
                {product.brand || 'MegaBasket Direct'}
              </span>
              <span className="text-xs text-slate-600">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Ratings Bar */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-800 rounded-lg text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating > 0 ? product.rating.toFixed(1) : 'New'}</span>
              </div>
              <span className="text-xs text-slate-600">
                {product.numReviews} Verified Customer {product.numReviews === 1 ? 'Review' : 'Reviews'}
              </span>
            </div>
          </div>

          {/* Price & Savings */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-slate-900">
                  ₹{product.price}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-slate-600 line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
                {discount && (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                    {discount}% OFF (Save ₹{product.originalPrice - product.price})
                  </span>
                )}
              </div>

              {/* Unit / Weight Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 shadow-2xs">
                <span className="text-slate-600 text-[11px] font-medium">Pack:</span>
                <span>{product.unit || '1 kg'}</span>
              </div>
            </div>

            <p className="text-xs text-slate-700">
              Standard MRP inclusive of all taxes • Guaranteed harvest freshness
            </p>
          </div>

          {/* Stock Indicator */}
          <div className="flex items-center gap-2">
            {product.stock > 10 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                In Stock ready for immediate dispatch
              </span>
            ) : product.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold">
                ⚡ Only {product.stock} left in stock - order soon!
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-semibold">
                Currently Out of Stock
              </span>
            )}
          </div>

          {/* Quantity and Action Buttons */}
          {product.stock > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                {/* Quantity selector */}
                <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-bold text-slate-900 min-w-[36px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 disabled:opacity-30 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Basket */}
                <button
                  type="button"
                  id="details-add-to-cart-btn"
                  onClick={handleAddToCart}
                  className="flex-1 min-w-[170px] flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Add to Basket</span>
                </button>

                {/* Buy Now (COD Checkout) */}
                <button
                  type="button"
                  id="details-buy-now-btn"
                  onClick={handleBuyNow}
                  className="flex-1 min-w-[170px] flex items-center justify-center gap-2 px-5 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  <Zap className="w-5 h-5 fill-white" />
                  <span>Buy Now (COD)</span>
                </button>
              </div>
            </div>
          )}

          {/* Delivery & Payment Guarantee Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Express Delivery in 15-30 Mins</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50">
              <Banknote className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Cash on Delivery Accepted</span>
            </div>
          </div>

          {/* Description */}
          <div className="pt-4 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Product Description</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Specifications Table */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="pt-2 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Key Specifications</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                {product.specifications.map((spec, index) => (
                  <div
                    key={index}
                    className={`flex items-center py-2.5 px-4 ${
                      index % 2 === 0 ? 'bg-slate-50' : 'bg-white'
                    }`}
                  >
                    <span className="w-1/3 font-semibold text-slate-700">
                      {spec.title}
                    </span>
                    <span className="w-2/3 text-slate-600">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="pt-12 border-t border-slate-200 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Customer Reviews ({reviews.length})
            </h2>
            <p className="text-xs sm:text-sm text-slate-700">
              Read authentic feedback from certified MegaBasket shoppers
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${
                    s <= Math.round(product.rating || 0)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="font-bold text-slate-900 text-lg">
              {product.rating > 0 ? product.rating.toFixed(1) : '5.0'}
            </span>
            <span className="text-xs text-slate-600">out of 5</span>
          </div>
        </div>

        {/* Add Review Form */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Write a Customer Review
          </h3>

          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Rating (Select Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-amber-600">
                    {newRating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Your Review
                </label>
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share details of your experience with freshness, packaging, and quality..."
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between gap-4 text-xs text-slate-600">
              <p>Please sign in to your account to review this grocery item.</p>
              <Link
                to="/login"
                className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg shrink-0"
              >
                Sign In to Review
              </Link>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-xs sm:text-sm text-slate-600 italic">
              No customer reviews yet. Be the first to share your thoughts on this product!
            </p>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev._id}
                className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                      {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {rev.userName}
                      </h4>
                      <span className="text-[10px] text-slate-600">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Delete button if owner or admin */}
                    {user &&
                      (user._id === (rev.user?._id || rev.user) || isAdmin) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(rev._id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
                  {rev.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <section className="pt-10 border-t border-slate-200 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">
            Frequently Bought Together
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
