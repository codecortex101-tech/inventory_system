import { apiClient } from './client';

export const exportsApi = {
  exportHistory: async (
    entityType?: string,
    action?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Blob> => {
    const params = new URLSearchParams();
    if (entityType) params.append('entityType', entityType);
    if (action) params.append('action', action);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiClient.get(`/exports/history?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  exportStockHistory: async (
    type?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Blob> => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiClient.get(`/exports/stock-history?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
