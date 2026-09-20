import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/api.js';
import { Package, ChevronRight, Calendar, ShoppingBag } from 'lucide-react';
import StatusBadge from '../components/StatusBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await orderService.getMyOrders();
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Package className="w-7 h-7 text-emerald-600" />
          <span>My Orders</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-700 mt-1">
          Review your current grocery shipments and past delivery receipts
        </p>
      </div>

      {loading ? (
        <SkeletonLoader type="table" count={4} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders placed yet"
          description="You haven't placed any grocery orders yet. Discover fresh farm products and place your first order with Cash on Delivery!"
          actionText="Shop Now"
          actionLink="/products"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      Order #{order.orderNumber}
                    </span>
                    <StatusBadge status={order.orderStatus} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-600 block">Total Amount</span>
                  <span className="text-base font-bold text-slate-900">
                    ₹{order.totalAmount}
                  </span>
                </div>
              </div>

              {/* Items preview */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-x-auto py-1">
                  {order.items.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80'}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-50 shrink-0"
                      />
                      <div className="text-xs max-w-[120px] hidden sm:block">
                        <p className="font-semibold text-slate-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-slate-600">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <span className="text-xs font-semibold text-slate-600 px-2 py-1 bg-slate-100 rounded-lg">
                      +{order.items.length - 4} more
                    </span>
                  )}
                </div>

                <Link
                  to={`/orders/${order._id}`}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <span>View Details & Timeline</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
