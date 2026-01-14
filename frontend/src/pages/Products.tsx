import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { productsApi } from '../api/products';
import type { Product, CreateProductDto } from '../api/products';
import { categoriesApi } from '../api/categories';
import type { Category } from '../api/categories';
import { stockApi } from '../api/stock';
import type { CreateStockMovementDto } from '../api/stock';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, CubeIcon } from '@heroicons/react/24/outline';

interface ProductWithLastMovement extends Product {
  lastMovement?: {
    userName: string;
    date: string;
    time: string;
    type: string;
  };
}

export const Products = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<ProductWithLastMovement[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [outOfStockFilter, setOutOfStockFilter] = useState(false);
  const [expiredFilter, setExpiredFilter] = useState(false);
  const [expiringSoonFilter, setExpiringSoonFilter] = useState(false);
  const [activeExpirationFilter, setActiveExpirationFilter] = useState(false);
  const [hasExpirationDateFilter, setHasExpirationDateFilter] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<CreateProductDto>({
    name: '',
    sku: '',
    categoryId: '',
    description: '',
    imageUrl: '',
    costPrice: 0,
    sellingPrice: 0,
    currentStock: 0,
    minimumStock: 0,
    unit: 'pcs',
    status: 'ACTIVE',
    expirationDate: undefined,
  });
  const [stockFormData, setStockFormData] = useState<CreateStockMovementDto>({
    productId: '',
    quantity: 0,
    type: 'IN',
    reason: '',
  });

  // Read URL parameters on mount and when they change
  useEffect(() => {
    const status = searchParams.get('status') || '';
    const lowStock = searchParams.get('lowStock') === 'true';
    const outOfStock = searchParams.get('outOfStock') === 'true';
    const categoryId = searchParams.get('categoryId') || '';
    const addProduct = searchParams.get('addProduct') === 'true';
    const expired = searchParams.get('expired') === 'true';
    const expiringSoon = searchParams.get('expiringSoon') === 'true';
    const activeExpiration = searchParams.get('activeExpiration') === 'true';
    const hasExpirationDate = searchParams.get('hasExpirationDate') === 'true';
    
    // Update filters from URL params
    setStatusFilter(status);
    setLowStockFilter(lowStock);
    setOutOfStockFilter(outOfStock);
    setExpiredFilter(expired);
    setExpiringSoonFilter(expiringSoon);
    setActiveExpirationFilter(activeExpiration);
    setHasExpirationDateFilter(hasExpirationDate);
    if (categoryId) {
      setCategoryFilter(categoryId);
    }
    
    // If addProduct is true, open the modal with category pre-selected
    if (addProduct && categoryId) {
      setFormData({
        name: '',
        sku: '',
        categoryId: categoryId,
        description: '',
        imageUrl: '',
        costPrice: 0,
        sellingPrice: 0,
        currentStock: 0,
        minimumStock: 0,
        unit: 'pcs',
        status: 'ACTIVE',
        expirationDate: undefined,
      });
      setEditingProduct(null);
      setShowModal(true);
      // Remove addProduct from URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('addProduct');
      setSearchParams(newParams);
    }
    
    // Reset to first page when filter changes
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [page, search, categoryFilter, statusFilter, lowStockFilter, outOfStockFilter, expiredFilter, expiringSoonFilter, activeExpirationFilter, hasExpirationDateFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      let productsData: Product[] = [];
      
      // If filtering by low stock or out of stock, use dedicated API endpoints
      if (lowStockFilter) {
        const lowStockProducts = await productsApi.getLowStock();
        productsData = lowStockProducts;
        
        // Apply additional filters if any
        if (search) {
          productsData = productsData.filter(
            (p) => p.name.toLowerCase().includes(search.toLowerCase()) ||
                   p.sku.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        if (categoryFilter) {
          productsData = productsData.filter(
            (p) => p.categoryId === categoryFilter
          );
        }
        
        if (statusFilter) {
          productsData = productsData.filter(
            (p) => p.status === statusFilter
          );
        }
        
        // Calculate total pages BEFORE slicing
        const totalFiltered = productsData.length;
        setTotalPages(Math.ceil(totalFiltered / 10));
        
        // Apply pagination manually
        const startIndex = (page - 1) * 10;
        const endIndex = startIndex + 10;
        productsData = productsData.slice(startIndex, endIndex);
      } else if (outOfStockFilter) {
        const outOfStockProducts = await productsApi.getOutOfStock();
        productsData = outOfStockProducts;
        
        // Apply additional filters if any
        if (search) {
          productsData = productsData.filter(
            (p) => p.name.toLowerCase().includes(search.toLowerCase()) ||
                   p.sku.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        if (categoryFilter) {
          productsData = productsData.filter(
            (p) => p.categoryId === categoryFilter
          );
        }
        
        if (statusFilter) {
          productsData = productsData.filter(
            (p) => p.status === statusFilter
          );
        }
        
        // Calculate total pages BEFORE slicing
        const totalFiltered = productsData.length;
        setTotalPages(Math.ceil(totalFiltered / 10));
        
        // Apply pagination manually
        const startIndex = (page - 1) * 10;
        const endIndex = startIndex + 10;
        productsData = productsData.slice(startIndex, endIndex);
      } else {
        // Normal pagination for all other cases with expiration filters
        const response = await productsApi.getAll(
          page,
          10,
          search || undefined,
          categoryFilter || undefined,
          statusFilter || undefined,
          expiredFilter || undefined,
          expiringSoonFilter || undefined,
          activeExpirationFilter || undefined,
          hasExpirationDateFilter || undefined,
        );
        productsData = response.data;
        setTotalPages(response.meta.totalPages);
      }
      
      setProducts(productsData);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch {
      toast.error('Failed to load categories');
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      categoryId: categories[0]?.id || '',
      description: '',
      imageUrl: '',
      costPrice: 0,
      sellingPrice: 0,
      currentStock: 0,
      minimumStock: 0,
      unit: 'pcs',
      status: 'ACTIVE',
      expirationDate: undefined,
    });
    setShowModal(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId,
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      currentStock: product.currentStock,
      minimumStock: product.minimumStock,
      unit: product.unit,
      status: product.status,
      expirationDate: product.expirationDate ? product.expirationDate.split('T')[0] : undefined,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const { currentStock, ...updateData } = formData;
        await productsApi.update(editingProduct.id, updateData);
        toast.success('Product updated successfully');
      } else {
        await productsApi.create(formData);
        toast.success('Product created successfully');
      }
      setShowModal(false);
      loadProducts();
    } catch (error: unknown) {
      const message =
        (error as any)?.response?.data?.message || 'Operation failed';
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    const product = products.find(p => p.id === id);
    const productName = product?.name || 'this product';
    
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await productsApi.delete(id);
      toast.success(`Product "${productName}" deleted successfully`);
      loadProducts();
    } catch (error: unknown) {
      const message =
        (error as any)?.response?.data?.message || 
        (error as any)?.message || 
        'Failed to delete product. Please try again.';
      toast.error(message);
      console.error('Delete error:', error);
    }
  };

  const handleStockMovement = (product: Product) => {
    setSelectedProduct(product);
    setStockFormData({
      productId: product.id,
      quantity: 0,
      type: 'IN',
      reason: '',
    });
    setShowStockModal(true);
  };


  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await stockApi.createMovement(stockFormData);
      toast.success('Stock movement recorded successfully');
      setShowStockModal(false);
      loadProducts();
    } catch (error: unknown) {
      const message =
        (error as any)?.response?.data?.message || 'Stock movement failed';
      toast.error(message);
    }
  };

  const isLowStock = (product: Product) => {
    return product.currentStock <= product.minimumStock;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-4xl font-extrabold text-gradient mb-2">
            Products
          </h1>
          <p className="mt-1 text-blue-100/90 font-semibold text-lg">Manage your inventory products</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 px-6 py-3 text-sm font-bold text-blue-50 gradient-accent rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 glow-effect border border-blue-400/30"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Product</span>
          </button>
        )}
      </div>

      <div className="glass-effect rounded-2xl p-6 animate-slide-up border border-blue-400/40 shadow-2xl">
        {/* Show active filters */}
        {(lowStockFilter || outOfStockFilter || statusFilter || categoryFilter) && (
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm font-bold text-blue-200">Active Filters:</span>
            {categoryFilter && (
              <span className="px-3 py-1.5 bg-purple-500/30 text-purple-200 rounded-lg text-xs font-bold border border-purple-400/40">
                📁 {categories.find(c => c.id === categoryFilter)?.name || 'Category'}
              </span>
            )}
            {lowStockFilter && (
              <span className="px-3 py-1.5 bg-yellow-500/30 text-yellow-200 rounded-lg text-xs font-bold border border-yellow-400/40">
                ⚠️ Low Stock
              </span>
            )}
            {outOfStockFilter && (
              <span className="px-3 py-1.5 bg-red-500/30 text-red-200 rounded-lg text-xs font-bold border border-red-400/40">
                ❌ Out of Stock
              </span>
            )}
            {statusFilter && (
              <span className="px-3 py-1.5 bg-green-500/30 text-green-200 rounded-lg text-xs font-bold border border-green-400/40">
                ✓ {statusFilter}
              </span>
            )}
            <button
              onClick={() => {
                setLowStockFilter(false);
                setOutOfStockFilter(false);
                setStatusFilter('');
                setCategoryFilter('');
                setSearchParams({});
                setPage(1);
              }}
              className="px-3 py-1.5 bg-blue-600/30 text-blue-200 rounded-lg text-xs font-bold border border-blue-400/40 hover:bg-blue-600/50 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="px-4 py-3 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-xl text-blue-50 placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all text-sm font-medium"
          />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
              // Update URL params
              const newParams = new URLSearchParams(searchParams);
              if (e.target.value) {
                newParams.set('categoryId', e.target.value);
              } else {
                newParams.delete('categoryId');
              }
              setSearchParams(newParams);
            }}
            className="px-4 py-3 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all text-sm font-medium"
          >
            <option value="" className="bg-blue-900">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-blue-900">
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
              // Update URL params
              const newParams = new URLSearchParams(searchParams);
              if (e.target.value) {
                newParams.set('status', e.target.value);
              } else {
                newParams.delete('status');
              }
              setSearchParams(newParams);
            }}
            className="px-4 py-3 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all text-sm font-medium"
          >
            <option value="" className="bg-blue-900">All Status</option>
            <option value="ACTIVE" className="bg-blue-900">Active</option>
            <option value="INACTIVE" className="bg-blue-900">Inactive</option>
          </select>
          <select
            value={
              expiredFilter ? 'expired' :
              expiringSoonFilter ? 'expiring-soon' :
              activeExpirationFilter ? 'active-expiration' :
              hasExpirationDateFilter ? 'has-expiration' : ''
            }
            onChange={(e) => {
              const value = e.target.value;
              setPage(1);
              const newParams = new URLSearchParams(searchParams);
              
              // Clear all expiration filters first
              setExpiredFilter(false);
              setExpiringSoonFilter(false);
              setActiveExpirationFilter(false);
              setHasExpirationDateFilter(false);
              newParams.delete('expired');
              newParams.delete('expiringSoon');
              newParams.delete('activeExpiration');
              newParams.delete('hasExpirationDate');
              
              // Set selected filter
              if (value === 'expired') {
                setExpiredFilter(true);
                newParams.set('expired', 'true');
              } else if (value === 'expiring-soon') {
                setExpiringSoonFilter(true);
                newParams.set('expiringSoon', 'true');
              } else if (value === 'active-expiration') {
                setActiveExpirationFilter(true);
                newParams.set('activeExpiration', 'true');
              } else if (value === 'has-expiration') {
                setHasExpirationDateFilter(true);
                newParams.set('hasExpirationDate', 'true');
              }
              
              setSearchParams(newParams);
            }}
            className="px-4 py-3 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all text-sm font-medium"
          >
            <option value="" className="bg-blue-900">All Expiration</option>
            <option value="has-expiration" className="bg-blue-900">Has Expiration Date</option>
            <option value="expired" className="bg-blue-900">Expired</option>
            <option value="expiring-soon" className="bg-blue-900">Expiring Soon (30 days)</option>
            <option value="active-expiration" className="bg-blue-900">Active Expiration</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-400/20 border-t-blue-300 rounded-full animate-spin"></div>
            <div className="text-blue-100 font-bold">Loading products...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-accent flex items-center justify-center shadow-xl">
              <CubeIcon className="h-8 w-8 text-blue-50" />
            </div>
            <p className="text-blue-100 font-bold text-lg">No products found</p>
            <p className="text-sm text-blue-200/80 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-400/20">
                <thead className="bg-blue-600/20 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">
                      Expiration Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-blue-100 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-blue-600/10 divide-y divide-blue-400/10">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-blue-600/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/30 to-blue-600/20 border border-blue-400/40 flex items-center justify-center overflow-hidden shadow-lg flex-shrink-0">
                            {product.imageUrl ? (
                              <img 
                                src={product.imageUrl} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full flex items-center justify-center text-blue-50 font-bold text-lg ${product.imageUrl ? 'hidden' : ''}`}>
                              {product.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-blue-50">
                              {product.name}
                            </div>
                            {product.description && (
                              <div className="text-xs text-blue-200/70 mt-1">
                                {product.description.substring(0, 40)}...
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1.5 text-xs font-bold bg-blue-600/30 text-blue-100 rounded-lg border border-blue-400/40">
                          {product.sku}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1.5 text-xs font-bold gradient-secondary text-blue-50 rounded-lg shadow-lg">
                          {product.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-2">
                          <div className="text-sm font-bold text-blue-50">
                            {product.currentStock} {product.unit}
                          </div>
                          {isLowStock(product) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-blue-500/40 text-blue-200 border border-blue-400/40 w-fit">
                              ⚠️ Low Stock
                            </span>
                          )}
                          {product.lastMovement && (
                            <div className="mt-2 pt-2 border-t border-blue-400/20">
                              <div className="text-xs text-blue-200/70 space-y-0.5">
                                <div className="flex items-center gap-1">
                                  <span className="font-semibold">Last Entry:</span>
                                  <span className="text-blue-300">{product.lastMovement.userName}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span>{product.lastMovement.date}</span>
                                  <span className="text-blue-300/60">•</span>
                                  <span>{product.lastMovement.time}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    product.lastMovement.type === 'IN' 
                                      ? 'bg-green-500/30 text-green-200 border border-green-400/40'
                                      : product.lastMovement.type === 'OUT'
                                      ? 'bg-red-500/30 text-red-200 border border-red-400/40'
                                      : 'bg-yellow-500/30 text-yellow-200 border border-yellow-400/40'
                                  }`}>
                                    {product.lastMovement.type}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-blue-200">
                          ${product.sellingPrice.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.expirationDate ? (
                          <div className="flex flex-col">
                            <span className={`text-sm font-bold ${
                              new Date(product.expirationDate) < new Date()
                                ? 'text-red-400'
                                : new Date(product.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                ? 'text-yellow-400'
                                : 'text-green-400'
                            }`}>
                              {new Date(product.expirationDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <span className={`text-xs mt-0.5 ${
                              new Date(product.expirationDate) < new Date()
                                ? 'text-red-300/70'
                                : new Date(product.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                ? 'text-yellow-300/70'
                                : 'text-green-300/70'
                            }`}>
                              {new Date(product.expirationDate) < new Date()
                                ? 'Expired'
                                : new Date(product.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                ? 'Expiring Soon'
                                : 'Active'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-blue-300/50 italic">No expiration</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-lg ${
                            product.status === 'ACTIVE'
                              ? 'bg-blue-500/40 text-blue-200 border border-blue-400/40'
                              : 'bg-blue-700/40 text-blue-300 border border-blue-500/40'
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleStockMovement(product)}
                          className="px-3 py-1.5 text-xs font-bold text-blue-50 gradient-success rounded-lg hover:shadow-xl hover:scale-105 transition-all"
                          title="Stock Movement"
                        >
                          Stock
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-blue-200 hover:bg-blue-600/30 rounded-lg transition-all hover:scale-110 border border-blue-400/40"
                          title="Edit product"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-blue-300 hover:bg-blue-700/30 rounded-lg transition-all hover:scale-110 border border-blue-500/40"
                            title="Delete product"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-blue-400/30 pt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-5 py-2.5 text-sm font-bold text-blue-50 gradient-accent rounded-xl hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 glow-effect border border-blue-400/30"
                >
                  ← Previous
                </button>
                <span className="text-sm font-bold text-blue-100 px-4 py-2 bg-blue-600/30 rounded-lg border border-blue-400/40">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-5 py-2.5 text-sm font-bold text-blue-50 gradient-accent rounded-xl hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 glow-effect border border-blue-400/30"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="glass-effect rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up border border-blue-400/40 relative">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 text-blue-200 hover:bg-blue-600/30 rounded-xl transition-all hover:scale-110 border border-blue-400/40"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="mb-8">
              <h2 className="text-4xl font-extrabold text-gradient mb-2">
                {editingProduct ? '✏️ Edit Product' : '✨ Create Product'}
              </h2>
              <p className="text-sm text-blue-100/80 font-medium">
                {editingProduct ? 'Update product information' : 'Add a new product to your inventory'}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-blue-100 mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3.5 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-xl text-blue-50 placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all text-sm font-medium hover:border-blue-400/70"
                    placeholder="Enter product name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-blue-100 mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    className="w-full px-4 py-3.5 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-xl text-blue-50 placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all text-sm font-medium hover:border-blue-400/70"
                    placeholder="Enter SKU"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-blue-100 mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    Category *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    className="w-full px-4 py-3.5 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all text-sm font-medium hover:border-blue-400/70"
                  >
                    <option value="" className="bg-blue-900">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-blue-900">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-blue-100 mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    Unit
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="w-full px-4 py-3.5 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-xl text-blue-50 placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all text-sm font-medium hover:border-blue-400/70"
                    placeholder="pcs, kg, etc."
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-blue-100 mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    Cost Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.costPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        costPrice: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3.5 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-xl text-blue-50 placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all text-sm font-medium hover:border-blue-400/70"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-blue-100 mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sellingPrice: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3.5 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-xl text-blue-50 placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all text-sm font-medium hover:border-blue-400/70"
                    placeholder="0.00"
                  />
                </div>
                {!editingProduct && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-blue-100 mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        Initial Stock *
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.currentStock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            currentStock: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-3.5 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-xl text-blue-50 placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all text-sm font-medium hover:border-blue-400/70"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-blue-100 mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        Minimum Stock *
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.minimumStock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minimumStock: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-3.5 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-xl text-blue-50 placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all text-sm font-medium hover:border-blue-400/70"
                        placeholder="0"
                      />
                    </div>
                  </>
                )}
                {editingProduct && (
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-blue-100 mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      Minimum Stock *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.minimumStock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minimumStock: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3.5 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-xl text-blue-50 placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all text-sm font-medium hover:border-blue-400/70"
                      placeholder="0"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-blue-100 mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'ACTIVE' | 'INACTIVE',
                      })
                    }
                    className="w-full px-4 py-3.5 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all text-sm font-medium hover:border-blue-400/70"
                  >
                    <option value="ACTIVE" className="bg-blue-900">Active</option>
                    <option value="INACTIVE" className="bg-blue-900">Inactive</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-blue-100 mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expirationDate || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expirationDate: e.target.value || undefined,
                      })
                    }
                    className="w-full px-4 py-3.5 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-xl text-blue-50 placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all text-sm font-medium hover:border-blue-400/70"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-blue-100 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3.5 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-xl text-blue-50 placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all text-sm font-medium resize-none hover:border-blue-400/70"
                  placeholder="Enter product description (optional)"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-blue-100 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Product Image URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  className="w-full px-4 py-3.5 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-xl text-blue-50 placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all text-sm font-medium hover:border-blue-400/70"
                  placeholder="Enter product image URL (optional)"
                />
                {formData.imageUrl && (
                  <div className="mt-3 p-3 bg-blue-600/20 rounded-xl border border-blue-400/30 inline-block">
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className="w-24 h-24 rounded-lg object-cover border-2 border-blue-400/40 shadow-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-4 pt-6 border-t border-blue-400/30 mt-8">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-sm font-bold text-blue-50 bg-blue-600/30 border-2 border-blue-400/40 rounded-xl hover:bg-blue-600/40 hover:border-blue-400/60 transition-all duration-200 hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 text-sm font-bold text-blue-50 gradient-accent rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200 glow-effect border border-blue-400/30 flex items-center gap-2"
                >
                  {editingProduct ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Update Product
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Movement Modal */}
      {showStockModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="glass-effect rounded-3xl p-8 max-w-md w-full shadow-2xl animate-slide-up border border-blue-400/40">
            <div className="mb-6">
              <h2 className="text-3xl font-extrabold text-gradient">Stock Movement</h2>
              <p className="text-sm text-blue-100/90 mt-2 font-medium">
                Product: <span className="font-bold">{selectedProduct.name}</span> (Current: {selectedProduct.currentStock} {selectedProduct.unit})
              </p>
            </div>
            <form onSubmit={handleStockSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-blue-100 mb-2">
                  Type *
                </label>
                <select
                  required
                  value={stockFormData.type}
                  onChange={(e) =>
                    setStockFormData({
                      ...stockFormData,
                      type: e.target.value as 'IN' | 'OUT' | 'ADJUSTMENT',
                    })
                  }
                  className="mt-1 block w-full px-4 py-3 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all text-sm font-medium"
                >
                  <option value="IN" className="bg-blue-900">Stock In</option>
                  <option value="OUT" className="bg-blue-900">Stock Out</option>
                  <option value="ADJUSTMENT" className="bg-blue-900">Adjustment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-100 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={stockFormData.quantity}
                  onChange={(e) =>
                    setStockFormData({
                      ...stockFormData,
                      quantity: parseFloat(e.target.value),
                    })
                  }
                  className="mt-1 block w-full px-4 py-3 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-xl text-blue-50 placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all text-sm font-medium"
                  placeholder="Enter quantity"
                />
                {stockFormData.type === 'ADJUSTMENT' && (
                  <p className="mt-2 text-xs text-blue-200/80 font-medium">
                    💡 Enter the target stock quantity
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-100 mb-2">
                  Reason *
                </label>
                <textarea
                  required
                  value={stockFormData.reason}
                  onChange={(e) =>
                    setStockFormData({
                      ...stockFormData,
                      reason: e.target.value,
                    })
                  }
                  rows={3}
                  className="mt-1 block w-full px-4 py-3 bg-blue-600/30 backdrop-blur-sm border-2 border-blue-400/50 rounded-xl text-blue-50 placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-300/60 transition-all text-sm font-medium"
                  placeholder="e.g., Purchase order, Sale, Inventory correction..."
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-blue-400/30">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="px-5 py-2.5 text-sm font-bold text-blue-50 bg-blue-600/30 border border-blue-400/40 rounded-xl hover:bg-blue-600/40 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-bold text-blue-50 gradient-success rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200 glow-effect border border-blue-400/30"
                >
                  Record Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
