import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { Bell, CheckCheck } from 'lucide-react'
import { notificationApi } from '@/api/notification.api'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => notificationApi.getUserNotifications(user!.id),
    enabled: Boolean(user?.id),
  })

  const { data: unreadNotifications = [] } = useQuery({
    queryKey: ['notifications-unread', user?.id],
    queryFn: () => notificationApi.getUnread(user!.id),
    enabled: Boolean(user?.id),
  })

  const unreadCount = unreadNotifications.length

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

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <span className="relative inline-flex">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 ? (
              <span className="absolute right-0 top-0 flex h-2 w-2 rounded-full bg-red-500" />
            ) : null}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          {unreadCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => markAllRead.mutate()}
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </Button>
          ) : null}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="py-4">
            <p className="text-center text-sm text-slate-500">All caught up! 🎉</p>
          </div>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={cn(
                'flex cursor-pointer flex-col items-start gap-1 p-3',
                !notification.isRead && 'bg-brand-50/50',
              )}
              onClick={() => !notification.isRead && markRead.mutate(notification.id)}
            >
              <span className="font-medium text-slate-900">{notification.title}</span>
              <span className="text-xs text-slate-500 line-clamp-2">{notification.message}</span>
              <span className="text-xs text-slate-400">
                {formatDistanceToNow(new Date(notification.sentAt), { addSuffix: true })}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
