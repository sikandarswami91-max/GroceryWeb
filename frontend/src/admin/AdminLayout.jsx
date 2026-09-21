import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FolderTree,
  ShoppingBag,
  Users,
  Store,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ShoppingBasket,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { avatarColor } from './adminUi.jsx';

const PAGE_TITLES = [
  { match: /^\/admin\/?$/, title: 'Dashboard', crumb: 'Overview' },
  { match: /^\/admin\/orders/, title: 'Orders', crumb: 'Order Management' },
  { match: /^\/admin\/products\/new$/, title: 'Add Product', crumb: 'Products' },
  { match: /^\/admin\/products\/[^/]+\/edit$/, title: 'Edit Product', crumb: 'Products' },
  { match: /^\/admin\/products/, title: 'Products', crumb: 'Product Catalog' },
  { match: /^\/admin\/categories/, title: 'Categories', crumb: 'Store Departments' },
  { match: /^\/admin\/users/, title: 'Customers', crumb: 'User Management' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [collapsed, setCollapsed] = useState(false); // desktop rail
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Add Product', path: '/admin/products/new', icon: PlusCircle },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Customer Users', path: '/admin/users', icon: Users },
  ];

  const current = PAGE_TITLES.find((p) => p.match.test(location.pathname)) || {
    title: 'Admin',
    crumb: 'Admin Console',
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile drawer + dropdown on route change
  useEffect(() => {
    setSidebarOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = (user?.name || 'A')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-100/70 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[2px] lg:hidden admin-fade-in"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-300 ease-in-out w-64 ${
          collapsed ? 'lg:w-[76px]' : 'lg:w-64'
        } ${sidebarOpen ? 'translate-x-0 shadow-2xl admin-fade-in' : 'max-lg:hidden'}`}
      >
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="flex items-center justify-between px-4 pt-5 pb-4">
            <Link to="/admin" className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0">
                <ShoppingBasket className="w-5 h-5" />
              </div>
              {!collapsed && (
                <div className="whitespace-nowrap">
                  <span className="text-[15px] font-extrabold text-slate-900 leading-tight block">
                    Mega<span className="text-emerald-600">Basket</span>
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.15em]">
                    Admin Console
                  </span>
                </div>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 space-y-1 pb-4">
            {!collapsed && (
              <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em]">
                Management
              </p>
            )}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    collapsed ? 'lg:justify-center lg:px-0' : ''
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/70'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      !isActive ? 'group-hover:scale-110' : ''
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {isActive && !collapsed && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/90"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer Area */}
          <div className={`px-3 pb-4 pt-3 border-t border-slate-100 space-y-1.5 ${collapsed ? 'lg:px-2' : ''}`}>
            <Link
              to="/"
              title={collapsed ? 'View Storefront' : undefined}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/70 transition-colors ${
                collapsed ? 'lg:justify-center lg:px-0' : ''
              }`}
            >
              <Store className="w-4 h-4 shrink-0" />
              {!collapsed && <span>View Storefront</span>}
            </Link>

            {/* User card */}
            <div
              className={`px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5 ${
                collapsed ? 'lg:justify-center lg:px-2' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-sm ${avatarColor(
                  user?.email || 'admin'
                )}`}
              >
                {initials}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Admin'}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">Administrator</p>
                </div>
              )}
              {!collapsed && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop collapse toggle */}
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="hidden lg:flex p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            <div className="min-w-0 hidden sm:block">
              <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                <span>Admin</span>
                <ChevronRight className="w-3 h-3" />
                <span>{current.crumb}</span>
              </p>
              <h2 className="text-sm font-bold text-slate-900 leading-tight truncate">
                {current.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Mode</span>
            </span>

            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              Open Store
            </Link>

            <button
              type="button"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {alertsEnabled() && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((o) => !o)}
                className={`w-9 h-9 rounded-full text-white text-[11px] font-bold flex items-center justify-center shadow-sm ring-2 transition-all cursor-pointer ${avatarColor(
                  user?.email || 'admin'
                )} ${
                  profileOpen
                    ? 'ring-emerald-300 scale-105'
                    : 'ring-transparent hover:ring-emerald-200'
                }`}
              >
                {initials}
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2.5 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 py-2 admin-pop z-50">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                  >
                    <Store className="w-4 h-4" />
                    View Storefront
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Nested Route View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Low-stock bell dot: reads the alert flag cached by the dashboard page (no extra API call)
function alertsEnabled() {
  try {
    return sessionStorage.getItem('mb_admin_alerts') === 'true';
  } catch {
    return false;
  }
}
