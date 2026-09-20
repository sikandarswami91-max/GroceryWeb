import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Truck,
  XCircle,
  Clock,
  MapPin,
  Calendar,
} from 'lucide-react';
import { adminService, orderService } from '../services/api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import { useToast } from '../context/ToastContext.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';

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

export default function AdminOrdersPage() {
  const [searchParams] = useSearchParams();
  const directOrderId = searchParams.get('id');

  const { success, error } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-emerald-600" />
          <span>Customer Orders ({orders.length})</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-700 mt-1">
          Track packing workflow, dispatch status, and doorstep cash collections
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order # or Customer Name..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Quick status tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {ORDER_STATUSES.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-emerald-600 text-white shadow-xs'
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
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonLoader type="table" count={5} />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-700 text-sm italic">
            No orders found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      #{o.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">
                        {o.shippingAddress?.fullName || o.user?.name}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        {o.shippingAddress?.city}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {o.items.length} item(s)
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{o.totalAmount}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={o.orderStatus} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={o.paymentStatus} type="payment" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openOrderModal(o)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Manage &rarr;
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Manage Order #{selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-700">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Quick Status Modifiers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {/* Change Order Status */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Update Fulfillment Stage
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={newOrderStatus}
                    onChange={(e) => setNewOrderStatus(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
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
                    disabled={
                      updatingStatus || newOrderStatus === selectedOrder.orderStatus
                    }
                    onClick={handleUpdateOrderStatus}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Update
                  </button>
                </div>
              </div>

              {/* Change Payment Status */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Doorstep COD Payment
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  >
                    <option value="pending">Pending Collection</option>
                    <option value="paid">Cash Received (Paid)</option>
                    <option value="failed">Collection Failed</option>
                  </select>
                  <button
                    type="button"
                    disabled={
                      updatingStatus || newPaymentStatus === selectedOrder.paymentStatus
                    }
                    onClick={handleUpdatePaymentStatus}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Mark
                  </button>
                </div>
              </div>
            </div>

            {/* Customer Details & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block uppercase text-[10px]">
                  Customer Contact
                </span>
                <p className="font-bold text-slate-900">
                  {selectedOrder.shippingAddress?.fullName}
                </p>
                <p className="text-slate-600">
                  Phone: {selectedOrder.shippingAddress?.phone}
                </p>
                <p className="text-slate-600">
                  Email: {selectedOrder.user?.email || 'N/A'}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block uppercase text-[10px]">
                  Delivery Address
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {selectedOrder.shippingAddress?.street},{' '}
                  {selectedOrder.shippingAddress?.city},{' '}
                  {selectedOrder.shippingAddress?.state} -{' '}
                  {selectedOrder.shippingAddress?.postalCode}
                </p>
                {selectedOrder.deliveryNotes && (
                  <p className="text-emerald-700 font-medium">
                    Note: &ldquo;{selectedOrder.deliveryNotes}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase">
                Packed Items ({selectedOrder.items.length})
              </h4>
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {selectedOrder.items.map((it, i) => (
                  <div key={i} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={it.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=80&q=80'}
                        alt={it.name}
                        className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">{it.name}</p>
                        <p className="text-slate-600">
                          ₹{it.price} × {it.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">
                      ₹{it.price * it.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="text-emerald-800 text-base">
                  ₹{selectedOrder.totalAmount}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
