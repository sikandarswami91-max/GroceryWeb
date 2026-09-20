import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Banknote,
  ShoppingBag,
  Package,
  Users,
  Clock,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { adminService } from '../services/api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await adminService.getDashboardStats();
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Store Performance Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time grocery orders, inventory tracking, and sales analytics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Sales */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Sales Volume
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              ₹{stats.totalSales.toLocaleString()}
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
              Delivered & Active COD
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Banknote className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Orders
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {stats.totalOrders}
            </h3>
            <span className="text-[11px] text-slate-500 mt-1 inline-block">
              Across all categories
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Orders
            </span>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">
              {stats.pendingOrders}
            </h3>
            <span className="text-[11px] text-amber-700 font-semibold mt-1 inline-block">
              Require Dispatch
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Inventory
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {stats.totalProducts}
            </h3>
            <span className="text-[11px] text-slate-500 mt-1 inline-block">
              {stats.totalCategories} Supermarket Categories
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Recent Orders</h3>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Manage All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                  <th className="py-2.5">Order</th>
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5">Amount</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-slate-50/80">
                      <td className="py-3 font-semibold text-slate-900">
                        #{ord.orderNumber}
                      </td>
                      <td className="py-3 text-slate-700">
                        {ord.shippingAddress?.fullName || ord.user?.name || 'Customer'}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={ord.orderStatus} />
                      </td>
                      <td className="py-3 font-bold text-slate-900">
                        ₹{ord.totalAmount}
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/admin/orders?id=${ord._id}`}
                          className="text-emerald-700 font-bold hover:underline"
                        >
                          View &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                      No customer orders recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts (1 col) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Low Stock Alerts</span>
            </h3>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Stock &le; 5
            </span>
          </div>

          <div className="space-y-3">
            {stats.lowStockProducts && stats.lowStockProducts.length > 0 ? (
              stats.lowStockProducts.map((p) => (
                <div
                  key={p._id}
                  className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 truncate">
                    <p className="font-semibold text-slate-900 truncate">{p.name}</p>
                    <p className="text-slate-500">SKU: {p.sku || 'N/A'}</p>
                  </div>
                  <span className="px-2 py-1 bg-amber-600 text-white font-bold rounded-lg shrink-0">
                    {p.stock} units
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                All products currently have sufficient stock levels!
              </p>
            )}
          </div>

          <Link
            to="/admin/products"
            className="block text-center text-xs font-bold text-emerald-700 hover:text-emerald-800 pt-2"
          >
            Manage Product Catalog &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
