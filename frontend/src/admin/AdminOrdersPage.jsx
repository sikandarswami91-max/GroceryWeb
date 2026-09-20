import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Eye,
  X,
  MapPin,
  Phone,
  Mail,
  ShoppingBasket,
  CircleCheck,
} from 'lucide-react';
import { adminService, orderService } from '../services/api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import { useToast } from '../context/ToastContext.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import { AdminPageHeader, AdminErrorState, AdminEmptyState, avatarColor } from './adminUi.jsx';

const ORDER_STATUSES = [
  'All',
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const STATUS_FILTER_STYLES = {
  All: 'bg-slate-900 text-white shadow-sm',
  Pending: 'bg-amber-500 text-white shadow-sm shadow-amber-500/30',
  Confirmed: 'bg-blue-600 text-white shadow-sm shadow-blue-600/30',
  Processing: 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30',
  Shipped: 'bg-violet-600 text-white shadow-sm shadow-violet-600/30',
  'Out for Delivery': 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30',
  Delivered: 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30',
  Cancelled: 'bg-rose-600 text-white shadow-sm shadow-rose-600/30',
};

export default function AdminOrdersPage() {
  const [searchParams] = useSearchParams();
  const directOrderId = searchParams.get('id');

  const { success, error } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Status update form states
  const [newOrderStatus, setNewOrderStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setErrorState(false);
      const res = await adminService.getAllOrders({
        status: statusFilter === 'All' ? undefined : statusFilter,
        search: search.trim() || undefined,
      });
      if (res.data.success) {
        setOrders(res.data.orders);
        if (directOrderId) {
          const matched = res.data.orders.find((o) => o._id === directOrderId);
          if (matched) {
            openOrderModal(matched);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      setErrorState(true);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, directOrderId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setNewOrderStatus(order.orderStatus);
    setNewPaymentStatus(order.paymentStatus);
  };

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder) return;
    try {
      setUpdatingStatus(true);
      const res = await adminService.updateOrderStatus(selectedOrder._id, newOrderStatus);
      if (res.data.success) {
        success(`Order status updated to ${newOrderStatus}`);
        setSelectedOrder(res.data.order);
        fetchOrders();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdatePaymentStatus = async () => {
    if (!selectedOrder) return;
    try {
      setUpdatingStatus(true);
      const res = await adminService.updatePaymentStatus(
        selectedOrder._id,
        newPaymentStatus
      );
      if (res.data.success) {
        success(`Payment status marked as ${newPaymentStatus}`);
        setSelectedOrder(res.data.order);
        fetchOrders();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update payment status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={ShoppingBag}
        iconBg="bg-blue-50 text-blue-600"
        title="Customer Orders"
        count={`${orders.length} orders`}
        subtitle="Track packing workflow, dispatch status, and doorstep cash collections"
      />

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order # or Customer Name..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Quick status tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1">
            {ORDER_STATUSES.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all duration-200 cursor-pointer active:scale-95 ${
                  statusFilter === st
                    ? STATUS_FILTER_STYLES[st] || 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonLoader type="table" count={5} />
          </div>
        ) : errorState ? (
          <AdminErrorState
            title="Could not load orders"
            message="There was a problem fetching customer orders."
            onRetry={fetchOrders}
          />
        ) : orders.length === 0 ? (
          <AdminEmptyState
            icon={ShoppingBasket}
            title="No orders found"
            message={
              search || statusFilter !== 'All'
                ? 'No orders match the current filters. Try a different status or search term.'
                : 'Customer orders will appear here as soon as the first order is placed.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[860px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-6">Order</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-900 whitespace-nowrap">
                      #{o.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">
                        {o.shippingAddress?.fullName || o.user?.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {o.shippingAddress?.city}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {o.items.length} item{o.items.length === 1 ? '' : 's'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      ₹{o.totalAmount}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={o.orderStatus} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={o.paymentStatus} type="payment" />
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => openOrderModal(o)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border border-blue-100"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Management Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px] admin-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto admin-pop">
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-3xl">
              <div className="text-white">
                <h3 className="text-lg font-bold">Manage Order #{selectedOrder.orderNumber}</h3>
                <p className="text-[11px] text-blue-100 mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
            {/* Status summary strip */}
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={selectedOrder.orderStatus} />
              <StatusBadge status={selectedOrder.paymentStatus} type="payment" />
              <span className="ml-auto text-sm font-extrabold text-slate-900">
                Total: <span className="text-emerald-700">₹{selectedOrder.totalAmount}</span>
              </span>
            </div>

            {/* Quick Status Modifiers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {/* Change Order Status */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Update Fulfillment Stage
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={newOrderStatus}
                    onChange={(e) => setNewOrderStatus(e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {[
                      'Pending',
                      'Confirmed',
                      'Processing',
                      'Shipped',
                      'Out for Delivery',
                      'Delivered',
                      'Cancelled',
                    ].map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={updatingStatus || newOrderStatus === selectedOrder.orderStatus}
                    onClick={handleUpdateOrderStatus}
                    className="px-3.5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                  >
                    Update
                  </button>
                </div>
              </div>

              {/* Change Payment Status */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Doorstep COD Payment
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="pending">Pending Collection</option>
                    <option value="paid">Cash Received (Paid)</option>
                    <option value="failed">Collection Failed</option>
                  </select>
                  <button
                    type="button"
                    disabled={updatingStatus || newPaymentStatus === selectedOrder.paymentStatus}
                    onClick={handleUpdatePaymentStatus}
                    className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                  >
                    Mark
                  </button>
                </div>
              </div>
            </div>

            {/* Customer Details & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 space-y-1.5 bg-slate-50/50">
                <span className="font-bold text-slate-500 block uppercase text-[10px] tracking-wider">
                  Customer Contact
                </span>
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  {selectedOrder.shippingAddress?.fullName}
                </p>
                <p className="text-slate-600 flex items-center gap-1.5 text-xs">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {selectedOrder.shippingAddress?.phone}
                </p>
                <p className="text-slate-600 flex items-center gap-1.5 text-xs">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {selectedOrder.user?.email || 'N/A'}
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 space-y-1 bg-slate-50/50">
                <span className="font-bold text-slate-500 block uppercase text-[10px] tracking-wider">
                  Delivery Address
                </span>
                <p className="text-slate-700 leading-relaxed text-xs flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {selectedOrder.shippingAddress?.street},{' '}
                    {selectedOrder.shippingAddress?.city},{' '}
                    {selectedOrder.shippingAddress?.state} -{' '}
                    {selectedOrder.shippingAddress?.postalCode}
                  </span>
                </p>
                {selectedOrder.deliveryNotes && (
                  <p className="text-emerald-700 font-medium text-xs">
                    Note: &ldquo;{selectedOrder.deliveryNotes}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Packed Items ({selectedOrder.items.length})
              </h4>
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto border border-slate-100 rounded-2xl px-4">
                {selectedOrder.items.map((it, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={
                          it.image ||
                          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=80&q=80'
                        }
                        alt={it.name}
                        className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{it.name}</p>
                        <p className="text-slate-500 text-[11px]">
                          ₹{it.price} × {it.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      ₹{it.price * it.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <CircleCheck className="w-4 h-4 text-emerald-500" />
                Done
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
