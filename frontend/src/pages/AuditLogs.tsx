import { useEffect, useState } from 'react';
import { auditLogsApi } from '../api/audit-logs';
import type { AuditLog } from '../api/audit-logs';
import toast from 'react-hot-toast';

const actionColors: Record<string, string> = {
  CREATE: 'bg-emerald-500/40 text-emerald-200 border border-emerald-400/40',
  UPDATE: 'bg-blue-500/40 text-blue-200 border border-blue-400/40',
  DELETE: 'bg-red-500/40 text-red-200 border border-red-400/40',
  LOGIN: 'bg-green-500/40 text-green-200 border border-green-400/40',
  LOGOUT: 'bg-gray-500/40 text-gray-200 border border-gray-400/40',
  STOCK_MOVEMENT: 'bg-purple-500/40 text-purple-200 border border-purple-400/40',
  STATUS_CHANGE: 'bg-amber-500/40 text-amber-200 border border-amber-400/40',
};

export const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
  });

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters.action, filters.entityType]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await auditLogsApi.getAll(
        page,
        50,
        undefined,
        filters.action || undefined,
        filters.entityType || undefined,
      );
      setLogs(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      toast.error('Failed to load audit logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-slide-up">
        <h1 className="text-4xl font-extrabold text-gradient mb-2">
          📋 Audit Logs
        </h1>
        <p className="mt-1 text-blue-100/90 font-semibold text-lg">
          Review all system activities and admin actions
        </p>
      </div>

      <div className="glass-effect rounded-2xl p-6 animate-slide-up border border-blue-400/40 shadow-2xl">
        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-blue-100 mb-2">Action Type</label>
            <select
              value={filters.action}
              onChange={(e) => {
                setFilters({ ...filters, action: e.target.value });
                setPage(1);
              }}
              className="w-full px-4 py-3 bg-blue-600/30 border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
            >
              <option value="" className="bg-blue-900">All Actions</option>
              <option value="CREATE" className="bg-blue-900">Create</option>
              <option value="UPDATE" className="bg-blue-900">Update</option>
              <option value="DELETE" className="bg-blue-900">Delete</option>
              <option value="LOGIN" className="bg-blue-900">Login</option>
              <option value="LOGOUT" className="bg-blue-900">Logout</option>
              <option value="STOCK_MOVEMENT" className="bg-blue-900">Stock Movement</option>
              <option value="STATUS_CHANGE" className="bg-blue-900">Status Change</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-blue-100 mb-2">Entity Type</label>
            <select
              value={filters.entityType}
              onChange={(e) => {
                setFilters({ ...filters, entityType: e.target.value });
                setPage(1);
              }}
              className="w-full px-4 py-3 bg-blue-600/30 border-2 border-blue-400/50 rounded-xl text-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
            >
              <option value="" className="bg-blue-900">All Entities</option>
              <option value="Product" className="bg-blue-900">Product</option>
              <option value="Category" className="bg-blue-900">Category</option>
              <option value="User" className="bg-blue-900">User</option>
              <option value="StockMovement" className="bg-blue-900">Stock Movement</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-400/20 border-t-blue-300 rounded-full animate-spin"></div>
            <div className="text-blue-100 font-bold">Loading audit logs...</div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-accent flex items-center justify-center shadow-xl">
              <span className="text-3xl">📋</span>
            </div>
            <p className="text-blue-100 font-bold text-lg">No audit logs found</p>
            <p className="text-sm text-blue-200/80 mt-1">
              {filters.action || filters.entityType
                ? 'Try adjusting your filters'
                : 'No activity has been logged yet'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-400/20">
                <thead className="bg-blue-600/20 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">
                      📅 Date & Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">
                      👤 User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">
                      🏷️ Action
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">
                      📦 Entity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">
                      📝 Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-blue-100 uppercase tracking-wider">
                      🔄 Changes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-blue-600/10 divide-y divide-blue-400/10">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-blue-600/20 transition-colors">
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
                            <span className="text-xs text-blue-200/70 truncate max-w-[150px]">
                              {log.user.email}
                            </span>
                            <span className={`text-[10px] font-bold mt-0.5 ${
                              log.user.role === 'ADMIN' 
                                ? 'text-yellow-400' 
                                : 'text-blue-300/70'
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
                          <span className="text-sm text-blue-200/90 font-medium">
                            {log.description}
                          </span>
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

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-blue-400/30 pt-4">
                <div className="text-sm text-blue-200/70">
                  Showing <span className="font-bold text-blue-100">{logs.length}</span> of <span className="font-bold text-blue-100">{totalPages * 50}</span> logs
                </div>
                <div className="flex items-center gap-3">
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
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
