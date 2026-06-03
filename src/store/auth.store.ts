import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/api/axios'
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<User>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  setAuth: (response: AuthResponse) => void
  refreshAccessToken: () => Promise<string>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (response: AuthResponse) => {
        // Backend returns "accessToken" field
        const token = response.accessToken
        const user = response.user ?? {
          id: 0,
          username: '',
          email: '',
          fullName: '',
          role: 'BUYER',
        }
        set({
          user,
          accessToken: token,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
        })
      },

      login: async (credentials: LoginRequest) => {
        const { data } = await apiClient.post<AuthResponse>('/api/auth/login', credentials)
        // Backend AuthResponse: { accessToken, refreshToken, tokenType, expiresIn, user }
        const token = data.accessToken
        const user = data.user ?? {
          id: 0,
          username: credentials.username,
          email: '',
          fullName: credentials.username,
          role: 'BUYER',
        }
        set({
          user,
          accessToken: token,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
        })
        return user
      },

      register: async (registerData: RegisterRequest) => {
        await apiClient.post('/api/auth/register', registerData)
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
        window.location.href = '/login'
      },

      refreshAccessToken: async () => {
        const currentRefreshToken = get().refreshToken
        if (!currentRefreshToken) throw new Error('No refresh token available')

        const { data } = await apiClient.post<AuthResponse>('/api/auth/refresh', {
          refreshToken: currentRefreshToken,
        })

        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
          isAuthenticated: true,
        })

        return data.accessToken
      },
    }),
    {
      name: 'goviyanet-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)