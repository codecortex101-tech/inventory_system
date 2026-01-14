import { apiClient } from './client';

export interface LoginDto {
  organizationName: string;
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  organizationName: string;
  role?: 'ADMIN' | 'STAFF';
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'STAFF';
    organizationId?: string;
    organizationName?: string;
    organization?: {
      id: string;
      name: string;
    };
  };
}

export const authApi = {
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
  registerStaff: async (data: RegisterDto): Promise<any> => {
    const response = await apiClient.post('/auth/register-staff', data);
    return response.data;
  },
  getOAuthStatus: async (): Promise<{ google: { enabled: boolean }; facebook: { enabled: boolean } }> => {
    const response = await apiClient.get('/auth/oauth-status');
    return response.data;
  },
};
