import { apiClient } from '@/api/axios'
import type { PriceRecord, PriceTrend } from '@/types'

export const priceApi = {
  getAll: () =>
    apiClient.get<PriceRecord[]>('/api/prices').then((res) => res.data),

  getLatest: (produce: string, region: string) =>
    apiClient
      .get<PriceRecord>('/api/prices/latest', { params: { produce, region } })
      .then((res) => res.data),

  getByCategory: (category: string) =>
    apiClient.get<PriceRecord[]>(`/api/prices/category/${category}`).then((res) => res.data),

  getByRegion: (region: string) =>
    apiClient.get<PriceRecord[]>(`/api/prices/region/${region}`).then((res) => res.data),

  getStatistics: () =>
    apiClient.get('/api/prices/statistics').then((res) => res.data),

  getTrend: (produce: string, region: string) =>
    apiClient
      .get<PriceTrend>('/api/prices/trend', { params: { produce, region } })
      .then((res) => res.data),

  create: (data: Omit<PriceRecord, 'id'>) =>
    apiClient.post<PriceRecord>('/api/prices', data).then((res) => res.data),

  update: (id: number, data: Omit<PriceRecord, 'id'>) =>
    apiClient.put<PriceRecord>(`/api/prices/${id}`, data).then((res) => res.data),

  delete: (id: number) =>
    apiClient.delete(`/api/prices/${id}`).then((res) => res.data),
}