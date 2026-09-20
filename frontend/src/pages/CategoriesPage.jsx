import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryService } from '../services/api.js';
import { ArrowRight, Layers } from 'lucide-react';
import { getCategoryImage, DEFAULT_15_CATEGORIES, DEFAULT_FALLBACK_CATEGORY_IMAGE } from '../utils/categoryImages.js';

export default function CategoriesPage() {
  const [categories, setCategories] = useState(DEFAULT_15_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await categoryService.getCategories();
        if (res.data.success && res.data.categories?.length > 0) {
          const apiCats = res.data.categories;
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
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Layers className="w-7 h-7 text-emerald-600" />
          <span>Shop by Category</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Explore our complete collection of 15 fresh grocery aisles, organic produce, dairy, and household essentials.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-100 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const imgUrl = getCategoryImage(cat);
            return (
              <Link
                key={cat.slug || cat._id}
                to={`/products?category=${cat.slug}`}
                className="group flex flex-col justify-between p-5 bg-white border border-slate-200/90 hover:border-emerald-400 rounded-2xl hover:shadow-md transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={imgUrl}
                      alt={cat.name}
                      onError={(e) => {
                        e.target.src = DEFAULT_FALLBACK_CATEGORY_IMAGE;
                      }}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {cat.description || 'Fresh daily groceries delivered to your door.'}
                    </p>
                    {cat.productCount !== undefined && (
                      <span className="text-[11px] text-emerald-700 font-semibold inline-block pt-1">
                        {cat.productCount} {cat.productCount === 1 ? 'item' : 'items'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
                  <span>Browse Aisle</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
