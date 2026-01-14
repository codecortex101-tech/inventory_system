import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { categoriesApi } from '../api/categories';
import type { Category, CreateCategoryDto } from '../api/categories';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, FolderIcon, EyeIcon, CubeIcon } from '@heroicons/react/24/outline';

export const Categories = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasProductsFilter, setHasProductsFilter] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CreateCategoryDto>({
    name: '',
    description: '',
  });

  // Read URL parameters on mount and when they change
  useEffect(() => {
    const hasProducts = searchParams.get('hasProducts');
    
    if (hasProducts === 'true') {
      setHasProductsFilter(true);
    } else if (hasProducts === 'false') {
      setHasProductsFilter(false);
    } else {
      setHasProductsFilter(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [categories, hasProductsFilter]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...categories];

    // Filter by has products
    if (hasProductsFilter === true) {
      filtered = filtered.filter((cat) => (cat._count?.products || 0) > 0);
    } else if (hasProductsFilter === false) {
      filtered = filtered.filter((cat) => (cat._count?.products || 0) === 0);
    }

    setFilteredCategories(filtered);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, formData);
        toast.success('Category updated successfully');
      } else {
        await categoriesApi.create(formData);
        toast.success('Category created successfully');
      }
      setShowModal(false);
      loadCategories();
    } catch (error: unknown) {
      const message =
        (error as any)?.response?.data?.message || 'Operation failed';
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this category? Products using this category will be affected.',
      )
    ) {
      return;
    }
    try {
      await categoriesApi.delete(id);
      toast.success('Category deleted successfully');
      loadCategories();
    } catch (error: unknown) {
      const message =
        (error as any)?.response?.data?.message || 'Delete failed';
      toast.error(message);
    }
  };

  const handleViewProducts = (categoryId: string) => {
    // Navigate to products page with category filter
    navigate(`/products?categoryId=${categoryId}`);
  };

  const handleAddProduct = (categoryId: string) => {
    // Navigate to products page with category pre-selected and open add modal
    navigate(`/products?categoryId=${categoryId}&addProduct=true`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-4xl font-extrabold text-gradient mb-2">
            Categories
          </h1>
          <p className="mt-1 text-white/90 font-semibold text-lg">Manage product categories</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 px-6 py-3 text-sm font-bold text-white gradient-accent rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 glow-effect"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Category</span>
          </button>
        )}
      </div>

      <div className="glass-effect rounded-2xl overflow-hidden animate-slide-up border border-blue-400/40 shadow-2xl">
        {/* Show active filters */}
        {hasProductsFilter !== null && (
          <div className="px-6 pt-6 pb-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm font-bold text-blue-200">Active Filters:</span>
            {hasProductsFilter === true && (
              <span className="px-3 py-1.5 bg-indigo-500/30 text-indigo-200 rounded-lg text-xs font-bold border border-indigo-400/40">
                ✓ With Products
              </span>
            )}
            {hasProductsFilter === false && (
              <span className="px-3 py-1.5 bg-pink-500/30 text-pink-200 rounded-lg text-xs font-bold border border-pink-400/40">
                📁 Empty Categories
              </span>
            )}
            <button
              onClick={() => {
                setHasProductsFilter(null);
                setSearchParams({});
              }}
              className="px-3 py-1.5 bg-blue-600/30 text-blue-200 rounded-lg text-xs font-bold border border-blue-400/40 hover:bg-blue-600/50 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-400/20 border-t-blue-300 rounded-full animate-spin"></div>
            <div className="text-blue-100 font-bold">Loading categories...</div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-accent flex items-center justify-center shadow-xl">
              <FolderIcon className="h-8 w-8 text-blue-50" />
            </div>
            <p className="text-blue-100 font-bold text-lg">No categories found</p>
            <p className="text-sm text-blue-200/80 mt-1">
              {hasProductsFilter !== null 
                ? 'No categories match the current filter' 
                : 'Create your first category to get started'}
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-blue-400/20">
            <thead className="bg-blue-600/20 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-blue-600/10 divide-y divide-blue-400/10">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-blue-600/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center shadow-lg">
                        <FolderIcon className="h-5 w-5 text-blue-50" />
                      </div>
                      <div className="text-sm font-bold text-blue-50">
                        {category.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-blue-200/80 max-w-md">
                      {category.description || <span className="text-blue-300/60 italic">No description</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewProducts(category.id)}
                      className="px-3 py-1.5 text-xs font-bold gradient-secondary text-blue-50 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
                      title="View products in this category"
                    >
                      <CubeIcon className="h-3.5 w-3.5" />
                      {category._count?.products || 0} products
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleViewProducts(category.id)}
                      className="p-2 text-blue-200 hover:bg-blue-600/30 rounded-lg transition-all hover:scale-110 border border-blue-400/40"
                      title="View products"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleAddProduct(category.id)}
                          className="p-2 text-green-300 hover:bg-green-600/30 rounded-lg transition-all hover:scale-110 border border-green-400/40"
                          title="Add product to this category"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-blue-200 hover:bg-blue-600/30 rounded-lg transition-all hover:scale-110 border border-blue-400/40"
                          title="Edit category"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 text-blue-300 hover:bg-blue-700/30 rounded-lg transition-all hover:scale-110 border border-blue-500/40"
                          title="Delete category"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="glass-effect rounded-3xl p-8 max-w-md w-full shadow-2xl animate-slide-up border border-blue-400/40">
            <div className="mb-6">
              <h2 className="text-3xl font-extrabold text-gradient">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-blue-100 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full px-4 py-3 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-xl text-blue-50 placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all text-sm font-medium"
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-100 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full px-4 py-3 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-xl text-blue-50 placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all text-sm font-medium"
                  placeholder="Enter category description (optional)"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-blue-400/30">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-sm font-bold text-blue-50 bg-blue-600/30 border border-blue-400/40 rounded-xl hover:bg-blue-600/40 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-bold text-blue-50 gradient-accent rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200 glow-effect border border-blue-400/30"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
