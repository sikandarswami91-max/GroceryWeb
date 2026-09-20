import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  Package,
  Calendar,
  MapPin,
  Banknote,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  XCircle,
  ChevronLeft,
} from 'lucide-react';
import { orderService } from '../services/api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import { useToast } from '../context/ToastContext.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isNewOrder = searchParams.get('success') === 'true';

  const { success, error } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrderById(id);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      const res = await orderService.cancelOrder(order._id, cancelReason);
      if (res.data.success) {
        success('Your order has been cancelled.');
        setShowCancelModal(false);
        fetchOrder();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error cancelling order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <SkeletonLoader type="table" count={3} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
        <Link
          to="/orders"
          className="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const stages = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
  const currentStageIndex = stages.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'Cancelled';
  const canCancel = ['Pending', 'Confirmed'].includes(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb */}
      <div>
        <Link
          to="/orders"
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>
      </div>

      {/* New Order Success Banner */}
      {isNewOrder && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold">
              Order Confirmed! Your groceries are being packed.
            </h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              We received your Cash on Delivery order. Our fulfillment team is selecting the freshest produce for you right now.
            </p>
          </div>
        </div>
      )}

      {/* Order Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Order #{order.orderNumber}
              </h1>
              <StatusBadge status={order.orderStatus} />
            </div>
            <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Placed on {new Date(order.createdAt).toLocaleString()}
              </span>
            </p>
          </div>

          {canCancel && (
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel Order
            </button>
          )}
        </div>

        {/* Visual Timeline Tracker */}
        <div className="py-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-6">
            Delivery Timeline Status
          </h3>

          {isCancelled ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>This order was cancelled. Stock has been returned to inventory.</span>
            </div>
          ) : (
            <div className="relative flex flex-col sm:flex-row justify-between gap-4 sm:gap-0">
              {stages.map((stage, idx) => {
                const isPassed = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div
                    key={stage}
                    className="flex sm:flex-col items-center gap-3 sm:gap-2 flex-1 relative z-10"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isPassed
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`text-xs font-semibold text-center ${
                        isCurrent
                          ? 'text-emerald-700 font-bold'
                          : isPassed
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Address & Payment Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Delivery Address</span>
          </h3>
          <p className="text-sm font-bold text-slate-900">
            {order.shippingAddress?.fullName}
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            {order.shippingAddress?.street}, {order.shippingAddress?.city},{' '}
            {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
          </p>
          <p className="text-xs text-slate-600 font-medium">
            Contact Phone: {order.shippingAddress?.phone}
          </p>
          {order.deliveryNotes && (
            <div className="pt-2 text-xs text-slate-500 italic">
              &ldquo;Note: {order.deliveryNotes}&rdquo;
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Banknote className="w-4 h-4 text-amber-600" />
            <span>Payment Breakdown</span>
          </h3>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-600">Payment Method</span>
            <span className="font-bold text-slate-900">Cash on Delivery (COD)</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Payment Status</span>
            <StatusBadge status={order.paymentStatus} type="payment" />
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-600">Total Bill Amount</span>
            <span className="text-base font-bold text-slate-900">
              ₹{order.totalAmount}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 pt-1">
            {order.paymentStatus === 'paid'
              ? 'Cash paid and received on delivery.'
              : 'Please pay exact amount in cash when your delivery executive arrives.'}
          </p>
        </div>
      </div>

      {/* Ordered Items Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-600" />
          <span>Purchased Items ({order.items.length})</span>
        </h3>

        <div className="divide-y divide-slate-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80'}
                  alt={item.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-100 bg-slate-50 shrink-0"
                />
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-600">
                    ₹{item.price} × {item.quantity}
                  </p>
                </div>
              </div>

              <span className="text-sm font-bold text-slate-900">
                ₹{item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing Totals */}
        <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span>Items Subtotal</span>
            <span className="font-semibold text-slate-900">₹{order.itemsPrice}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Shipping Fee</span>
            {order.shippingPrice === 0 ? (
              <span className="text-emerald-700 font-bold">FREE</span>
            ) : (
              <span className="font-semibold text-slate-900">₹{order.shippingPrice}</span>
            )}
          </div>
          <div className="flex items-center justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
            <span>Total Payable Amount</span>
            <span className="text-emerald-800 text-lg">₹{order.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">
              Confirm Order Cancellation
            </h3>
            <p className="text-xs text-slate-600">
              Are you sure you wish to cancel order #{order.orderNumber}? The reserved grocery items will be restored to store stock.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for cancellation (optional)
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="E.g., Ordered by mistake, found alternative..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                No, Keep Order
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
