import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Banknote,
  ShoppingBag,
  Package,
  Users,
  Clock,
  AlertTriangle,
  FolderTree,
  Boxes,
  CircleCheckBig,
  ArrowRight,
} from 'lucide-react';
import { adminService } from '../services/api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import { StatCard, AdminErrorState } from './adminUi.jsx';

const STATUS_META = [
  { key: 'Pending', color: 'bg-amber-500' },
  { key: 'Confirmed', color: 'bg-blue-500' },
  { key: 'Processing', color: 'bg-indigo-500' },
  { key: 'Shipped', color: 'bg-violet-500' },
  { key: 'Out for Delivery', color: 'bg-cyan-500' },
  { key: 'Delivered', color: 'bg-emerald-500' },
  { key: 'Cancelled', color: 'bg-rose-500' },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await adminService.getDashboardStats();
      if (res.data.success) {
        setStats(res.data.stats);
        // Cache low-stock flag so the layout bell can show a dot (no extra API call)
        const hasLowStock = (res.data.stats.lowStockProducts || []).length > 0;
        try {
          sessionStorage.setItem('mb_admin_alerts', hasLowStock ? 'true' : 'false');
        } catch {
          /* storage unavailable - ignore */
        }
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-gradient-to-r from-slate-200 to-slate-100 rounded-3xl animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 bg-white border border-slate-200/60 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 h-64 bg-white border border-slate-200/60 rounded-2xl animate-pulse"></div>
          <div className="h-64 bg-white border border-slate-200/60 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <AdminErrorState
        title="Could not load dashboard"
        message="We had trouble fetching your store statistics. Check your connection and try again."
        onRetry={fetchStats}
      />
    );
  }

  const statusCounts = stats.statusCounts || {};
  const totalStatusCount = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const lowStockCount = stats.lowStockProducts?.length || 0;
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });


  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-600/20 admin-fade-up">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-14 right-24 w-40 h-40 bg-teal-300/20 rounded-full blur-2xl"></div>
        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-emerald-100/90 text-xs font-bold uppercase tracking-widest">{today}</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5">
              Store Performance Dashboard
            </h1>
            <p className="text-emerald-50/90 text-xs sm:text-sm mt-1.5 max-w-lg">
              Live snapshot of grocery sales, order fulfilment and inventory health across MegaBasket.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/admin/products/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-colors shadow-sm"
            >
              <Package className="w-4 h-4" />
              Add Product
            </Link>
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700/40 hover:bg-emerald-700/60 border border-white/20 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Manage Orders
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Banknote} label="Total Sales" value={`₹${stats.totalSales.toLocaleString()}`} hint="Excluding cancelled orders" accent="emerald" delay={0} />
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats.totalOrders} hint="Across all channels" accent="blue" delay={40} />
        <StatCard icon={Users} label="Customers" value={stats.totalUsers} hint="Registered shoppers" accent="violet" delay={80} />
        <StatCard icon={Clock} label="Pending Orders" value={stats.pendingOrders} hint="Awaiting dispatch" accent="amber" delay={120} />
        <StatCard icon={Package} label="Products" value={stats.totalProducts} hint="In catalog" accent="teal" delay={160} />
        <StatCard icon={FolderTree} label="Categories" value={stats.totalCategories} hint="Store departments" accent="sky" delay={200} />
        <StatCard icon={AlertTriangle} label="Low Stock Alerts" value={lowStockCount} hint="Products at ≤ 5 units" accent="rose" delay={240} />
        <StatCard
          icon={CircleCheckBig}
          label="Fulfilment Rate"
          value={`${totalStatusCount > 0 ? Math.round(((statusCounts['Delivered'] || 0) / totalStatusCount) * 100) : 0}%`}
          hint="Orders delivered"
          accent="emerald"
          delay={280}
        />
      </div>


      {/* Analytics + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Order Status Distribution — real data from statusCounts */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm admin-fade-up">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Order Status Distribution</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Live fulfilment pipeline across {stats.totalOrders} orders
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              {stats.totalOrders} total
            </span>
          </div>

          <div className="mt-5 space-y-3.5">
            {totalStatusCount === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400 italic">
                No orders recorded yet. Status analytics will appear once customers start ordering.
              </div>
            ) : (
              STATUS_META.map((s, i) => {
                const count = statusCounts[s.key] || 0;
                const pct = Math.round((count / totalStatusCount) * 100);
                return (
                  <div key={s.key}>
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                      <span className="text-slate-600 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${s.color}`}></span>
                        {s.key}
                      </span>
                      <span className="text-slate-900">
                        {count} <span className="text-slate-400 font-semibold">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.color} admin-grow-bar`}
                        style={{ width: `${pct}%`, animationDelay: `${i * 60}ms` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm admin-fade-up flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Low Stock Alerts</span>
            </h3>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Stock ≤ 5
            </span>
          </div>

          <div className="flex-1 mt-4 space-y-3">
            {stats.lowStockProducts && stats.lowStockProducts.length > 0 ? (
              stats.lowStockProducts.map((p) => (
                <div
                  key={p._id}
                  className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">SKU: {p.sku || 'N/A'}</p>
                  </div>
                  <span className="px-2 py-1 bg-amber-500 text-white text-[11px] font-bold rounded-lg shrink-0">
                    {p.stock} left
                  </span>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                <Boxes className="w-10 h-10 text-emerald-200 mb-2" />
                <p className="text-xs text-slate-500 font-medium">
                  All products have healthy stock levels!
                </p>
              </div>
            )}
          </div>

          <Link
            to="/admin/products"
            className="mt-4 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 pt-3 border-t border-slate-100"
          >
            Manage Product Catalog
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden admin-fade-up">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Orders</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Latest customer activity</p>
          </div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold transition-colors"
          >
            View All Orders
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[640px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-6">Order</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-900 whitespace-nowrap">
                      #{ord.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {ord.shippingAddress?.fullName || ord.user?.name || 'Customer'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      ₹{ord.totalAmount}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={ord.orderStatus} />
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Link
                        to={`/admin/orders?id=${ord._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold transition-colors"
                      >
                        View
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-14 text-center">
            <ShoppingBag className="w-10 h-10 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400 italic">No customer orders recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
