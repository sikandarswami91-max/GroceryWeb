import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
} from 'lucide-react';
import { productService } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import { AdminPageHeader, AdminErrorState, AdminEmptyState } from './adminUi.jsx';

const stockTone = (stock) => {
  if (stock <= 5) return 'bg-rose-50 text-rose-700 border border-rose-200';
  if (stock <= 20) return 'bg-amber-50 text-amber-700 border border-amber-200';
  return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
};

export default function AdminProductsPage() {
  const { success, error } = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setErrorState(false);
      const res = await productService.getProducts({
        page: currentPage,
        limit: 10,
        search: search.trim() || undefined,
      });
      if (res.data.success) {
        setProducts(res.data.products);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
      setErrorState(true);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await productService.deleteProduct(id);
      if (res.data.success) {
        success('Product deleted successfully');
        fetchProducts();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error deleting product');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Package}
        iconBg="bg-emerald-50 text-emerald-600"
        title="Product Inventory"
        count={`${totalCount} items`}
        subtitle="Create, update stock, modify prices, and manage Cloudinary images"
      >
        <Link
          to="/admin/products/new"
          id="admin-add-product-btn"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:-translate-y-px"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </AdminPageHeader>


      {/* Search Filter */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search products by title, SKU, brand..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-300 transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonLoader type="table" count={5} />
          </div>
        ) : errorState ? (
          <AdminErrorState
            title="Could not load products"
            message="There was a problem fetching the product catalog."
            onRetry={fetchProducts}
          />
        ) : products.length === 0 ? (
          <AdminEmptyState
            icon={PackageSearch}
            title={search ? 'No matching products' : 'No products yet'}
            message={
              search
                ? 'Try a different search term, or clear it to browse the full catalog.'
                : 'Start building your catalog by adding your first grocery product.'
            }
          >
            {!search && (
              <Link
                to="/admin/products/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </Link>
            )}
          </AdminEmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-6">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const img =
                    p.images && p.images.length > 0
                      ? p.images[0].url
                      : 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=100&q=80';

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <img
                              src={img}
                              alt={p.name}
                              className="w-11 h-11 rounded-xl object-cover bg-slate-100 border border-slate-200"
                            />
                          </div>
                          <div className="max-w-[220px]">
                            <p className="font-bold text-slate-900 truncate">{p.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium truncate">
                              SKU: {p.sku || 'N/A'} • {p.brand || 'MegaBasket'} • {p.unit || '1 kg'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold border border-blue-100">
                          {p.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">₹{p.price}</div>
                        {p.originalPrice && (
                          <div className="text-[10px] text-slate-400 line-through font-medium">
                            ₹{p.originalPrice}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold ${stockTone(p.stock)}`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            p.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${p.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}
                          ></span>
                          {p.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/products/${p.slug || p._id}`}
                            target="_blank"
                            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                            title="View on Storefront"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/products/${p._id}/edit`}
                            className="p-2 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(p._id, p.name)}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
