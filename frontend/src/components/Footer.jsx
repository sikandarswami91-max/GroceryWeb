import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBasket,
  Truck,
  Banknote,
  ShieldCheck,
  Clock,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      {/* Value Proposition Highlights */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left">
            <div className="flex items-center sm:items-start gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Superfast Delivery</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Delivered right to your doorstep within 15-30 minutes.
                </p>
              </div>
            </div>

            <div className="flex items-center sm:items-start gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Banknote className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Cash on Delivery</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Pay securely with cash only when your order arrives.
                </p>
              </div>
            </div>

            <div className="flex items-center sm:items-start gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">100% Quality Guaranteed</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Hand-inspected organic farm produce & fresh essentials.
                </p>
              </div>
            </div>

            <div className="flex items-center sm:items-start gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Open 7 Days a Week</h4>
                <p className="text-xs text-slate-400 mt-1">
                  From 6:00 AM to 11:00 PM for all your daily needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <ShoppingBasket className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Mega<span className="text-emerald-400">Basket</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              MegaBasket is your trusted neighbourhood grocery hypermarket.
              We source directly from certified regional farms and premium brands,
              delivering fresh quality everyday right to your kitchen.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>MegaBasket Central Fulfillment Center, Sector 44, Tech Hub</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Customer Care: +91 (800) 634-2227</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@megabasket.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
              Explore
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/products" className="hover:text-emerald-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-emerald-400 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/products?featured=true" className="hover:text-emerald-400 transition-colors">
                  Featured Deals
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-emerald-400 transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-emerald-400 transition-colors">
                  Saved Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Account */}
          <div>
            <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
              My Account
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/orders" className="hover:text-emerald-400 transition-colors">
                  Order History
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-emerald-400 transition-colors">
                  Account Details
                </Link>
              </li>
              <li>
                <Link to="/addresses" className="hover:text-emerald-400 transition-colors">
                  Delivery Addresses
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">
                  Sign In / Register
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-emerald-400/80 hover:text-emerald-300 font-semibold transition-colors">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment & Security Info */}
          <div>
            <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
              Payment Method
            </h5>
            <p className="text-xs text-slate-400 mb-3">
              We exclusively support <strong className="text-slate-200">Cash on Delivery (COD)</strong> at present. Inspect your fresh items at your doorstep before handing over payment!
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-emerald-400 text-xs font-medium border border-slate-700">
              <Banknote className="w-4 h-4" />
              <span>Cash on Delivery (COD)</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MegaBasket Grocery Technologies Ltd. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Refund & Return Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
