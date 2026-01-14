import { apiClient } from './client';

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  reason: string;
  userId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    sku: string;
    description?: string;
    costPrice?: number;
    sellingPrice?: number;
    currentStock?: number;
    minimumStock?: number;
    unit?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    category: {
      id: string;
      name: string;
    };
  };
  user: {
    id: string;
    name: string;
    email: string;
    role?: 'ADMIN' | 'STAFF';
  };
}

export interface CreateStockMovementDto {
  productId: string;
  quantity: number;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  reason: string;
}

export interface StockMovementsHistoryResponse {
  data: StockMovement[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const stockApi = {
  createMovement: async (
    data: CreateStockMovementDto,
  ): Promise<StockMovement> => {
    const response = await apiClient.post<StockMovement>('/stock/move', data);
    return response.data;
  },
  getMovementsHistory: async (
    page = 1,
    limit = 100,
    productId?: string,
    type?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<StockMovementsHistoryResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (productId) params.append('productId', productId);
    if (type) params.append('type', type);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiClient.get<StockMovementsHistoryResponse>(
      `/stock/history?${params.toString()}`,
    );
    return response.data;
  },
};
