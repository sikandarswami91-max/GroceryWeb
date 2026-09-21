import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Zap,
  Clock,
  Banknote,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Apple,
  Carrot,
  Milk,
  Award,
  Sparkles,
  ShoppingBag,
  Truck,
  RotateCcw,
  Leaf,
} from 'lucide-react';
import { productService, categoryService } from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import CategoryCard from '../components/CategoryCard.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import { DEFAULT_15_CATEGORIES } from '../utils/categoryImages.js';

export default function HomePage() {
  const [categories, setCategories] = useState(DEFAULT_15_CATEGORIES);
  const [freshFruits, setFreshFruits] = useState([]);
  const [freshVegetables, setFreshVegetables] = useState([]);
  const [dairyBreakfast, setDairyBreakfast] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [dailyEssentials, setDailyEssentials] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryScrollRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadHomeData = async () => {
      try {
        setLoading(true);

        const [catRes, allProdsRes] = await Promise.allSettled([
          categoryService.getCategories(),
          productService.getProducts({ limit: 100 }),
        ]);

        if (!isMounted) return;

        // Process Categories
        if (catRes.status === 'fulfilled' && catRes.value?.data?.success) {
          const apiCats = catRes.value.data.categories || [];
          if (apiCats.length > 0) {
            // Merge with DEFAULT_15_CATEGORIES to ensure order and completeness
            const merged = DEFAULT_15_CATEGORIES.map((defCat) => {
              const matched = apiCats.find(
                (c) =>
                  c.slug === defCat.slug ||
                  c.name.toLowerCase().trim() === defCat.name.toLowerCase().trim()
              );
              return matched
                ? { ...defCat, ...matched, image: matched.image?.url ? matched.image : defCat.image }
                : defCat;
            });
            setCategories(merged);
          }
        }

        // Process Products
        let allProducts = [];
        if (allProdsRes.status === 'fulfilled' && allProdsRes.value?.data?.success) {
          allProducts = allProdsRes.value.data.products || [];
        }

        // 1. Fresh Fruits
        const fruits = allProducts.filter((p) => {
          const catSlug = p.category?.slug || '';
          const catName = p.category?.name?.toLowerCase() || '';
          return (
            catSlug.includes('fruit') ||
            catName.includes('fruit') ||
            p.name.toLowerCase().includes('apple') ||
            p.name.toLowerCase().includes('banana') ||
            p.name.toLowerCase().includes('orange') ||
            p.name.toLowerCase().includes('mango') ||
            p.name.toLowerCase().includes('grape')
          );
        });
        setFreshFruits(fruits.slice(0, 4));

        // 2. Fresh Vegetables
        const veggies = allProducts.filter((p) => {
          const catSlug = p.category?.slug || '';
          const catName = p.category?.name?.toLowerCase() || '';
          return (
            catSlug.includes('veg') ||
            catName.includes('veg') ||
            p.name.toLowerCase().includes('potato') ||
            p.name.toLowerCase().includes('tomato') ||
            p.name.toLowerCase().includes('onion') ||
            p.name.toLowerCase().includes('carrot') ||
            p.name.toLowerCase().includes('spinach')
          );
        });
        setFreshVegetables(veggies.slice(0, 4));

        // 3. Dairy & Breakfast
        const dairy = allProducts.filter((p) => {
          const catSlug = p.category?.slug || '';
          const catName = p.category?.name?.toLowerCase() || '';
          return (
            catSlug.includes('dairy') ||
            catName.includes('dairy') ||
            catSlug.includes('breakfast') ||
            p.name.toLowerCase().includes('milk') ||
            p.name.toLowerCase().includes('paneer') ||
            p.name.toLowerCase().includes('butter') ||
            p.name.toLowerCase().includes('cheese') ||
            p.name.toLowerCase().includes('curd') ||
            p.name.toLowerCase().includes('egg')
          );
        });
        setDairyBreakfast(dairy.slice(0, 4));

        // 4. Best Sellers (popular / high rated)
        const popular = [...allProducts]
          .sort((a, b) => (b.numReviews || 0) * (b.rating || 4) - (a.numReviews || 0) * (a.rating || 4))
          .slice(0, 4);
        setBestSellers(popular.length > 0 ? popular : allProducts.slice(0, 4));

        // 5. Daily Essentials (grains, oils, flours, staples)
        const staples = allProducts.filter((p) => {
          const catSlug = p.category?.slug || '';
          const catName = p.category?.name?.toLowerCase() || '';
          return (
            catSlug.includes('rice') ||
            catSlug.includes('grain') ||
            catSlug.includes('dal') ||
            catSlug.includes('pulse') ||
            catSlug.includes('oil') ||
            catSlug.includes('atta') ||
            catSlug.includes('flour') ||
            catName.includes('grain') ||
            catName.includes('pulse')
          );
        });
        setDailyEssentials(staples.slice(0, 4).length > 0 ? staples.slice(0, 4) : allProducts.slice(4, 8));
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const offset = direction === 'left' ? -360 : 360;
      categoryScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* ==================================================
          2. HERO SECTION REDESIGN
          - Bright, fresh, premium light background (no dark green)
          - White / warm off-white base with soft green accents
          - 50% left / 50% right desktop layout
          - Professional fresh fruit grocery image on right
          - Clear Cash on Delivery messaging
          - No fake discounts
         ================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50/50 via-white to-amber-50/30 border border-emerald-100/80 rounded-3xl mx-4 sm:mx-6 lg:mx-8 shadow-xs">
        {/* Subtle organic shapes in background */}
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-emerald-200/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-teal-200/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left 50% Column */}
            <div className="lg:col-span-6 space-y-5 text-center lg:text-left">
              {/* Small Delivery Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs">
                <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                <span>15–30 Min Express Delivery</span>
              </div>

              {/* Large Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]">
                <span className="text-emerald-700">Fresh Groceries,</span>
                <br />
                <span>Delivered to Your Door</span>
              </h1>

              {/* Supporting Text */}
              <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto lg:mx-0 leading-relaxed font-normal">
                Shop fresh fruits, vegetables, dairy, grains, snacks and everyday essentials at great prices.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/products"
                  id="hero-shop-all-groceries-btn"
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Shop All Groceries</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/categories"
                  id="hero-browse-categories-btn"
                  className="px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-sm border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors cursor-pointer"
                >
                  <span>Browse Categories</span>
                </Link>
              </div>

              {/* Small Benefits Row Below Buttons */}
              <div className="pt-6 border-t border-slate-200/70 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto lg:mx-0 text-left">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-xs sm:text-sm">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">15–30 Min</span>
                  </div>
                  <span className="text-[11px] sm:text-xs text-slate-600 font-medium block">
                    Express Delivery
                  </span>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-xs sm:text-sm">
                    <Banknote className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">COD Available</span>
                  </div>
                  <span className="text-[11px] sm:text-xs text-slate-600 font-medium block">
                    Pay on Arrival
                  </span>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-xs sm:text-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Fresh Quality</span>
                  </div>
                  <span className="text-[11px] sm:text-xs text-slate-600 font-medium block">
                    Everyday Essentials
                  </span>
                </div>
              </div>
            </div>

            {/* Right 50% Column - High Quality Fresh Produce Image */}
            <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg aspect-[4/3] sm:aspect-[16/11] rounded-3xl overflow-hidden shadow-lg border-2 border-white/80 bg-emerald-50">
                <img
                  src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1200&q=85"
                  alt="Fresh fruits basket with apples, oranges, bananas, and grapes"
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />

                {/* Floating Fresh Badge */}
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-white/95 text-slate-900 rounded-xl px-3 py-2 shadow-md backdrop-blur-xs flex items-center gap-2 text-xs font-bold border border-slate-100">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  <span>Farm Fresh Daily</span>
                </div>

                {/* Floating Cash on Delivery Badge */}
                <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-emerald-900/90 text-white rounded-xl px-3 py-2 shadow-md backdrop-blur-xs flex items-center gap-2 text-xs font-bold border border-emerald-600/40">
                  <Banknote className="w-4 h-4 text-emerald-300" />
                  <span>Cash on Delivery Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          7. CATEGORY DESIGN (Immediately after Hero)
          Title: "Shop by Category"
          Subtitle: "Everything you need for your everyday grocery shopping"
          Horizontal category carousel on desktop/mobile
         ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Curated Aisles
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Everything you need for your everyday grocery shopping
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Scroll navigation arrows */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollCategories('left')}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-colors shadow-2xs cursor-pointer active:scale-95"
                title="Scroll left"
                aria-label="Previous categories"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollCategories('right')}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-colors shadow-2xs cursor-pointer active:scale-95"
                title="Scroll right"
                aria-label="Next categories"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Link
              to="/categories"
              className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1 ml-2"
            >
              <span>View All (15)</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Horizontal Category Carousel with Touch Drag and Snap */}
        <div
          ref={categoryScrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {categories.map((cat) => (
            <div
              key={cat.slug || cat._id}
              className="w-[140px] sm:w-[160px] md:w-[175px] shrink-0 snap-start"
            >
              <CategoryCard category={cat} />
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================
          8. PRODUCT SECTIONS (In Exact Required Order):
          1. Fresh Fruits
          2. Fresh Vegetables
          3. Dairy & Breakfast
          4. Best Sellers
          5. Daily Essentials
         ================================================== */}

      {/* 1. Fresh Fruits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Apple className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Fresh Fruits
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Farm-fresh apples, sweet bananas, oranges, and seasonal berries
              </p>
            </div>
          </div>
          <Link
            to="/products?category=fresh-fruits"
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <SkeletonLoader type="product" count={4} />
        ) : freshFruits.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {freshFruits.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-600 py-4">Fresh fruit stock updating shortly.</p>
        )}
      </section>

      {/* 2. Fresh Vegetables */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Carrot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Fresh Vegetables
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Crisp green leafy vegetables, juicy vine tomatoes, and everyday staples
              </p>
            </div>
          </div>
          <Link
            to="/products?category=fresh-vegetables"
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <SkeletonLoader type="product" count={4} />
        ) : freshVegetables.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {freshVegetables.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-600 py-4">Fresh vegetable stock updating shortly.</p>
        )}
      </section>

      {/* 3. Dairy & Breakfast */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Milk className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Dairy & Breakfast
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Pure A2 milk, country curd, fresh paneer, butter, and morning essentials
              </p>
            </div>
          </div>
          <Link
            to="/products?category=dairy-breakfast"
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <SkeletonLoader type="product" count={4} />
        ) : dairyBreakfast.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {dairyBreakfast.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-600 py-4">Dairy essentials updating shortly.</p>
        )}
      </section>

      {/* 4. Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Best Sellers
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Most popular customer favorites backed by top ratings
              </p>
            </div>
          </div>
          <Link
            to="/products?sort=popular"
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <SkeletonLoader type="product" count={4} />
        ) : bestSellers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {bestSellers.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-600 py-4">Loading top selling products...</p>
        )}
      </section>

      {/* 5. Daily Essentials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Daily Essentials
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Aged basmati rice, unpolished dals, cold-pressed oils, and cooking staples
              </p>
            </div>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <SkeletonLoader type="product" count={4} />
        ) : dailyEssentials.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {dailyEssentials.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-600 py-4">Kitchen staples updating shortly.</p>
        )}
      </section>

      {/* ==================================================
          6. THE MEGABASKET PROMISE (Values Row)
         ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-10">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              The MegaBasket Promise
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Why Millions Choose MegaBasket
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              We source directly from trusted farmers and producers to guarantee wholesale prices and pure freshness.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">15–30 Min Delivery</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Superfast neighborhood dispatch to deliver your groceries at peak freshness.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                <Banknote className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Cash on Delivery</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Check and verify every item at your doorstep before paying. 100% Cash on Delivery.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Certified Fresh Quality</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Rigorous quality inspections guarantee clean produce, pure dairy, and genuine goods.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Easy Doorstep Returns</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Not fully satisfied with any item? Hand it back to the delivery executive instantly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
