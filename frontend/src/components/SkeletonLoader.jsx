import React from 'react';

export default function SkeletonLoader({ type = 'product', count = 4 }) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === 'product') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {items.map((i) => (
          <div
            key={i}
            className="bg-white border border-slate-200/70 rounded-2xl p-4 animate-pulse space-y-3"
          >
            <div className="aspect-square bg-slate-200 rounded-xl w-full"></div>
            <div className="h-3 bg-slate-200 rounded-md w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded-md w-4/5"></div>
            <div className="h-3 bg-slate-200 rounded-md w-1/2"></div>
            <div className="pt-2 flex items-center justify-between">
              <div className="h-5 bg-slate-200 rounded-md w-1/4"></div>
              <div className="h-8 bg-slate-200 rounded-xl w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
        {items.map((i) => (
          <div key={i} className="h-10 bg-slate-100 rounded flex gap-4 items-center px-4">
            <div className="h-4 bg-slate-200 rounded w-12"></div>
            <div className="h-4 bg-slate-200 rounded flex-1"></div>
            <div className="h-4 bg-slate-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full h-40 bg-slate-100 rounded-2xl animate-pulse"></div>
  );
}
