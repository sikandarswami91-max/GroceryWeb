import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategoryImage, DEFAULT_FALLBACK_CATEGORY_IMAGE } from '../utils/categoryImages.js';

export default function CategoryCard({ category }) {
  if (!category) return null;

  const initialImageUrl = getCategoryImage(category);
  const [imgSrc, setImgSrc] = useState(initialImageUrl);

  return (
    <Link
      to={`/products?category=${category.slug}`}
      id={`category-card-${category.slug}`}
      className="group flex flex-col bg-white hover:bg-emerald-50/20 rounded-2xl border border-slate-200/90 hover:border-emerald-400 transition-all duration-300 hover:shadow-md overflow-hidden"
    >
      {/* Category Image - clearly represents category, proper object-fit */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={imgSrc}
          alt={category.name}
          onError={() => setImgSrc(DEFAULT_FALLBACK_CATEGORY_IMAGE)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Category Name */}
      <div className="p-3 text-center bg-white border-t border-slate-100">
        <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1">
          {category.name}
        </h4>
        {category.productCount !== undefined && (
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {category.productCount} {category.productCount === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>
    </Link>
  );
}
