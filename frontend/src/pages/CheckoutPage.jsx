import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Plus,
  CheckCircle2,
  Banknote,
  ShieldCheck,
  Truck,
  ArrowRight,
  Info,
} from 'lucide-react';
import { addressService, orderService } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { cartItems, subtotal, shippingFee, grandTotal, fetchCart } = useCart();
  const { success, error } = useToast();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  // New address form state
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: true,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    const loadAddresses = async () => {
      try {
        setLoading(true);
        const res = await addressService.getAddresses();
        if (res.data.success) {
          const list = res.data.addresses;
          setAddresses(list);
          const defaultAddr = list.find((a) => a.isDefault) || list[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr._id);
          } else {
            setShowAddressForm(true);
          }
        }
      } catch (err) {
        console.error('Error fetching addresses:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAddresses();
  }, [isAuthenticated, cartItems.length, navigate, user]);

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await addressService.addAddress(newAddress);
      if (res.data.success) {
        success('Delivery address saved');
        const created = res.data.address;
        setAddresses((prev) => [created, ...prev]);
        setSelectedAddressId(created._id);
        setShowAddressForm(false);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      error('Please select or add a delivery address');
      return;
    }

    try {
      setPlacingOrder(true);
      const res = await orderService.createOrder({
        addressId: selectedAddressId,
        paymentMethod: 'COD',
        deliveryNotes: deliveryNotes.trim(),
      });

      if (res.data.success) {
        success('Order placed successfully via Cash on Delivery!');
        await fetchCart(); // Refresh cart so it's empty
        navigate(`/orders/${res.data.order._id}?success=true`);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error placing order');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Checkout & Delivery
        </h1>
        <p className="text-xs sm:text-sm text-slate-700 mt-1">
          Complete your delivery information. Payment is collected in cash at your doorstep.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Addresses & Payment */}
        <div className="lg:col-span-8 space-y-8">
          {/* Step 1: Select Address */}
          <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>1. Delivery Address</span>
              </h2>

              {!showAddressForm && (
                <button
                  type="button"
                  onClick={() => setShowAddressForm(true)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              )}
            </div>

            {/* Address cards list */}
            {addresses.length > 0 && !showAddressForm && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr._id;
                  return (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          {addr.fullName}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {addr.street}, {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                      <p className="text-xs text-slate-600 font-medium mt-1">
                        Phone: {addr.phone}
                      </p>

                      {isSelected && (
                        <div className="absolute top-3 right-3 text-emerald-600">
                          <CheckCircle2 className="w-4 h-4 fill-emerald-600 text-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* New Address Form Modal/Inline */}
            {showAddressForm && (
              <form
                onSubmit={handleCreateAddress}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4"
              >
                <h3 className="text-xs font-bold text-slate-900 uppercase">
                  Add Delivery Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.fullName}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, fullName: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={newAddress.phone}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Street Address & Flat / House No. *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.street}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, street: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.state}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, state: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Pincode / Postal Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.postalCode}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, postalCode: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                  >
                    Save Address
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </section>

          {/* Step 2: Payment Method */}
          <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Banknote className="w-5 h-5 text-amber-600" />
              <span>2. Payment Option</span>
            </h2>

            <div className="p-4 rounded-xl border-2 border-emerald-600 bg-emerald-50/40 flex items-start gap-4">
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center mt-0.5 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    Cash on Delivery (COD)
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pay securely with exact cash when your package is delivered to your doorstep. You may inspect your produce freshness and seal before handing over cash.
                </p>
              </div>
            </div>

            {/* Delivery instructions note */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Delivery Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="E.g. Leave at gate with security, ring bell twice, call before arriving..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              ></textarea>
            </div>
          </section>
        </div>

        {/* Right Column (4 cols): Order Summary & Confirm Button */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6 sticky top-24">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Order Review ({cartItems.length} items)
          </h3>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-2">
            {cartItems.map((item) => (
              <div
                key={item.product?._id || item._id}
                className="pt-2 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-900 line-clamp-1">
                    {item.name}
                  </span>
                  <span className="text-slate-600">
                    Qty: {item.quantity} × ₹{item.price}
                  </span>
                </div>
                <span className="font-bold text-slate-900">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span>Items Total</span>
              <span className="font-semibold text-slate-900">₹{subtotal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery Fee</span>
              {shippingFee === 0 ? (
                <span className="text-emerald-700 font-bold">FREE</span>
              ) : (
                <span className="font-semibold text-slate-900">₹{shippingFee}</span>
              )}
            </div>
            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-base font-bold text-slate-900">
              <span>Payable on Delivery</span>
              <span className="text-emerald-800 text-lg">₹{grandTotal}</span>
            </div>
          </div>

          <button
            type="button"
            id="place-order-btn"
            disabled={placingOrder || !selectedAddressId}
            onClick={handlePlaceOrder}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <span>
              {placingOrder ? 'Confirming Order...' : `Place COD Order (₹${grandTotal})`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-center text-slate-600">
            By clicking place order, you agree to MegaBasket Terms and Cash on Delivery guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}
