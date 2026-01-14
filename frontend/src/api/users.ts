import { apiClient } from './client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'STAFF';
  createdAt: string;
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  },
  getOne: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
