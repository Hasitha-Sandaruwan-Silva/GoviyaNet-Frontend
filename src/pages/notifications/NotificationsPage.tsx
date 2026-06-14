import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { AppCard } from '@/components/shared/AppCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { notificationApi } from '@/api/notification.api'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/lib/utils'

export function NotificationsPage() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => notificationApi.getUserNotifications(user!.id),
    enabled: Boolean(user?.id),
    refetchInterval: 15000,
  })

  const markRead = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
      void queryClient.invalidateQueries({ queryKey: ['notifications-unread', user?.id] })
    },
  })

  const markAllRead = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(user!.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
      void queryClient.invalidateQueries({ queryKey: ['notifications-unread', user?.id] })
    },
  })

  const deleteNotification = useMutation({
    mutationFn: notificationApi.delete,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
      void queryClient.invalidateQueries({ queryKey: ['notifications-unread', user?.id] })
    },
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const getTypeColor = (type?: string) => {
    const t = type || ''
    if (t.includes('DELIVERED') || t.includes('COMPLETED')) return 'bg-green-500'
    if (t.includes('ASSIGNED') || t.includes('PLACED')) return 'bg-blue-500'
    if (t.includes('PICKED') || t.includes('TRANSIT')) return 'bg-amber-500'
    if (t.includes('ALERT') || t.includes('PRICE')) return 'bg-purple-500'
    return 'bg-slate-400'
  }

  return (
    <>
      <PageHeader
        title="Notifications"
        description="All your activity updates in one place."
        icon={Bell}
      />

      {unreadCount > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-slate-500">{unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</span>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="You'll see order updates, delivery status and price alerts here."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <AppCard key={notification.id}>
              <div
                className={cn(
                  'flex items-start gap-3 cursor-pointer',
                  !notification.isRead && 'opacity-100',
                  notification.isRead && 'opacity-70',
                )}
                onClick={() => !notification.isRead && markRead.mutate(notification.id)}
              >
                <div className={cn('mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full', getTypeColor(notification.type))} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-sm', !notification.isRead ? 'font-semibold text-slate-900' : 'font-medium text-slate-700')}>
                      {notification.title}
                    </p>
                    <span className="flex-shrink-0 text-xs text-slate-400">
                      {formatDistanceToNow(new Date(notification.sentAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{notification.message}</p>
                  {!notification.isRead && (
                    <span className="mt-1 inline-block text-xs text-blue-600 font-medium">● Unread</span>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex-shrink-0 text-slate-400 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNotification.mutate(notification.id)
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </AppCard>
          ))}
        </div>
      )}
    </>
  )
}