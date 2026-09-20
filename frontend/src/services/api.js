import axios from 'axios';

// Base API URL:
// - On Vercel: VITE_API_URL should be set in Vercel Environment Variables (e.g. https://your-backend.onrender.com/api)
// - On Local / Container: defaults to relative '/api'
const getBaseApiUrl = () => {
  let envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || typeof envUrl !== 'string') return '/api';

  envUrl = envUrl.trim();

  // If accidentally pasted with variable name or quotes
  if (envUrl.startsWith('VITE_API_URL=')) {
    envUrl = envUrl.replace(/^VITE_API_URL=/, '').trim();
  }
  envUrl = envUrl.replace(/^['"]|['"]$/g, '');

  // If empty or local fallback
  if (!envUrl || envUrl === 'undefined' || envUrl.includes('localhost:5001')) {
    return '/api';
  }

  // Remove trailing slashes
  envUrl = envUrl.replace(/\/+$/, '');

  // If user provided just "https://backend.onrender.com" without "/api", append "/api"
  if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
    if (!envUrl.endsWith('/api')) {
      envUrl = `${envUrl}/api`;
    }
  }

  return envUrl;
};

const API_URL = getBaseApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to all requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('megabasket_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, clear local auth
      const currentPath = window.location.pathname;
      if (
        currentPath.startsWith('/profile') ||
        currentPath.startsWith('/checkout') ||
        currentPath.startsWith('/orders') ||
        currentPath.startsWith('/admin')
      ) {
        localStorage.removeItem('megabasket_token');
        localStorage.removeItem('megabasket_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Product Services
export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getFeatured: (limit) => api.get('/products/featured', { params: { limit } }),
  getByIdOrSlug: (idOrSlug) => api.get(`/products/${idOrSlug}`),
  getRelated: (id, limit) => api.get(`/products/${id}/related`, { params: { limit } }),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  uploadImages: (formData) =>
    api.post('/products/upload-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Category Services
export const categoryService = {
  getCategories: (all = false) => api.get('/categories', { params: { all } }),
  getByIdOrSlug: (idOrSlug) => api.get(`/categories/${idOrSlug}`),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

// Cart Services
export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity = 1) =>
    api.post('/cart/add', { productId, quantity }),
  updateQuantity: (productId, quantity) =>
    api.put('/cart/update', { productId, quantity }),
  removeItem: (productId) => api.delete(`/cart/remove/${productId}`),
  clearCart: () => api.delete('/cart/clear'),
};

// Wishlist Services
export const wishlistService = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (productId) => api.post(`/wishlist/add/${productId}`),
  removeFromWishlist: (productId) =>
    api.delete(`/wishlist/remove/${productId}`),
  moveToCart: (productId) => api.post(`/wishlist/move-to-cart/${productId}`),
};

// Address Services
export const addressService = {
  getAddresses: () => api.get('/addresses'),
  addAddress: (data) => api.post('/addresses', data),
  updateAddress: (id, data) => api.put(`/addresses/${id}`, data),
  setDefault: (id) => api.put(`/addresses/${id}/default`),
  deleteAddress: (id) => api.delete(`/addresses/${id}`),
};

// Order Services
export const orderService = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
};

// Review Services
export const reviewService = {
  getProductReviews: (productId) => api.get(`/reviews/product/${productId}`),
  addReview: (data) => api.post('/reviews', data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

// Admin Services
export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard-stats'),
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, status) =>
    api.put(`/admin/orders/${id}/status`, typeof status === 'string' ? { status } : status),
  updatePaymentStatus: (id, paymentStatus) =>
    api.put(`/admin/orders/${id}/payment`, { paymentStatus }),
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUserStatus: (id, data) => api.put(`/users/${id}/status`, data),
};


export default api;
