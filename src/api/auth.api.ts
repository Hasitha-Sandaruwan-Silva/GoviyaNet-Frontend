import { apiClient } from '@/api/axios'
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types'

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/api/auth/login', data).then((res) => res.data),

  register: (data: RegisterRequest) =>
    apiClient.post('/api/auth/register', data).then((res) => res.data),

  refresh: (refreshToken: string) =>
    apiClient
      .post<AuthResponse>('/api/auth/refresh', { refreshToken })
      .then((res) => res.data),
}
