import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  Tags,
} from 'lucide-react';
import { categoryService, productService } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import { AdminPageHeader, AdminErrorState, AdminEmptyState } from './adminUi.jsx';

export default function AdminCategoriesPage() {
  const { success, error } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: { url: '', public_id: '' },
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setErrorState(false);
      const res = await categoryService.getCategories();
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setErrorState(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: { url: '', public_id: '' },
    });
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image: cat.image || { url: '', public_id: '' },
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploadingImage(true);
      const data = new FormData();
      data.append('images', files[0]);

      const res = await productService.uploadImages(data);
      if (res.data.success && res.data.images.length > 0) {
        setFormData((prev) => ({ ...prev, image: res.data.images[0] }));
        success('Category icon uploaded');
      }
    } catch (err) {
      error('Failed to upload category image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const res = await categoryService.updateCategory(editingCategory._id, formData);
        if (res.data.success) {
          success('Category updated successfully');
        }
      } else {
        const res = await categoryService.createCategory(formData);
        if (res.data.success) {
          success('Category created successfully');
        }
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;

    try {
      const res = await categoryService.deleteCategory(id);
      if (res.data.success) {
        success('Category deleted');
        fetchCategories();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error deleting category');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={FolderTree}
        iconBg="bg-sky-50 text-sky-600"
        title="Store Categories"
        count={`${categories.length} departments`}
        subtitle="Organize supermarket aisles, fresh farm categories, and seasonal departments"
      >
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition-all hover:-translate-y-px cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </AdminPageHeader>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200/60 rounded-2xl p-5 animate-pulse space-y-3">
              <div className="w-14 h-14 bg-slate-200 rounded-2xl"></div>
              <div className="h-4 bg-slate-200 rounded-md w-2/3"></div>
              <div className="h-3 bg-slate-200 rounded-md w-full"></div>
              <div className="h-3 bg-slate-200 rounded-md w-1/2"></div>
            </div>
          ))}
        </div>
      ) : errorState ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <AdminErrorState
            title="Could not load categories"
            message="There was a problem fetching the store departments."
            onRetry={fetchCategories}
          />
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <AdminEmptyState
            icon={Tags}
            title="No categories yet"
            message="Create your first store department — like Fruits, Dairy, or Bakery — to organize your products."
          >
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </AdminEmptyState>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((c, i) => (
            <div
              key={c._id}
              className="group bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-sky-200 transition-all duration-200 admin-fade-up flex flex-col"
              style={{ animationDelay: `${Math.min(i * 40, 320)}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <img
                  src={
                    c.image?.url ||
                    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=100&q=80'
                  }
                  alt={c.name}
                  className="w-14 h-14 rounded-2xl object-cover bg-slate-100 border border-slate-200 shadow-sm"
                />
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => openEditModal(c)}
                    className="p-2 text-slate-400 hover:text-sky-700 rounded-lg hover:bg-sky-50 transition-colors"
                    title="Edit Category"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c._id, c.name)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-900 truncate">{c.name}</h3>
                <p className="text-[11px] text-slate-400 font-mono font-semibold mt-0.5">/{c.slug}</p>
                <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {c.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    c.isActive !== false
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${c.isActive !== false ? 'bg-emerald-500' : 'bg-slate-400'}`}
                  ></span>
                  {c.isActive !== false ? 'Active' : 'Hidden'}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Department
                </span>
              </div>
            </div>
          ))}
        </div>
      )
      }

      {/* Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px] admin-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl admin-pop max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Tags className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingCategory ? 'Edit Category' : 'Create Supermarket Category'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: !editingCategory
                        ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                        : formData.slug,
                    })
                  }
                  placeholder="e.g. Fresh Fruits & Berries"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value.toLowerCase() })
                  }
                  placeholder="e.g. fruits-berries"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief summary of items in this department..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300 transition"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Banner / Icon Image
                </label>
                <div className="flex items-center gap-3">
                  {formData.image?.url && (
                    <img
                      src={formData.image.url}
                      alt="Category preview"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                  )}
                  <label className="flex items-center gap-2 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition-all cursor-pointer"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
