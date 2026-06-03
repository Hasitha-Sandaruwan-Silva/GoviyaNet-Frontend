import { apiClient } from '@/api/axios'
import type {
  CartCreateRequest,
  CartItem,
  Order,
  OrderCreateRequest,
  OrderStatusUpdateRequest,
} from '@/types'

export const buyerApi = {
  addToCart: (data: CartCreateRequest) =>
    apiClient.post<CartItem>('/api/cart', data).then((res) => res.data),

  getCart: (buyerId: number) =>
    apiClient.get<CartItem[]>(`/api/cart/${buyerId}`).then((res) => res.data),

  removeFromCart: (cartItemId: number) =>
    apiClient.delete(`/api/cart/item/${cartItemId}`).then((res) => res.data),

  clearCart: (buyerId: number) =>
    apiClient.delete(`/api/cart/${buyerId}/clear`).then((res) => res.data),

  createOrder: (data: OrderCreateRequest) =>
    apiClient.post<Order>('/api/orders', data).then((res) => res.data),

  getOrder: (id: number) =>
    apiClient.get<Order>(`/api/orders/${id}`).then((res) => res.data),

  getOrdersByBuyer: (buyerId: number) =>
    apiClient.get<Order[]>(`/api/orders/buyer/${buyerId}`).then((res) => res.data),

  getOrdersByFarmer: (farmerId: number) =>
    apiClient.get<Order[]>(`/api/orders/farmer/${farmerId}`).then((res) => res.data),

  updateOrderStatus: (id: number, data: OrderStatusUpdateRequest) =>
    apiClient.put<Order>(`/api/orders/${id}/status`, data).then((res) => res.data),

  cancelOrder: (id: number) =>
    apiClient.put<Order>(`/api/orders/${id}/cancel`).then((res) => res.data),
}