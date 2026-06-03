import { apiClient } from '@/api/axios'
import type {
  Delivery,
  DeliveryCreateRequest,
  DeliveryStatusUpdateRequest,
  Rider,
  RiderRegisterRequest,
} from '@/types'

export const deliveryApi = {
  registerRider: (data: RiderRegisterRequest) =>
    apiClient.post<Rider>('/api/riders/register', data).then((res) => res.data),

  getRiders: () => apiClient.get<Rider[]>('/api/riders').then((res) => res.data),

  getAvailableRiders: () =>
    apiClient.get<Rider[]>('/api/riders/available').then((res) => res.data),

  updateRiderAvailability: (id: number, available: boolean) =>
    apiClient
      .put<Rider>(`/api/riders/${id}/availability`, { available })
      .then((res) => res.data),

  createDelivery: (data: DeliveryCreateRequest) =>
    apiClient.post<Delivery>('/api/deliveries', data).then((res) => res.data),

  getDelivery: (id: number) =>
    apiClient.get<Delivery>(`/api/deliveries/${id}`).then((res) => res.data),

  getDeliveryByOrder: (orderId: number) =>
    apiClient.get<Delivery>(`/api/deliveries/order/${orderId}`).then((res) => res.data),

  getDeliveriesByRider: (riderId: number) =>
    apiClient.get<Delivery[]>(`/api/deliveries/rider/${riderId}`).then((res) => res.data),

  autoAssign: (id: number) =>
    apiClient.put<Delivery>(`/api/deliveries/${id}/auto-assign`).then((res) => res.data),

  updateDeliveryStatus: (id: number, data: DeliveryStatusUpdateRequest) =>
    apiClient.put<Delivery>(`/api/deliveries/${id}/status`, data).then((res) => res.data),
}
