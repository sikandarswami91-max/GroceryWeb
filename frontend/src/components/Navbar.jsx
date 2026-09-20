import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Search,
  User,
  Menu,
  X,
  ShieldAlert,
  LogOut,
  MapPin,
  ChevronDown,
  ShoppingBasket,
  Package,
  Phone,
  Clock,
  Check,
  Percent,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';

const POPULAR_LOCATIONS = [
  { city: 'Mumbai', pincode: '400001', area: 'Fort / South Mumbai' },
  { city: 'Delhi', pincode: '110001', area: 'Connaught Place' },
  { city: 'Bengaluru', pincode: '560001', area: 'MG Road / Indiranagar' },
  { city: 'Hyderabad', pincode: '500001', area: 'Banjara Hills' },
  { city: 'Pune', pincode: '411001', area: 'Shivajinagar' },
  { city: 'Chennai', pincode: '600001', area: 'George Town' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems, subtotal } = useCart();
  const { totalWishlist } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(() => {
    const saved = localStorage.getItem('megabasket_location');
    return saved ? JSON.parse(saved) : { city: 'Mumbai', pincode: '400001' };
  });
  const [customPincode, setCustomPincode] = useState('');

  const userMenuRef = useRef(null);
  const locationModalRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (locationModalRef.current && !locationModalRef.current.contains(e.target)) {
        setLocationModalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    localStorage.setItem('megabasket_location', JSON.stringify(loc));
    setLocationModalOpen(false);
  };

  const handleCustomPincodeSubmit = (e) => {
    e.preventDefault();
    if (customPincode.trim().length === 6) {
      const newLoc = { city: 'Express Zone', pincode: customPincode.trim() };
      setSelectedLocation(newLoc);
      localStorage.setItem('megabasket_location', JSON.stringify(newLoc));
      setLocationModalOpen(false);
      setCustomPincode('');
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* 1. Top Announcement Bar */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="font-medium truncate">
              ⚡ 15-30 Minute Express Delivery | Fresh Grocery Marketplace | Cash on Delivery Available
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-5 text-xs text-emerald-200/90 shrink-0">
            <span className="flex items-center gap-1 hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>1800-MEGABASKET</span>
            </span>
            <span>•</span>
            <Link to="/orders" className="hover:text-white transition-colors">
              Track Order
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-3 sm:gap-6">
          {/* Logo */}
          <Link
            to="/"
            id="nav-logo"
            className="flex items-center gap-2.5 shrink-0 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:bg-emerald-700 transition-colors">
              <ShoppingBasket className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
                Mega<span className="text-emerald-600">Basket</span>
              </span>
              <span className="text-[10px] font-bold text-slate-700 tracking-wider uppercase mt-0.5">
                Online Supermarket
              </span>
            </div>
          </Link>

          {/* Delivery Location Selector (Desktop) */}
          <div className="relative hidden xl:block shrink-0" ref={locationModalRef}>
            <button
              type="button"
              id="nav-location-btn"
              onClick={() => setLocationModalOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50 transition-all text-left cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-600 leading-none">
                  Deliver to
                </span>
                <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[130px]">
                  {selectedLocation.city} {selectedLocation.pincode}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-600 ml-0.5" />
            </button>

            {/* Location Selector Popup */}
            {locationModalOpen && (
              <div
                id="nav-location-dropdown"
                className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    Select Delivery Location
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Express 15-30m
                  </span>
                </div>

                {/* Popular Cities */}
                <div className="py-2.5 space-y-1">
                  <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Popular Delivery Hubs
                  </p>
                  {POPULAR_LOCATIONS.map((loc) => {
                    const isSelected = selectedLocation.pincode === loc.pincode;
                    return (
                      <button
                        key={loc.pincode}
                        type="button"
                        onClick={() => handleSelectLocation(loc)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-800 font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-slate-900">{loc.city} ({loc.pincode})</div>
                          <div className="text-[10px] text-slate-600">{loc.area}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>

                {/* Enter Custom Pincode */}
                <form onSubmit={handleCustomPincodeSubmit} className="pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-600 mb-1.5">Enter 6-Digit Pincode</p>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      maxLength={6}
                      value={customPincode}
                      onChange={(e) => setCustomPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 400001"
                      className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={customPincode.trim().length !== 6}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Large Search Bar - Center Desktop */}
          <form
            onSubmit={handleSearch}
            id="nav-search-form"
            className="hidden md:flex flex-1 max-w-xl relative"
          >
            <div className="relative w-full">
              <input
                type="text"
                id="nav-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fresh vegetables, organic milk, basmati rice, tea, snacks..."
                className="w-full pl-11 pr-24 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              <Search className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                id="nav-search-btn"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold tracking-wide transition-colors cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Right Action Icons: Wishlist, Cart, Account */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              id="nav-wishlist-btn"
              className="relative p-2.5 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors flex items-center justify-center"
              title="My Wishlist"
            >
              <Heart className="w-5 h-5" />
              {totalWishlist > 0 && (
                <span
                  id="nav-wishlist-count"
                  className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs"
                >
                  {totalWishlist}
                </span>
              )}
            </Link>

            {/* Cart Link with Badge and Total Amount */}
            <Link
              to="/cart"
              id="nav-cart-btn"
              className="relative flex items-center gap-2.5 px-3 py-2 text-slate-800 hover:text-emerald-700 bg-emerald-50/90 hover:bg-emerald-100 border border-emerald-200/80 rounded-full transition-all shadow-2xs"
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-emerald-700" />
                {totalItems > 0 && (
                  <span
                    id="nav-cart-count"
                    className="absolute -top-1.5 -right-2 w-4 h-4 bg-emerald-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs"
                  >
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-[10px] text-slate-700 font-medium">
                  {totalItems > 0 ? `${totalItems} items` : 'My Cart'}
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {subtotal > 0 ? `₹${subtotal}` : '₹0'}
                </span>
              </div>
            </Link>

            {/* User Account Dropdown */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  id="nav-user-menu-btn"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full hover:bg-slate-100 border border-slate-200 transition-colors text-slate-800 focus:outline-none cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden md:inline-block text-xs font-semibold max-w-[90px] truncate text-slate-800">
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-600 hidden sm:inline-block" />
                </button>

                {userDropdownOpen && (
                  <div
                    id="nav-user-dropdown"
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs text-slate-600">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-slate-600 truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                          Admin Access
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4 text-emerald-600" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Package className="w-4 h-4 text-slate-600" />
                      My Orders
                    </Link>

                    <Link
                      to="/addresses"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-slate-600" />
                      Saved Addresses
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-600" />
                      My Profile
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center">
                <Link
                  to="/login"
                  id="nav-login-btn"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-full transition-colors flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              id="nav-mobile-toggle"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 text-slate-600 hover:text-slate-900 md:hidden focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* 3. Category Navigation Bar Below Main Navbar */}
        <nav className="hidden md:flex items-center gap-5 py-2.5 border-t border-slate-100 text-xs font-medium text-slate-600 overflow-x-auto no-scrollbar">
          <Link
            to="/products"
            className="text-emerald-700 font-bold hover:text-emerald-800 transition-colors shrink-0 flex items-center gap-1"
          >
            <span>All Groceries</span>
          </Link>
          <Link
            to="/categories"
            className="hover:text-emerald-700 font-semibold transition-colors shrink-0"
          >
            Browse Categories
          </Link>
          <Link
            to="/products?category=fresh-fruits"
            className="hover:text-emerald-700 transition-colors shrink-0"
          >
            🍎 Fresh Fruits
          </Link>
          <Link
            to="/products?category=fresh-vegetables"
            className="hover:text-emerald-700 transition-colors shrink-0"
          >
            🥦 Vegetables
          </Link>
          <Link
            to="/products?category=dairy-breakfast"
            className="hover:text-emerald-700 transition-colors shrink-0"
          >
            🥛 Dairy & Breakfast
          </Link>
          <Link
            to="/products?category=rice-grains"
            className="hover:text-emerald-700 transition-colors shrink-0"
          >
            🌾 Rice & Grains
          </Link>
          <Link
            to="/products?category=pulses-dals"
            className="hover:text-emerald-700 transition-colors shrink-0"
          >
            🥣 Dals & Pulses
          </Link>
          <Link
            to="/products?category=oil-ghee"
            className="hover:text-emerald-700 transition-colors shrink-0"
          >
            🧈 Oil & Ghee
          </Link>
          <Link
            to="/products?category=snacks-biscuits"
            className="hover:text-emerald-700 transition-colors shrink-0"
          >
            🍪 Snacks & Biscuits
          </Link>
          <Link
            to="/products?category=beverages"
            className="hover:text-emerald-700 transition-colors shrink-0"
          >
            🧃 Beverages
          </Link>
          <Link
            to="/products?category=tea-coffee"
            className="hover:text-emerald-700 transition-colors shrink-0"
          >
            ☕ Tea & Coffee
          </Link>
          <Link
            to="/products?featured=true"
            className="ml-auto text-amber-600 font-bold hover:text-amber-700 transition-colors shrink-0 flex items-center gap-1"
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Best Deals</span>
          </Link>
        </nav>
      </div>

      {/* 4. Mobile Drawer Menu & Mobile Search */}
      <div className="md:hidden px-4 pb-3 pt-1 border-t border-slate-100 bg-white">
        <form onSubmit={handleSearch} className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search produce, milk, snacks..."
            className="w-full pl-9 pr-18 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
          >
            Search
          </button>
        </form>

        {/* Mobile Location Notice */}
        <div className="flex items-center justify-between pt-2 text-[11px] text-slate-600">
          <div className="flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Delivering to {selectedLocation.city} ({selectedLocation.pincode})</span>
          </div>
          <span className="text-emerald-700 font-bold">15-30 Mins</span>
        </div>
      </div>

      {/* Mobile Drawer Navigation Links */}
      {mobileMenuOpen && (
        <div
          id="nav-mobile-drawer"
          className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg"
        >
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-800">
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 flex items-center gap-2"
            >
              <span>🛒 All Products</span>
            </Link>
            <Link
              to="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 flex items-center gap-2"
            >
              <span>📂 15 Categories</span>
            </Link>
            <Link
              to="/products?category=fresh-fruits"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 flex items-center gap-2"
            >
              <span>🍎 Fresh Fruits</span>
            </Link>
            <Link
              to="/products?category=fresh-vegetables"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 flex items-center gap-2"
            >
              <span>🥦 Vegetables</span>
            </Link>
            <Link
              to="/products?category=dairy-breakfast"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 flex items-center gap-2"
            >
              <span>🥛 Dairy & Eggs</span>
            </Link>
            <Link
              to="/products?category=rice-grains"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 flex items-center gap-2"
            >
              <span>🌾 Rice & Grains</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col space-y-1 text-xs font-medium text-slate-700">
            <Link
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center justify-between"
            >
              <span>Track Orders</span>
              <Package className="w-4 h-4 text-slate-600" />
            </Link>
            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center justify-between"
            >
              <span>Saved Wishlist</span>
              {totalWishlist > 0 && (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">
                  {totalWishlist}
                </span>
              )}
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 font-bold"
              >
                Admin Panel (Products CRUD)
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
