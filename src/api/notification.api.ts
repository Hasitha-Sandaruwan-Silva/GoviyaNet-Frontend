import { apiClient } from '@/api/axios'
import type { Notification } from '@/types'

export const notificationApi = {
  createNotification: (data: Partial<Notification>) =>
    apiClient.post<Notification>('/api/notifications', data).then((res) => res.data),

  getUserNotifications: (userId: number) =>
    apiClient
      .get<Notification[]>(`/api/notifications/user/${userId}`)
      .then((res) => res.data),

  getUnread: (userId: number) =>
    apiClient
      .get<Notification[]>(`/api/notifications/user/${userId}/unread`)
      .then((res) => res.data),

  getStats: (userId: number) =>
    apiClient
      .get(`/api/notifications/user/${userId}/stats`)
      .then((res) => res.data),

  markAsRead: (id: number) =>
    apiClient.put<Notification>(`/api/notifications/${id}/read`).then((res) => res.data),

  markAllAsRead: (userId: number) =>
    apiClient.put(`/api/notifications/user/${userId}/read-all`).then((res) => res.data),

  delete: (id: number) =>
    apiClient.delete(`/api/notifications/${id}`).then((res) => res.data),
}