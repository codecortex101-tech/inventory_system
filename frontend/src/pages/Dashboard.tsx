import { useEffect, useState, useMemo } from 'react';
import { reportsApi } from '../api/reports';
import type { StockSummary } from '../api/reports';
import { categoriesApi } from '../api/categories';
import type { Category } from '../api/categories';
import { productsApi } from '../api/products';
import {
  CubeIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  FolderIcon,
  TagIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const [summary, setSummary] = useState<StockSummary | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expirationStats, setExpirationStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        summaryData, 
        categoriesData, 
        expirationData,
      ] = await Promise.all([
        reportsApi.getStockSummary().catch(() => ({
          totalProducts: 0,
          activeProducts: 0,
          totalStockItems: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
        })),
        categoriesApi.getAll().catch(() => []),
        productsApi.getExpirationStats().catch(() => ({
          total: 0,
          expired: 0,
          expiringSoon: 0,
          active: 0,
        })),
      ]);
      
      setSummary(summaryData);
      setCategories(categoriesData);
      setExpirationStats(expirationData || {
        total: 0,
        expired: 0,
        expiringSoon: 0,
        active: 0,
      });
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
      // Set defaults on error
      setExpirationStats({
        total: 0,
        expired: 0,
        expiringSoon: 0,
        active: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProductCardClick = (filterType: string) => {
    // Navigate to products page with appropriate filter
    if (filterType === 'all') {
      navigate('/products');
    } else if (filterType === 'active') {
      navigate('/products?status=ACTIVE');
    } else if (filterType === 'low-stock') {
      navigate('/products?lowStock=true');
    } else if (filterType === 'out-of-stock') {
      navigate('/products?outOfStock=true');
    }
  };

  const handleCategoryCardClick = (filterType: string, categoryId?: string) => {
    // Navigate to categories page with appropriate filter
    if (filterType === 'all') {
      if (categoryId) {
        // If categoryId provided, navigate to products filtered by that category
        navigate(`/products?categoryId=${categoryId}`);
      } else {
        navigate('/categories');
      }
    } else if (filterType === 'with-products') {
      navigate('/categories?hasProducts=true');
    } else if (filterType === 'empty') {
      navigate('/categories?hasProducts=false');
    }
  };

  const handleExpirationCardClick = (filterType: string) => {
    // Navigate to products page with expiration filter
    if (filterType === 'expired') {
      navigate('/products?expired=true');
    } else if (filterType === 'expiring-soon') {
      navigate('/products?expiringSoon=true');
    } else if (filterType === 'active-expiration') {
      navigate('/products?activeExpiration=true');
    } else if (filterType === 'with-expiration') {
      navigate('/products?hasExpirationDate=true');
    }
  };

  // Calculate category statistics
  const categoriesWithProducts = useMemo(() => {
    return categories.filter(
      (cat) => (cat._count?.products || 0) > 0
    );
  }, [categories]);

  // Find category with most products
  const categoryWithMostProducts = useMemo(() => {
    return categories.reduce((max, cat) => {
      const productCount = cat._count?.products || 0;
      const maxCount = max._count?.products || 0;
      return productCount > maxCount ? cat : max;
    }, categories[0] || { name: 'N/A', _count: { products: 0 } });
  }, [categories]);

  const mostProductsCount = categoryWithMostProducts?._count?.products || 0;

  // Category stats for cards
  const categoryStats = [
    {
      label: 'TOTAL CATEGORIES',
      value: categories.length,
      icon: FolderIcon,
      color: 'bg-purple-500',
      onClick: () => handleCategoryCardClick('all'),
      filterType: 'all',
    },
    {
      label: 'ACTIVE CATEGORIES',
      value: categoriesWithProducts.length,
      icon: TagIcon,
      color: 'bg-green-500',
      onClick: () => handleCategoryCardClick('with-products'),
      filterType: 'with-products',
    },
    {
      label: 'MOST PRODUCTS',
      value: mostProductsCount,
      subtitle: categoryWithMostProducts?.name || 'N/A',
      icon: CheckCircleIcon,
      color: 'bg-indigo-500',
      onClick: () => handleCategoryCardClick('all', categoryWithMostProducts?.id),
      filterType: 'all',
      categoryId: categoryWithMostProducts?.id,
    },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-400/20 border-t-blue-300 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="glass-effect rounded-2xl p-6 animate-slide-up border border-blue-400/40 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-gradient mb-2">Summary</h2>
          <p className="text-sm text-blue-100/80 font-medium">Click on any card to view filtered products</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Products */}
          <div
            onClick={() => handleProductCardClick('all')}
            className="glass-effect overflow-hidden rounded-2xl card-hover animate-slide-up border border-blue-400/40 shadow-2xl cursor-pointer transform hover:scale-105 transition-all duration-300"
          >
            <div className="p-6 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-extrabold text-blue-200/90 mb-2 uppercase tracking-wider drop-shadow-md">
                  TOTAL PRODUCTS
                </p>
                <p className="text-4xl font-black text-blue-50 drop-shadow-lg">
                  {summary?.totalProducts ?? 0}
                </p>
              </div>
              <div className="bg-blue-500 rounded-2xl p-5 shadow-2xl transform hover:scale-110 transition-all duration-300 glow-effect flex items-center justify-center border-2 border-white/30 backdrop-blur-sm">
                <CubeIcon className="h-10 w-10 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Active Products */}
          <div
            onClick={() => handleProductCardClick('active')}
            className="glass-effect overflow-hidden rounded-2xl card-hover animate-slide-up border border-blue-400/40 shadow-2xl cursor-pointer transform hover:scale-105 transition-all duration-300"
          >
            <div className="p-6 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-extrabold text-green-200/90 mb-2 uppercase tracking-wider drop-shadow-md">
                  ACTIVE PRODUCTS
                </p>
                <p className="text-4xl font-black text-green-50 drop-shadow-lg">
                  {summary?.activeProducts ?? 0}
                </p>
              </div>
              <div className="bg-green-500 rounded-2xl p-5 shadow-2xl transform hover:scale-110 transition-all duration-300 glow-effect flex items-center justify-center border-2 border-white/30 backdrop-blur-sm">
                <CheckCircleIcon className="h-10 w-10 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Low Stock */}
          <div
            onClick={() => handleProductCardClick('low-stock')}
            className="glass-effect overflow-hidden rounded-2xl card-hover animate-slide-up border border-yellow-400/40 shadow-2xl cursor-pointer transform hover:scale-105 transition-all duration-300"
          >
            <div className="p-6 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-extrabold text-yellow-200/90 mb-2 uppercase tracking-wider drop-shadow-md">
                  LOW STOCK
                </p>
                <p className="text-4xl font-black text-yellow-50 drop-shadow-lg">
                  {summary?.lowStockCount ?? 0}
                </p>
              </div>
              <div className="bg-yellow-500 rounded-2xl p-5 shadow-2xl transform hover:scale-110 transition-all duration-300 glow-effect flex items-center justify-center border-2 border-white/30 backdrop-blur-sm">
                <ExclamationTriangleIcon className="h-10 w-10 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Out of Stock */}
          <div
            onClick={() => handleProductCardClick('out-of-stock')}
            className="glass-effect overflow-hidden rounded-2xl card-hover animate-slide-up border border-red-400/40 shadow-2xl cursor-pointer transform hover:scale-105 transition-all duration-300"
          >
            <div className="p-6 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-extrabold text-red-200/90 mb-2 uppercase tracking-wider drop-shadow-md">
                  OUT OF STOCK
                </p>
                <p className="text-4xl font-black text-red-50 drop-shadow-lg">
                  {summary?.outOfStockCount ?? 0}
                </p>
              </div>
              <div className="bg-red-500 rounded-2xl p-5 shadow-2xl transform hover:scale-110 transition-all duration-300 glow-effect flex items-center justify-center border-2 border-white/30 backdrop-blur-sm">
                <XCircleIcon className="h-10 w-10 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Summary */}
      <div className="glass-effect rounded-2xl p-6 animate-slide-up border border-blue-400/40 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-gradient mb-2 flex items-center gap-3">
            <FolderIcon className="h-7 w-7 text-blue-300" />
            Categories
          </h2>
          <p className="text-sm text-blue-100/80 font-medium">Click on any card to view filtered categories</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryStats.map((stat, index) => (
            <div
              key={index}
              onClick={() => stat.onClick()}
              className="glass-effect overflow-hidden rounded-2xl card-hover animate-slide-up border border-blue-400/40 shadow-2xl cursor-pointer transform hover:scale-105 transition-all duration-300"
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-extrabold text-blue-200/90 mb-2 uppercase tracking-wider drop-shadow-md">
                    {stat.label}
                  </p>
                  <p className="text-4xl font-black text-blue-50 drop-shadow-lg">
                    {stat.value}
                  </p>
                  {stat.subtitle && (
                    <p className="text-sm text-blue-200/70 mt-1">{stat.subtitle}</p>
                  )}
                </div>
                <div className={`${stat.color} rounded-2xl p-5 shadow-2xl transform hover:scale-110 transition-all duration-300 glow-effect flex items-center justify-center border-2 border-white/30 backdrop-blur-sm`}>
                  <stat.icon className="h-10 w-10 text-white" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Expiration Tracking Section */}
      <div className="glass-effect rounded-2xl p-6 animate-slide-up border border-blue-400/40 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-gradient mb-2 flex items-center gap-3">
            <CalendarDaysIcon className="h-7 w-7 text-blue-300" />
            Product Expiration Tracking
          </h2>
          <p className="text-sm text-blue-100/80 font-medium">Click on any card to view products with expiration dates</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total with Expiration */}
          <div
            onClick={() => handleExpirationCardClick('with-expiration')}
            className="glass-effect overflow-hidden rounded-2xl card-hover animate-slide-up border border-purple-400/40 shadow-2xl cursor-pointer transform hover:scale-105 transition-all duration-300"
          >
            <div className="p-6 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-extrabold text-purple-200/90 mb-2 uppercase tracking-wider drop-shadow-md">
                  TOTAL WITH EXPIRATION
                </p>
                <p className="text-4xl font-black text-purple-50 drop-shadow-lg">
                  {expirationStats?.total ?? 0}
                </p>
                <p className="text-xs text-purple-300/60 mt-1">Products with dates</p>
              </div>
              <div className="bg-purple-500 rounded-2xl p-5 shadow-2xl transform hover:scale-110 transition-all duration-300 glow-effect flex items-center justify-center border-2 border-white/30 backdrop-blur-sm">
                <CalendarDaysIcon className="h-10 w-10 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Expired Products */}
          <div
            onClick={() => handleExpirationCardClick('expired')}
            className="glass-effect overflow-hidden rounded-2xl card-hover animate-slide-up border border-red-400/40 shadow-2xl cursor-pointer transform hover:scale-105 transition-all duration-300"
          >
            <div className="p-6 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-extrabold text-red-200/90 mb-2 uppercase tracking-wider drop-shadow-md">
                  EXPIRED PRODUCTS
                </p>
                <p className="text-4xl font-black text-red-50 drop-shadow-lg">
                  {expirationStats?.expired ?? 0}
                </p>
                <p className="text-xs text-red-300/60 mt-1">Already expired</p>
              </div>
              <div className="bg-red-500 rounded-2xl p-5 shadow-2xl transform hover:scale-110 transition-all duration-300 glow-effect flex items-center justify-center border-2 border-white/30 backdrop-blur-sm">
                <XCircleIcon className="h-10 w-10 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Expiring Soon */}
          <div
            onClick={() => handleExpirationCardClick('expiring-soon')}
            className="glass-effect overflow-hidden rounded-2xl card-hover animate-slide-up border border-yellow-400/40 shadow-2xl cursor-pointer transform hover:scale-105 transition-all duration-300"
          >
            <div className="p-6 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-extrabold text-yellow-200/90 mb-2 uppercase tracking-wider drop-shadow-md">
                  EXPIRING SOON
                </p>
                <p className="text-4xl font-black text-yellow-50 drop-shadow-lg">
                  {expirationStats?.expiringSoon ?? 0}
                </p>
                <p className="text-xs text-yellow-300/60 mt-1">Within 30 days</p>
              </div>
              <div className="bg-yellow-500 rounded-2xl p-5 shadow-2xl transform hover:scale-110 transition-all duration-300 glow-effect flex items-center justify-center border-2 border-white/30 backdrop-blur-sm">
                <ExclamationTriangleIcon className="h-10 w-10 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Active Expiration */}
          <div
            onClick={() => handleExpirationCardClick('active-expiration')}
            className="glass-effect overflow-hidden rounded-2xl card-hover animate-slide-up border border-green-400/40 shadow-2xl cursor-pointer transform hover:scale-105 transition-all duration-300"
          >
            <div className="p-6 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-extrabold text-green-200/90 mb-2 uppercase tracking-wider drop-shadow-md">
                  ACTIVE EXPIRATION
                </p>
                <p className="text-4xl font-black text-green-50 drop-shadow-lg">
                  {expirationStats?.active ?? 0}
                </p>
                <p className="text-xs text-green-300/60 mt-1">More than 30 days</p>
              </div>
              <div className="bg-green-500 rounded-2xl p-5 shadow-2xl transform hover:scale-110 transition-all duration-300 glow-effect flex items-center justify-center border-2 border-white/30 backdrop-blur-sm">
                <CheckCircleIcon className="h-10 w-10 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
