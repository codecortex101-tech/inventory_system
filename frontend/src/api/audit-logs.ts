import { apiClient } from './client';

export interface AuditLog {
  id: string;
  userId: string;
  organizationId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'STOCK_MOVEMENT' | 'STATUS_CHANGE';
  entityType: string;
  entityId?: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'STAFF';
  };
}

export interface AuditLogsResponse {
  data: AuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const auditLogsApi = {
  getAll: async (
    page = 1,
    limit = 50,
    userId?: string,
    action?: string,
    entityType?: string,
  ): Promise<AuditLogsResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (userId) params.append('userId', userId);
    if (action) params.append('action', action);
    if (entityType) params.append('entityType', entityType);

    const response = await apiClient.get<AuditLogsResponse>(
      `/audit-logs?${params.toString()}`,
    );
    return response.data;
  },
  getHistory: async (
    page = 1,
    limit = 100,
    entityType?: string,
    action?: string,
  ): Promise<AuditLogsResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (entityType) params.append('entityType', entityType);
    if (action) params.append('action', action);

    const response = await apiClient.get<AuditLogsResponse>(
      `/audit-logs/history?${params.toString()}`,
    );
    return response.data;
  },
};
