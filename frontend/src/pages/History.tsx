import { useEffect, useState, useMemo } from 'react';
import { auditLogsApi } from '../api/audit-logs';
import type { AuditLog } from '../api/audit-logs';
import { stockApi } from '../api/stock';
import type { StockMovement } from '../api/stock';
import { exportsApi } from '../api/exports';
import toast from 'react-hot-toast';
import {
  ArrowPathIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CalendarIcon,
  ChartBarIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type HistoryTab = 'all' | 'products' | 'categories' | 'stock' | 'users' | 'activities';

const actionColors: Record<string, string> = {
  CREATE: 'bg-emerald-500/40 text-emerald-200 border border-emerald-400/40',
  UPDATE: 'bg-blue-500/40 text-blue-200 border border-blue-400/40',
  DELETE: 'bg-red-500/40 text-red-200 border border-red-400/40',
  LOGIN: 'bg-green-500/40 text-green-200 border border-green-400/40',
  LOGOUT: 'bg-gray-500/40 text-gray-200 border border-gray-400/40',
  STOCK_MOVEMENT: 'bg-purple-500/40 text-purple-200 border border-purple-400/40',
  STATUS_CHANGE: 'bg-amber-500/40 text-amber-200 border border-amber-400/40',
  IN: 'bg-emerald-500/40 text-emerald-200 border border-emerald-400/40',
  OUT: 'bg-red-500/40 text-red-200 border border-red-400/40',
  ADJUSTMENT: 'bg-amber-500/40 text-amber-200 border border-amber-400/40',
};

export const History = () => {
  const [activeTab, setActiveTab] = useState<HistoryTab>('all');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'user' | 'action' | 'entity' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'charts'>('table');
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    type: '',
    startDate: '',
    endDate: '',
    timeRange: '',
  });

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page, pageSize, filters.action, filters.entityType, filters.type, filters.startDate, filters.endDate]);

  // Apply time range filters
  useEffect(() => {
    if (filters.timeRange) {
      const now = new Date();
      let startDate = '';
      const endDate = now.toISOString().split('T')[0];

      switch (filters.timeRange) {
        case 'today':
          startDate = now.toISOString().split('T')[0];
          break;
        case 'week':
          { const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          startDate = weekAgo.toISOString().split('T')[0];
          break; }
        case 'month':
          { const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          startDate = monthAgo.toISOString().split('T')[0];
          break; }
        case 'last7':
          const last7 = new Date(now);
          last7.setDate(last7.getDate() - 7);
          startDate = last7.toISOString().split('T')[0];
          break;
        case 'last30':
          const last30 = new Date(now);
          last30.setDate(last30.getDate() - 30);
          startDate = last30.toISOString().split('T')[0];
          break;
        default:
          return;
      }

      setFilters((prev) => ({
        ...prev,
        startDate,
        endDate,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.timeRange]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'stock') {
        const response = await stockApi.getMovementsHistory(
          page,
          pageSize,
          undefined,
          filters.type || undefined,
          filters.startDate || undefined,
          filters.endDate || undefined,
        );
        setStockMovements(response.data);
        setTotalPages(response.meta.totalPages);
        setTotalItems(response.meta.total);
        setAuditLogs([]);
      } else {
        const entityType = activeTab === 'all' ? undefined : 
                          activeTab === 'products' ? 'Product' :
                          activeTab === 'categories' ? 'Category' :
                          activeTab === 'users' ? 'User' : 
                          activeTab === 'activities' ? undefined : undefined;
        
        const response = await auditLogsApi.getHistory(
          page,
          pageSize,
          entityType,
          filters.action || undefined,
        );
        setAuditLogs(response.data);
        setTotalPages(response.meta.totalPages);
        setTotalItems(response.meta.total);
        setStockMovements([]);
      }
    } catch (error: any) {
      console.error('Failed to load history:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load history';
      toast.error(errorMessage);
      setAuditLogs([]);
      setStockMovements([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // Filter data by search query
  const filteredAuditLogs = useMemo(() => {
    if (!searchQuery.trim()) return auditLogs;
    const query = searchQuery.toLowerCase();
    return auditLogs.filter((log) => 
      log.description.toLowerCase().includes(query) ||
      log.entityType.toLowerCase().includes(query) ||
      log.user.name.toLowerCase().includes(query) ||
      log.user.email.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query) ||
      (log.oldValue && log.oldValue.toLowerCase().includes(query)) ||
      (log.newValue && log.newValue.toLowerCase().includes(query))
    );
  }, [auditLogs, searchQuery]);

  const filteredStockMovements = useMemo(() => {
    if (!searchQuery.trim()) return stockMovements;
    const query = searchQuery.toLowerCase();
    return stockMovements.filter((movement) =>
      movement.product.name.toLowerCase().includes(query) ||
      movement.product.sku.toLowerCase().includes(query) ||
      movement.product.category?.name.toLowerCase().includes(query) ||
      movement.reason.toLowerCase().includes(query) ||
      movement.user.name.toLowerCase().includes(query) ||
      movement.user.email.toLowerCase().includes(query) ||
      movement.type.toLowerCase().includes(query)
    );
  }, [stockMovements, searchQuery]);

  const exportToCSV = async () => {
    try {
      setExporting(true);
      toast.loading('Exporting history...', { id: 'export' });

      let blob: Blob;
      let filename: string;

      if (activeTab === 'stock') {
        blob = await exportsApi.exportStockHistory(
          filters.type || undefined,
          filters.startDate || undefined,
          filters.endDate || undefined,
        );
        filename = `stock-history-${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        const entityType = activeTab === 'all' ? undefined : 
                          activeTab === 'products' ? 'Product' :
                          activeTab === 'categories' ? 'Category' :
                          activeTab === 'users' ? 'User' : undefined;
        
        blob = await exportsApi.exportHistory(
          entityType,
          filters.action || undefined,
          filters.startDate || undefined,
          filters.endDate || undefined,
        );
        filename = `history-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('History exported successfully!', { id: 'export' });
    } catch (error: any) {
      console.error('Export failed:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to export history', { id: 'export' });
    } finally {
      setExporting(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      entityType: '',
      type: '',
      startDate: '',
      endDate: '',
      timeRange: '',
    });
    setSearchQuery('');
    setPage(1);
  };

  const handleSort = (field: 'date' | 'user' | 'action' | 'entity' | 'type') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const tabs = [
    { id: 'all' as HistoryTab, name: '📊 All History', icon: '📊' },
    { id: 'products' as HistoryTab, name: '📦 Products', icon: '📦' },
    { id: 'categories' as HistoryTab, name: '📁 Categories', icon: '📁' },
    { id: 'stock' as HistoryTab, name: '📈 Stock Movements', icon: '📈' },
    { id: 'users' as HistoryTab, name: '👥 Users', icon: '👥' },
    { id: 'activities' as HistoryTab, name: '🔔 Activities', icon: '🔔' },
  ];

  const displayData = activeTab === 'stock' ? filteredStockMovements : filteredAuditLogs;
  const hasFilters = filters.action || filters.type || filters.startDate || filters.endDate || filters.timeRange || searchQuery;

  // Calculate statistics
  const stats = useMemo(() => {
    if (activeTab === 'stock' && stockMovements.length > 0) {
      return {
        total: stockMovements.length,
        in: stockMovements.filter((m) => m.type === 'IN').length,
        out: stockMovements.filter((m) => m.type === 'OUT').length,
        adjustment: stockMovements.filter((m) => m.type === 'ADJUSTMENT').length,
        totalQuantity: stockMovements.reduce((sum, m) => sum + (m.type === 'IN' ? m.quantity : m.type === 'OUT' ? -m.quantity : 0), 0),
      };
    } else if (auditLogs.length > 0) {
      return {
        total: auditLogs.length,
        create: auditLogs.filter((l) => l.action === 'CREATE').length,
        update: auditLogs.filter((l) => l.action === 'UPDATE').length,
        delete: auditLogs.filter((l) => l.action === 'DELETE').length,
        login: auditLogs.filter((l) => l.action === 'LOGIN').length,
        statusChange: auditLogs.filter((l) => l.action === 'STATUS_CHANGE').length,
        stockMovement: auditLogs.filter((l) => l.action === 'STOCK_MOVEMENT').length,
      };
    }
    return null;
  }, [activeTab, stockMovements, auditLogs]);

  // Chart data processing - Beautiful vibrant colors matching theme
  const chartColors = {
    CREATE: '#10b981', // Emerald Green - vibrant
    UPDATE: '#42a5f5', // Bright Cyan Blue - vibrant
    DELETE: '#ef4444', // Red - vibrant
    LOGIN: '#22c55e', // Green - vibrant
    LOGOUT: '#64748b', // Slate Gray
    STATUS_CHANGE: '#f59e0b', // Amber - vibrant
    STOCK_MOVEMENT: '#8b5cf6', // Purple - vibrant
    IN: '#10b981', // Emerald Green - vibrant
    OUT: '#ef4444', // Red - vibrant
    ADJUSTMENT: '#f59e0b', // Amber - vibrant
  };


  // Activity timeline chart data (daily aggregation)
  const timelineChartData = useMemo(() => {
    const dataMap: Map<string, { date: string; dateObj: Date; [key: string]: string | number | Date }> = new Map();
    // Use filtered data for charts if search query exists, otherwise use all data
    const allData = activeTab === 'stock' 
      ? (searchQuery ? filteredStockMovements : stockMovements)
      : (searchQuery ? filteredAuditLogs : auditLogs);

    allData.forEach((item) => {
      const dateObj = new Date(item.createdAt);
      const dateKey = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format for consistent sorting
      const dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, { date: dateLabel, dateObj });
      }
      
      const data = dataMap.get(dateKey)!;

      if (activeTab === 'stock') {
        const movement = item as StockMovement;
        data[movement.type] = ((data[movement.type] as number) || 0) + 1;
        data.total = ((data.total as number) || 0) + 1;
      } else {
        const log = item as AuditLog;
        data[log.action] = ((data[log.action] as number) || 0) + 1;
        data.total = ((data.total as number) || 0) + 1;
      }
    });

    return Array.from(dataMap.values())
      .sort((a, b) => (a.dateObj as Date).getTime() - (b.dateObj as Date).getTime())
      .map(({ dateObj, ...rest }) => rest); // Remove dateObj from final data
  }, [activeTab, stockMovements, auditLogs, searchQuery, filteredStockMovements, filteredAuditLogs]);

  // Actions distribution chart data
  const actionsDistributionData = useMemo(() => {
    const stockData = searchQuery ? filteredStockMovements : stockMovements;
    const auditData = searchQuery ? filteredAuditLogs : auditLogs;
    
    if (activeTab === 'stock' && stockData.length > 0) {
      return [
        { name: 'Stock In', value: stockData.filter((m) => m.type === 'IN').length, color: chartColors.IN },
        { name: 'Stock Out', value: stockData.filter((m) => m.type === 'OUT').length, color: chartColors.OUT },
        { name: 'Adjustment', value: stockData.filter((m) => m.type === 'ADJUSTMENT').length, color: chartColors.ADJUSTMENT },
      ].filter((item) => item.value > 0);
    } else if (auditData.length > 0) {
      const actionCounts: Record<string, number> = {};
      auditData.forEach((log) => {
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      });

      return Object.entries(actionCounts).map(([action, value]) => ({
        name: action.replace('_', ' '),
        value,
        color: chartColors[action as keyof typeof chartColors] || '#6366f1',
      }));
    }
    return [];
  }, [activeTab, stockMovements, auditLogs, searchQuery, filteredStockMovements, filteredAuditLogs]);

  // Entity types distribution
  const entityTypesData = useMemo(() => {
    const auditData = searchQuery ? filteredAuditLogs : auditLogs;
    if (activeTab === 'stock' || auditData.length === 0) return [];

    const entityCounts: Record<string, number> = {};
    auditData.forEach((log) => {
      entityCounts[log.entityType] = (entityCounts[log.entityType] || 0) + 1;
    });

    const beautifulEntityColors = ['#42a5f5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
    return Object.entries(entityCounts).map(([name, value], index) => ({
      name,
      value,
      color: beautifulEntityColors[index % beautifulEntityColors.length],
    }));
  }, [activeTab, auditLogs, searchQuery, filteredAuditLogs]);

  // User activity chart data
  const userActivityData = useMemo(() => {
    const userCounts: Record<string, number> = {};
    const allData = activeTab === 'stock' 
      ? (searchQuery ? filteredStockMovements : stockMovements)
      : (searchQuery ? filteredAuditLogs : auditLogs);

    allData.forEach((item) => {
      const userName = item.user.name;
      userCounts[userName] = (userCounts[userName] || 0) + 1;
    });

    return Object.entries(userCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [activeTab, stockMovements, auditLogs, searchQuery, filteredStockMovements, filteredAuditLogs]);

  // Stock movements quantity chart
  const stockQuantityData = useMemo(() => {
    const stockData = searchQuery ? filteredStockMovements : stockMovements;
    if (activeTab !== 'stock' || stockData.length === 0) return [];

    const dataMap: Map<string, { date: string; dateObj: Date; in: number; out: number; adjustment: number }> = new Map();
    
    stockData.forEach((movement) => {
      const dateObj = new Date(movement.createdAt);
      const dateKey = dateObj.toISOString().split('T')[0];
      const dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, { date: dateLabel, dateObj, in: 0, out: 0, adjustment: 0 });
      }
      
      const dailyData = dataMap.get(dateKey)!;

      if (movement.type === 'IN') {
        dailyData.in += Math.abs(movement.quantity);
      } else if (movement.type === 'OUT') {
        dailyData.out += Math.abs(movement.quantity);
      } else {
        dailyData.adjustment += Math.abs(movement.quantity);
      }
    });

    return Array.from(dataMap.values())
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
      .map(({ dateObj, ...rest }) => rest);
  }, [activeTab, stockMovements, searchQuery, filteredStockMovements]);

  // Hourly activity distribution
  const hourlyActivityData = useMemo(() => {
    const hourlyCounts: Record<number, number> = {};
    const allData = activeTab === 'stock' 
      ? (searchQuery ? filteredStockMovements : stockMovements)
      : (searchQuery ? filteredAuditLogs : auditLogs);

    allData.forEach((item) => {
      const hour = new Date(item.createdAt).getHours();
      hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
    });

    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      count: hourlyCounts[i] || 0,
    }));
  }, [activeTab, stockMovements, auditLogs, searchQuery, filteredStockMovements, filteredAuditLogs]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-slide-up flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-gradient mb-2">
            📜 Complete History
          </h1>
          <p className="mt-1 text-blue-100/90 font-semibold text-lg">
            View complete history of all system activities, changes, and movements
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadHistory}
            disabled={loading}
            className="px-4 py-2.5 bg-blue-600/30 hover:bg-blue-600/40 text-blue-50 rounded-xl font-bold text-sm transition-all duration-200 border border-blue-400/40 hover:shadow-xl flex items-center gap-2 disabled:opacity-50"
            title="Refresh"
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {(displayData.length > 0 || totalItems > 0) && (
            <button
              onClick={exportToCSV}
              disabled={exporting || loading}
              className="px-4 py-2.5 gradient-accent text-blue-50 rounded-xl font-bold text-sm transition-all duration-200 hover:shadow-xl hover:scale-105 flex items-center gap-2 disabled:opacity-50 border border-blue-400/30"
              title="Export to CSV"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'charts' : 'table')}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 border flex items-center gap-2 ${
                viewMode === 'table'
                  ? 'bg-blue-600/40 text-blue-50 border-blue-400/50'
                  : 'bg-blue-600/30 text-blue-200 hover:bg-blue-600/40 border-blue-400/30'
              }`}
              title="Toggle View Mode"
            >
              {viewMode === 'table' ? (
                <>
                  <TableCellsIcon className="h-5 w-5" />
                  Table
                </>
              ) : (
                <>
                  <ChartBarIcon className="h-5 w-5" />
                  Charts
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-effect rounded-2xl p-4 border border-blue-400/40 shadow-2xl">
        <div className="flex flex-wrap gap-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
                clearFilters();
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'gradient-accent text-blue-50 shadow-xl scale-105 border border-blue-400/50'
                  : 'bg-blue-600/30 text-blue-200 hover:bg-blue-600/40 hover:text-blue-50 border border-blue-400/30'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-4 relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300/70" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in history (description, user, entity, etc.)..."
            className="w-full pl-12 pr-4 py-3 bg-blue-600/30 border-2 border-blue-400/50 rounded-xl text-blue-50 placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400/60 text-sm font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-300/70 hover:text-blue-50"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Quick Time Range Filters */}
          <select
            value={filters.timeRange}
            onChange={(e) => {
              setFilters({ ...filters, timeRange: e.target.value });
              setPage(1);
            }}
            className="px-4 py-3 bg-blue-600/30 border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60 text-sm font-medium"
          >
            <option value="" className="bg-blue-900">All Time</option>
            <option value="today" className="bg-blue-900">Today</option>
            <option value="week" className="bg-blue-900">Last 7 Days</option>
            <option value="month" className="bg-blue-900">Last 30 Days</option>
            <option value="last7" className="bg-blue-900">This Week</option>
            <option value="last30" className="bg-blue-900">This Month</option>
          </select>

          {activeTab === 'stock' ? (
            <>
              <select
                value={filters.type}
                onChange={(e) => {
                  setFilters({ ...filters, type: e.target.value });
                  setPage(1);
                }}
                className="px-4 py-3 bg-blue-600/30 border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60 text-sm font-medium"
              >
                <option value="" className="bg-blue-900">All Types</option>
                <option value="IN" className="bg-blue-900">Stock In</option>
                <option value="OUT" className="bg-blue-900">Stock Out</option>
                <option value="ADJUSTMENT" className="bg-blue-900">Adjustment</option>
              </select>
            </>
          ) : (
            <>
              <select
                value={filters.action}
                onChange={(e) => {
                  setFilters({ ...filters, action: e.target.value });
                  setPage(1);
                }}
                className="px-4 py-3 bg-blue-600/30 border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60 text-sm font-medium"
              >
                <option value="" className="bg-blue-900">All Actions</option>
                <option value="CREATE" className="bg-blue-900">Create</option>
                <option value="UPDATE" className="bg-blue-900">Update</option>
                <option value="DELETE" className="bg-blue-900">Delete</option>
                <option value="LOGIN" className="bg-blue-900">Login</option>
                <option value="STATUS_CHANGE" className="bg-blue-900">Status Change</option>
                <option value="STOCK_MOVEMENT" className="bg-blue-900">Stock Movement</option>
              </select>
            </>
          )}
          
          <div className="relative">
            <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300/70" />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => {
                setFilters({ ...filters, startDate: e.target.value, timeRange: '' });
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 bg-blue-600/30 border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60 text-sm font-medium"
              placeholder="Start Date"
            />
          </div>
          
          <div className="relative">
            <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300/70" />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => {
                setFilters({ ...filters, endDate: e.target.value, timeRange: '' });
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 bg-blue-600/30 border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60 text-sm font-medium"
              placeholder="End Date"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasFilters && (
          <div className="mb-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-xl font-bold text-sm transition-all duration-200 border border-red-400/40 flex items-center gap-2"
            >
              <XMarkIcon className="h-4 w-4" />
              Clear All Filters
            </button>
          </div>
        )}

        {/* Page Size Selector */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-blue-200/70 font-semibold">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-2 bg-blue-600/30 border border-blue-400/50 rounded-lg text-blue-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/60"
            >
              <option value={25} className="bg-blue-900">25</option>
              <option value={50} className="bg-blue-900">50</option>
              <option value={100} className="bg-blue-900">100</option>
              <option value={200} className="bg-blue-900">200</option>
            </select>
            <span className="text-sm text-blue-200/70 font-semibold">entries per page</span>
          </div>
          {searchQuery && (
            <div className="text-sm text-blue-200/70">
              Found <span className="font-bold text-blue-50">{displayData.length}</span> results
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Summary Statistics */}
      {!loading && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-blue-600/20 rounded-xl p-4 border border-blue-400/30 hover:scale-105 transition-transform">
            <div className="text-xs text-blue-200/70 font-semibold mb-1">Total Entries</div>
            <div className="text-2xl font-bold text-blue-50">{stats.total}</div>
            <div className="text-xs text-blue-300/60 mt-1">All Records</div>
          </div>
          
          {activeTab === 'stock' ? (
            <>
              <div className="bg-emerald-500/20 rounded-xl p-4 border border-emerald-400/30 hover:scale-105 transition-transform">
                <div className="text-xs text-emerald-200/70 font-semibold mb-1">Stock In</div>
                <div className="text-2xl font-bold text-emerald-50">{stats.in}</div>
                <div className="text-xs text-emerald-300/60 mt-1">IN entries</div>
              </div>
              <div className="bg-red-500/20 rounded-xl p-4 border border-red-400/30 hover:scale-105 transition-transform">
                <div className="text-xs text-red-200/70 font-semibold mb-1">Stock Out</div>
                <div className="text-2xl font-bold text-red-50">{stats.out}</div>
                <div className="text-xs text-red-300/60 mt-1">OUT entries</div>
              </div>
              <div className="bg-amber-500/20 rounded-xl p-4 border border-amber-400/30 hover:scale-105 transition-transform">
                <div className="text-xs text-amber-200/70 font-semibold mb-1">Adjustments</div>
                <div className="text-2xl font-bold text-amber-50">{stats.adjustment}</div>
                <div className="text-xs text-amber-300/60 mt-1">ADJ entries</div>
              </div>
              <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-400/30 hover:scale-105 transition-transform">
                <div className="text-xs text-purple-200/70 font-semibold mb-1">Net Change</div>
                <div className={`text-2xl font-bold ${((stats as any)?.totalQuantity ?? 0) >= 0 ? 'text-emerald-50' : 'text-red-50'}`}>
                  {((stats as any)?.totalQuantity ?? 0) >= 0 ? '+' : ''}{(stats as any)?.totalQuantity ?? 0}
                </div>
                <div className="text-xs text-purple-300/60 mt-1">Units</div>
              </div>
              <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-400/30 hover:scale-105 transition-transform">
                <div className="text-xs text-blue-200/70 font-semibold mb-1">Total Items</div>
                <div className="text-2xl font-bold text-blue-50">{totalItems}</div>
                <div className="text-xs text-blue-300/60 mt-1">In Database</div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-emerald-500/20 rounded-xl p-4 border border-emerald-400/30 hover:scale-105 transition-transform">
                <div className="text-xs text-emerald-200/70 font-semibold mb-1">Created</div>
                <div className="text-2xl font-bold text-emerald-50">{stats.create || 0}</div>
                <div className="text-xs text-emerald-300/60 mt-1">CREATE</div>
              </div>
              <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-400/30 hover:scale-105 transition-transform">
                <div className="text-xs text-blue-200/70 font-semibold mb-1">Updated</div>
                <div className="text-2xl font-bold text-blue-50">{stats.update || 0}</div>
                <div className="text-xs text-blue-300/60 mt-1">UPDATE</div>
              </div>
              <div className="bg-red-500/20 rounded-xl p-4 border border-red-400/30 hover:scale-105 transition-transform">
                <div className="text-xs text-red-200/70 font-semibold mb-1">Deleted</div>
                <div className="text-2xl font-bold text-red-50">{stats.delete || 0}</div>
                <div className="text-xs text-red-300/60 mt-1">DELETE</div>
              </div>
              <div className="bg-green-500/20 rounded-xl p-4 border border-green-400/30 hover:scale-105 transition-transform">
                <div className="text-xs text-green-200/70 font-semibold mb-1">Logins</div>
                <div className="text-2xl font-bold text-green-50">{stats.login || 0}</div>
                <div className="text-xs text-green-300/60 mt-1">LOGIN</div>
              </div>
              <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-400/30 hover:scale-105 transition-transform">
                <div className="text-xs text-purple-200/70 font-semibold mb-1">Stock Moves</div>
                <div className="text-2xl font-bold text-purple-50">{stats.stockMovement || 0}</div>
                <div className="text-xs text-purple-300/60 mt-1">MOVEMENTS</div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="glass-effect rounded-2xl p-6 border border-blue-400/40 shadow-2xl">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-400/20 border-t-blue-300 rounded-full animate-spin"></div>
            <div className="text-blue-100 font-bold">Loading history...</div>
          </div>
        ) : viewMode === 'charts' ? (
          // Charts View
          <div className="space-y-6">
            {displayData.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-accent flex items-center justify-center shadow-xl">
                  <span className="text-3xl">📊</span>
                </div>
                <p className="text-blue-100 font-bold text-lg">No data available for charts</p>
                <p className="text-sm text-blue-200/80 mt-1">
                  {hasFilters ? 'Try adjusting your filters or search query' : 'No history has been recorded yet.'}
                </p>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 bg-blue-600/30 hover:bg-blue-600/40 text-blue-50 rounded-xl font-bold text-sm transition-all"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Row 1: Activity Timeline Chart - Full Width */}
                {timelineChartData.length > 0 && (
                  <div className="glass-effect rounded-2xl p-6 border border-blue-400/40 shadow-xl mb-6 hover:shadow-2xl transition-all duration-300">
                    <h3 className="text-xl font-bold text-blue-50 mb-4 flex items-center gap-2">
                      <span className="text-2xl">📈</span> Activity Timeline
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={timelineChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorTotalGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#42a5f5" stopOpacity={0.9}/>
                            <stop offset="50%" stopColor="#3282b8" stopOpacity={0.7}/>
                            <stop offset="95%" stopColor="#0f4c75" stopOpacity={0.3}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(147, 197, 253, 0.2)" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#93c5fd" 
                          fontSize={11}
                          tick={{ fill: '#dbeafe' }}
                        />
                        <YAxis 
                          stroke="#93c5fd" 
                          fontSize={11}
                          tick={{ fill: '#dbeafe' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(15, 76, 117, 0.98)',
                            border: '2px solid rgba(66, 165, 245, 0.6)',
                            borderRadius: '12px',
                            color: '#dbeafe',
                            padding: '12px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ color: '#dbeafe', fontSize: '12px' }}
                          iconType="circle"
                        />
                        <Area
                          type="monotone"
                          dataKey="total"
                          stroke="#42a5f5"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorTotalGradient)"
                          name="Total Activities"
                          dot={{ fill: '#42a5f5', r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: '#42a5f5' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Row 2: Two Charts Side by Side */}
                {(actionsDistributionData.length > 0 || entityTypesData.length > 0 || (activeTab === 'stock' && stockQuantityData.length > 0)) && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Actions/Movements Distribution Pie Chart */}
                    {actionsDistributionData.length > 0 && (
                      <div className="glass-effect rounded-2xl p-6 border border-blue-400/40 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <h3 className="text-xl font-bold text-blue-50 mb-4 flex items-center gap-2">
                          <span className="text-2xl">🥧</span> {activeTab === 'stock' ? 'Stock Movements' : 'Actions Distribution'}
                        </h3>
                        <ResponsiveContainer width="100%" height={320}>
                          <PieChart>
                            <defs>
                              {actionsDistributionData.map((entry, index) => (
                                <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={entry.color} stopOpacity={1}/>
                                  <stop offset="100%" stopColor={entry.color} stopOpacity={0.7}/>
                                </linearGradient>
                              ))}
                            </defs>
                            <Pie
                              data={actionsDistributionData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent, value }) => `${name}\n${value} (${((percent ?? 0) * 100).toFixed(1)}%)`}
                              outerRadius={110}
                              innerRadius={40}
                              fill="#8884d8"
                              dataKey="value"
                              paddingAngle={3}
                            >
                              {actionsDistributionData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={`url(#gradient-${index})`}
                                  stroke={entry.color}
                                  strokeWidth={2}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(15, 76, 117, 0.98)',
                                border: '2px solid rgba(66, 165, 245, 0.6)',
                                borderRadius: '12px',
                                color: '#dbeafe',
                                padding: '12px',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                              }}
                              formatter={(value: any) => [value, 'Count']}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Entity Types Distribution OR Stock Quantity Chart */}
                    {activeTab === 'stock' && stockQuantityData.length > 0 ? (
                      <div className="glass-effect rounded-2xl p-6 border border-blue-400/40 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <h3 className="text-xl font-bold text-blue-50 mb-4 flex items-center gap-2">
                          <span className="text-2xl">📊</span> Stock Quantity Trends
                        </h3>
                        <ResponsiveContainer width="100%" height={320}>
                          <BarChart data={stockQuantityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <defs>
                              <linearGradient id="stockInGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                                <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
                              </linearGradient>
                              <linearGradient id="stockOutGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
                                <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8}/>
                              </linearGradient>
                              <linearGradient id="adjustmentGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                                <stop offset="100%" stopColor="#d97706" stopOpacity={0.8}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(147, 197, 253, 0.2)" />
                            <XAxis 
                              dataKey="date" 
                              stroke="#93c5fd" 
                              fontSize={11}
                              tick={{ fill: '#dbeafe' }}
                            />
                            <YAxis 
                              stroke="#93c5fd" 
                              fontSize={11}
                              tick={{ fill: '#dbeafe' }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(15, 76, 117, 0.98)',
                                border: '2px solid rgba(66, 165, 245, 0.6)',
                                borderRadius: '12px',
                                color: '#dbeafe',
                                padding: '12px',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                              }}
                            />
                            <Legend 
                              wrapperStyle={{ color: '#dbeafe', fontSize: '12px' }}
                              iconType="square"
                            />
                            <Bar dataKey="in" stackId="a" fill="url(#stockInGradient)" name="Stock In" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="out" stackId="a" fill="url(#stockOutGradient)" name="Stock Out" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="adjustment" stackId="a" fill="url(#adjustmentGradient)" name="Adjustment" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : entityTypesData.length > 0 && activeTab !== 'stock' ? (
                      <div className="glass-effect rounded-2xl p-6 border border-blue-400/40 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <h3 className="text-xl font-bold text-blue-50 mb-4 flex items-center gap-2">
                          <span className="text-2xl">📦</span> Entity Types Distribution
                        </h3>
                        <ResponsiveContainer width="100%" height={320}>
                          <PieChart>
                            <defs>
                              {entityTypesData.map((entry, index) => (
                                <linearGradient key={`entityGradient-${index}`} id={`entityGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={entry.color} stopOpacity={1}/>
                                  <stop offset="100%" stopColor={entry.color} stopOpacity={0.7}/>
                                </linearGradient>
                              ))}
                            </defs>
                            <Pie
                              data={entityTypesData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent, value }) => `${name}\n${value} (${((percent ?? 0) * 100).toFixed(1)}%)`}
                              outerRadius={110}
                              innerRadius={40}
                              fill="#8884d8"
                              dataKey="value"
                              paddingAngle={3}
                            >
                              {entityTypesData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={`url(#entityGradient-${index})`}
                                  stroke={entry.color}
                                  strokeWidth={2}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(15, 76, 117, 0.98)',
                                border: '2px solid rgba(66, 165, 245, 0.6)',
                                borderRadius: '12px',
                                color: '#dbeafe',
                                padding: '12px',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                              }}
                              formatter={(value: any) => [value, 'Count']}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Row 3: Two Charts Side by Side - User Activity & Hourly Distribution */}
                {(userActivityData.length > 0 || hourlyActivityData.length > 0) && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* User Activity Bar Chart */}
                    {userActivityData.length > 0 && (
                      <div className="glass-effect rounded-2xl p-6 border border-blue-400/40 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <h3 className="text-xl font-bold text-blue-50 mb-4 flex items-center gap-2">
                          <span className="text-2xl">👥</span> Top Active Users
                        </h3>
                        <ResponsiveContainer width="100%" height={320}>
                          <BarChart data={userActivityData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <defs>
                              <linearGradient id="userActivityGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#42a5f5" stopOpacity={1}/>
                                <stop offset="100%" stopColor="#0f4c75" stopOpacity={0.9}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(147, 197, 253, 0.2)" />
                            <XAxis 
                              type="number" 
                              stroke="#93c5fd" 
                              fontSize={11}
                              tick={{ fill: '#dbeafe' }}
                            />
                            <YAxis 
                              dataKey="name" 
                              type="category" 
                              stroke="#93c5fd" 
                              fontSize={11}
                              width={120}
                              tick={{ fill: '#dbeafe' }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(15, 76, 117, 0.98)',
                                border: '2px solid rgba(66, 165, 245, 0.6)',
                                borderRadius: '12px',
                                color: '#dbeafe',
                                padding: '12px',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                              }}
                              formatter={(value: any) => [value, 'Activities']}
                            />
                            <Bar 
                              dataKey="value" 
                              fill="url(#userActivityGradient)" 
                              name="Activities" 
                              radius={[0, 12, 12, 0]}
                              stroke="#42a5f5"
                              strokeWidth={1}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Hourly Activity Distribution */}
                    {hourlyActivityData.length > 0 && (
                      <div className="glass-effect rounded-2xl p-6 border border-blue-400/40 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <h3 className="text-xl font-bold text-blue-50 mb-4 flex items-center gap-2">
                          <span className="text-2xl">⏰</span> Hourly Activity Pattern
                        </h3>
                        <ResponsiveContainer width="100%" height={320}>
                          <AreaChart data={hourlyActivityData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                            <defs>
                              <linearGradient id="hourlyAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#42a5f5" stopOpacity={0.9}/>
                                <stop offset="50%" stopColor="#3282b8" stopOpacity={0.7}/>
                                <stop offset="95%" stopColor="#0f4c75" stopOpacity={0.3}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(147, 197, 253, 0.2)" />
                            <XAxis 
                              dataKey="hour" 
                              stroke="#93c5fd" 
                              fontSize={11}
                              tick={{ fill: '#dbeafe' }}
                            />
                            <YAxis 
                              stroke="#93c5fd" 
                              fontSize={11}
                              tick={{ fill: '#dbeafe' }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(15, 76, 117, 0.98)',
                                border: '2px solid rgba(66, 165, 245, 0.6)',
                                borderRadius: '12px',
                                color: '#dbeafe',
                                padding: '12px',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                              }}
                              formatter={(value: any) => [value, 'Activities']}
                            />
                            <Legend 
                              wrapperStyle={{ color: '#dbeafe', fontSize: '12px' }}
                              iconType="circle"
                            />
                            <Area
                              type="monotone"
                              dataKey="count"
                              stroke="#42a5f5"
                              strokeWidth={3}
                              fill="url(#hourlyAreaGradient)"
                              fillOpacity={0.8}
                              name="Activities"
                              dot={{ fill: '#42a5f5', r: 5, strokeWidth: 2, stroke: '#ffffff' }}
                              activeDot={{ r: 8, fill: '#42a5f5', stroke: '#ffffff', strokeWidth: 2 }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}

                {/* Row 4: Detailed Activity Breakdown - Full Width (for audit logs only) */}
                {timelineChartData.length > 0 && activeTab !== 'stock' && (
                  <div className="glass-effect rounded-2xl p-6 border border-blue-400/40 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <h3 className="text-xl font-bold text-blue-50 mb-4 flex items-center gap-2">
                      <span className="text-2xl">📊</span> Detailed Activity Breakdown by Type
                    </h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={timelineChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="createGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
                          </linearGradient>
                          <linearGradient id="updateGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8}/>
                          </linearGradient>
                          <linearGradient id="deleteGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8}/>
                          </linearGradient>
                          <linearGradient id="loginGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#16a34a" stopOpacity={0.8}/>
                          </linearGradient>
                          <linearGradient id="statusGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#d97706" stopOpacity={0.8}/>
                          </linearGradient>
                          <linearGradient id="stockMoveGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.8}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(147, 197, 253, 0.2)" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#93c5fd" 
                          fontSize={11}
                          tick={{ fill: '#dbeafe' }}
                        />
                        <YAxis 
                          stroke="#93c5fd" 
                          fontSize={11}
                          tick={{ fill: '#dbeafe' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(15, 76, 117, 0.98)',
                            border: '2px solid rgba(66, 165, 245, 0.6)',
                            borderRadius: '12px',
                            color: '#dbeafe',
                            padding: '12px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ color: '#dbeafe', fontSize: '12px' }}
                          iconType="square"
                        />
                        <Bar dataKey="CREATE" stackId="a" fill="url(#createGradient)" name="Create" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="UPDATE" stackId="a" fill="url(#updateGradient)" name="Update" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="DELETE" stackId="a" fill="url(#deleteGradient)" name="Delete" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="LOGIN" stackId="a" fill="url(#loginGradient)" name="Login" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="STATUS_CHANGE" stackId="a" fill="url(#statusGradient)" name="Status Change" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="STOCK_MOVEMENT" stackId="a" fill="url(#stockMoveGradient)" name="Stock Movement" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}
          </div>
        ) : activeTab === 'stock' ? (
          filteredStockMovements.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-accent flex items-center justify-center shadow-xl">
                <span className="text-3xl">📈</span>
              </div>
              <p className="text-blue-100 font-bold text-lg">No stock movements found</p>
              <p className="text-sm text-blue-200/80 mt-1">
                {hasFilters ? 'Try adjusting your filters or search query' : 'No stock movements have been recorded yet.'}
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-blue-600/30 hover:bg-blue-600/40 text-blue-50 rounded-xl font-bold text-sm transition-all"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-400/20">
                  <thead className="bg-blue-600/20 backdrop-blur-sm sticky top-0">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">📅 Date & Time</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">📦 Product</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">🏷️ Type</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">🔢 Quantity</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">📝 Reason</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">👤 User</th>
                    </tr>
                  </thead>
                  <tbody className="bg-blue-600/10 divide-y divide-blue-400/10">
                    {filteredStockMovements.map((movement) => (
                      <tr key={movement.id} className="hover:bg-blue-600/20 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-blue-50">
                              {new Date(movement.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <span className="text-xs text-blue-200/70 mt-0.5">
                              {new Date(movement.createdAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true,
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-blue-50">{movement.product.name}</span>
                            <span className="text-xs text-blue-200/70">SKU: {movement.product.sku}</span>
                            <span className="text-xs text-blue-200/60">Category: {movement.product.category?.name || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg ${
                            actionColors[movement.type] || 'bg-blue-500/40 text-blue-200 border border-blue-400/40'
                          }`}>
                            {movement.type === 'IN' && '⬆️'}
                            {movement.type === 'OUT' && '⬇️'}
                            {movement.type === 'ADJUSTMENT' && '🔄'}
                            <span className="ml-1">{movement.type}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-base font-bold ${movement.quantity > 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                            {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-blue-200/90 font-medium">{movement.reason}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-600/20 border border-blue-400/40 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-blue-50">
                                {movement.user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-blue-50">{movement.user.name}</span>
                              <span className="text-xs text-blue-200/70 truncate max-w-[120px]">{movement.user.email}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )
        ) : filteredAuditLogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-accent flex items-center justify-center shadow-xl">
              <span className="text-3xl">📜</span>
            </div>
            <p className="text-blue-100 font-bold text-lg">No history found</p>
            <p className="text-sm text-blue-200/80 mt-1">
              {hasFilters ? 'Try adjusting your filters or search query' : 'No history has been recorded yet.'}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-blue-600/30 hover:bg-blue-600/40 text-blue-50 rounded-xl font-bold text-sm transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-400/20">
                <thead className="bg-blue-600/20 backdrop-blur-sm sticky top-0">
                  <tr>
                    <th 
                      className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider cursor-pointer hover:bg-blue-600/30 transition-colors"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-2">
                        📅 Date & Time
                        {sortBy === 'date' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider cursor-pointer hover:bg-blue-600/30 transition-colors"
                      onClick={() => handleSort('user')}
                    >
                      <div className="flex items-center gap-2">
                        👤 User
                        {sortBy === 'user' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider cursor-pointer hover:bg-blue-600/30 transition-colors"
                      onClick={() => handleSort('action')}
                    >
                      <div className="flex items-center gap-2">
                        🏷️ Action
                        {sortBy === 'action' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider cursor-pointer hover:bg-blue-600/30 transition-colors"
                      onClick={() => handleSort('entity')}
                    >
                      <div className="flex items-center gap-2">
                        📦 Entity
                        {sortBy === 'entity' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">📝 Description</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">🔄 Changes</th>
                  </tr>
                </thead>
                <tbody className="bg-blue-600/10 divide-y divide-blue-400/10">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-blue-600/20 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-blue-50">
                            {new Date(log.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span className="text-xs text-blue-200/70 mt-0.5">
                            {new Date(log.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: true,
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-600/20 border border-blue-400/40 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-blue-50">
                              {log.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-blue-50">{log.user.name}</span>
                            <span className="text-xs text-blue-200/70 truncate max-w-[150px]">{log.user.email}</span>
                            <span className={`text-[10px] font-bold mt-0.5 ${
                              log.user.role === 'ADMIN' ? 'text-yellow-400' : 'text-blue-300/70'
                            }`}>
                              {log.user.role}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-lg ${
                          actionColors[log.action] || 'bg-blue-500/40 text-blue-200 border border-blue-400/40'
                        }`}>
                          {log.action.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-blue-50">{log.entityType}</span>
                          {log.entityId && (
                            <span className="text-xs text-blue-200/70 mt-0.5">
                              ID: {log.entityId.substring(0, 8)}...
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <span className="text-sm text-blue-200/90 font-medium">{log.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {(log.oldValue || log.newValue) && (
                          <div className="flex flex-col space-y-1 max-w-xs">
                            {log.oldValue && (
                              <div className="text-xs">
                                <span className="font-semibold text-red-300">Old:</span>
                                <span className="text-red-200/80 ml-1 truncate block">{log.oldValue}</span>
                              </div>
                            )}
                            {log.newValue && (
                              <div className="text-xs">
                                <span className="font-semibold text-emerald-300">New:</span>
                                <span className="text-emerald-200/80 ml-1 truncate block">{log.newValue}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Enhanced Pagination */}
        {(totalPages > 1 || displayData.length > 0) && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-blue-400/30 pt-4">
            <div className="text-sm text-blue-200/70">
              Showing <span className="font-bold text-blue-100">
                {searchQuery ? 1 : (page - 1) * pageSize + 1}
              </span> - <span className="font-bold text-blue-100">
                {searchQuery 
                  ? displayData.length 
                  : Math.min(page * pageSize, totalItems)
                }
              </span> of <span className="font-bold text-blue-100">
                {searchQuery ? displayData.length : totalItems}
              </span> {searchQuery ? 'filtered' : 'total'} entries
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-5 py-2.5 text-sm font-bold text-blue-50 gradient-accent rounded-xl hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 glow-effect border border-blue-400/30"
              >
                ← Previous
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-blue-100 px-4 py-2 bg-blue-600/30 rounded-lg border border-blue-400/40">
                  Page {page} of {totalPages || 1}
                </span>
                {totalPages > 5 && (
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={page}
                    onChange={(e) => {
                      const newPage = Math.max(1, Math.min(totalPages, Number(e.target.value)));
                      setPage(newPage);
                    }}
                    className="w-20 px-2 py-2 bg-blue-600/30 border border-blue-400/50 rounded-lg text-blue-50 text-sm font-medium text-center focus:outline-none focus:ring-2 focus:ring-blue-400/60"
                  />
                )}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="px-5 py-2.5 text-sm font-bold text-blue-50 gradient-accent rounded-xl hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 glow-effect border border-blue-400/30"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
