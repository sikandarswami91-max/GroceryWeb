import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productService } from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { Search } from 'lucide-react';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const doSearch = async () => {
      try {
        setLoading(true);
        const res = await productService.getProducts({ search: query, limit: 20 });
        if (res.data.success) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.error('Error executing search:', err);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      doSearch();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Search className="w-5 h-5 text-emerald-600" />
          <span>Search Results for &ldquo;{query}&rdquo;</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-700 mt-1">
          Found {products.length} {products.length === 1 ? 'matching item' : 'matching items'}
        </p>
      </div>

      {loading ? (
        <SkeletonLoader type="product" count={4} />
      ) : products.length === 0 ? (
        <EmptyState
          title="No matching groceries found"
          description={`We couldn't find any results for "${query}". Try checking the spelling or searching for a broader term.`}
          actionText="Browse All Products"
          actionLink="/products"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
