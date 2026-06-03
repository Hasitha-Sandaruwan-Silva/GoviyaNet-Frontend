import { apiClient } from '@/api/axios'
import type {
  Farmer,
  FarmerRegisterRequest,
  Produce,
  ProduceCreateRequest,
} from '@/types'

export const farmerApi = {
  register: (data: FarmerRegisterRequest) =>
    apiClient.post<Farmer>('/api/farmers/register', data).then((res) => res.data),

  getAll: () => apiClient.get<Farmer[]>('/api/farmers').then((res) => res.data),

  getById: (id: number) =>
    apiClient.get<Farmer>(`/api/farmers/${id}`).then((res) => res.data),

  getByUserId: (userId: number) =>
    apiClient.get<Farmer>(`/api/farmers/user/${userId}`).then((res) => res.data),

  verify: (id: number) =>
    apiClient.put<Farmer>(`/api/farmers/${id}/verify`).then((res) => res.data),

  createProduce: (data: ProduceCreateRequest) =>
    apiClient.post<Produce>('/api/farmers/produce', data).then((res) => res.data),

  getAvailableProduce: () =>
    apiClient.get<Produce[]>('/api/farmers/produce/available').then((res) => res.data),

  getProduceByFarmer: (farmerId: number) =>
    apiClient
      .get<Produce[]>(`/api/farmers/${farmerId}/produce`)
      .then((res) => res.data),

  getProduceByCategory: (category: string) =>
    apiClient
      .get<Produce[]>(`/api/farmers/produce/category/${category}`)
      .then((res) => res.data),

  updateStock: (id: number, stock: number) =>
    apiClient
      .put<Produce>(`/api/farmers/produce/${id}/stock`, { stock })
      .then((res) => res.data),

  deleteProduce: (id: number) =>
    apiClient.delete(`/api/farmers/produce/${id}`).then((res) => res.data),
}