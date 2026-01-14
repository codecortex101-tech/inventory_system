import { apiClient } from './client';

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  description?: string;
  imageUrl?: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minimumStock: number;
  unit: string;
  status: 'ACTIVE' | 'INACTIVE';
  expirationDate?: string | null;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
}

export interface CreateProductDto {
  name: string;
  sku: string;
  categoryId: string;
  description?: string;
  imageUrl?: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minimumStock: number;
  unit?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  expirationDate?: string;
}

export interface UpdateProductDto {
  name?: string;
  sku?: string;
  categoryId?: string;
  description?: string;
  costPrice?: number;
  sellingPrice?: number;
  minimumStock?: number;
  unit?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  expirationDate?: string | null;
}

export interface ProductsResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const productsApi = {
  getAll: async (
    page = 1,
    limit = 10,
    search?: string,
    categoryId?: string,
    status?: string,
    expired?: boolean,
    expiringSoon?: boolean,
    activeExpiration?: boolean,
    hasExpirationDate?: boolean,
  ): Promise<ProductsResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (categoryId) params.append('categoryId', categoryId);
    if (status) params.append('status', status);
    if (expired) params.append('expired', 'true');
    if (expiringSoon) params.append('expiringSoon', 'true');
    if (activeExpiration) params.append('activeExpiration', 'true');
    if (hasExpirationDate) params.append('hasExpirationDate', 'true');

    const response = await apiClient.get<ProductsResponse>(
      `/products?${params.toString()}`,
    );
    return response.data;
  },
  getOne: async (id: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },
  create: async (data: CreateProductDto): Promise<Product> => {
    const response = await apiClient.post<Product>('/products', data);
    return response.data;
  },
  update: async (id: string, data: UpdateProductDto): Promise<Product> => {
    const response = await apiClient.patch<Product>(`/products/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
  getLowStock: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/products/low-stock');
    return response.data;
  },
  getOutOfStock: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/products/out-of-stock');
    return response.data;
  },
  getExpirationStats: async (): Promise<{
    total: number;
    expired: number;
    expiringSoon: number;
    active: number;
    expiredProducts: Product[];
    expiringSoonProducts: Product[];
    activeProducts: Product[];
  }> => {
    const response = await apiClient.get('/products/expiration-stats');
    return response.data;
  },
};
