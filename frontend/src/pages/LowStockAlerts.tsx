import { useEffect, useState } from 'react';
import { productsApi } from '../api/products';
import type { Product } from '../api/products';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export const LowStockAlerts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLowStock();
  }, []);

  const loadLowStock = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getLowStock();
      setProducts(data);
    } catch {
      toast.error('Failed to load low stock alerts');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.currentStock === 0) {
      return {
        label: 'Out of Stock',
        color: 'bg-blue-700/40 text-blue-300',
      };
    } else if (product.currentStock < product.minimumStock) {
      return {
        label: 'Low Stock',
        color: 'bg-blue-600/40 text-blue-200',
      };
    }
    return {
      label: 'At Minimum',
      color: 'bg-blue-500/40 text-blue-200',
    };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-slide-up">
        <h1 className="text-4xl font-extrabold text-gradient mb-2">
          Low Stock Alerts
        </h1>
        <p className="mt-1 text-white/90 font-semibold text-lg">
          Products that need restocking attention
        </p>
      </div>

      <div className="glass-effect rounded-2xl overflow-hidden animate-slide-up border border-blue-400/40 shadow-2xl">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-400/20 border-t-blue-300 rounded-full animate-spin"></div>
            <div className="text-blue-100 font-bold">Loading alerts...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-success flex items-center justify-center shadow-xl">
              <ExclamationTriangleIcon className="h-8 w-8 text-blue-50" />
            </div>
            <h3 className="mt-2 text-lg font-bold text-blue-100">
              No Low Stock Items
            </h3>
            <p className="mt-1 text-sm text-blue-200/80">
              All products are above their minimum stock levels! 🎉
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-400/20">
              <thead className="bg-blue-600/20 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    Minimum Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-blue-600/10 divide-y divide-blue-400/10">
                {products.map((product) => {
                  const status = getStockStatus(product);
                  const isLowStock = product.currentStock <= product.minimumStock;
                  return (
                    <tr 
                      key={product.id} 
                      className={`hover:bg-blue-600/20 transition-colors blink-border ${
                        isLowStock ? 'border-l-4 border-yellow-500' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/30 to-blue-600/20 border border-blue-400/40 flex items-center justify-center overflow-hidden shadow-lg">
                            {product.imageUrl ? (
                              <img 
                                src={product.imageUrl} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full flex items-center justify-center text-blue-50 font-bold text-lg ${product.imageUrl ? 'hidden' : ''}`}>
                              {product.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="text-sm font-bold text-blue-50">
                            {product.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-blue-50 bg-blue-600/30 px-3 py-1.5 rounded-lg border border-blue-400/40">
                          {product.sku}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-blue-50 gradient-secondary px-3 py-1.5 rounded-lg shadow-lg">
                          {product.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-bold blink-reminder ${
                          isLowStock ? 'text-yellow-400' : 'text-blue-200'
                        }`}>
                          {product.currentStock} {product.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-blue-200/80 font-medium">
                          {product.minimumStock} {product.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-lg ${
                            status.label === 'Out of Stock'
                              ? 'bg-blue-700/40 text-blue-300 border border-blue-500/40 blink-border'
                              : status.label === 'Low Stock'
                              ? 'bg-yellow-500/40 text-yellow-200 border border-yellow-400/60 blink-border'
                              : 'bg-blue-500/40 text-blue-200 border border-blue-400/40'
                          }`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/products?productId=${product.id}`}
                          className="text-blue-200 hover:text-blue-100 hover:underline font-bold"
                        >
                          View Product →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
