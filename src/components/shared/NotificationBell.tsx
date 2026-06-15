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
import type { Notification } from '@/types'

export function NotificationBell() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()

  // ✅ refetchInterval: 15s — auto polling
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications', user?.id],
    queryFn: () => notificationApi.getUserNotifications(user!.id),
    enabled: Boolean(user?.id),
    refetchInterval: 15000,
  })

  const { data: unreadNotifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications-unread', user?.id],
    queryFn: () => notificationApi.getUnread(user!.id),
    enabled: Boolean(user?.id),
    refetchInterval: 15000,
  })

  const unreadCount = unreadNotifications.length

  // ✅ Sort newest first (උඩටම අලුත්ම notification)
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
  )

  const markRead = useMutation({
    mutationFn: async (id: number) => {
      try {
        await notificationApi.markAsRead(id)
      } catch (err) {
        // ✅ Silent fail — backend endpoint missing/404 ignore කරනවා
        console.warn('markAsRead failed (silenced):', err)
      }
    },
    // ✅ Optimistic update — UI එක වහාම update වෙනවා, network call එක background එකේ
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['notifications', user?.id] })
      await queryClient.cancelQueries({ queryKey: ['notifications-unread', user?.id] })

      const prevAll = queryClient.getQueryData<Notification[]>(['notifications', user?.id])
      const prevUnread = queryClient.getQueryData<Notification[]>(['notifications-unread', user?.id])

      queryClient.setQueryData<Notification[]>(
        ['notifications', user?.id],
        (old = []) => old.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )

      queryClient.setQueryData<Notification[]>(
        ['notifications-unread', user?.id],
        (old = []) => old.filter((n) => n.id !== id)
      )

      return { prevAll, prevUnread }
    },
    onError: (_err, _id, ctx) => {
      // Rollback on error
      if (ctx?.prevAll) {
        queryClient.setQueryData(['notifications', user?.id], ctx.prevAll)
      }
      if (ctx?.prevUnread) {
        queryClient.setQueryData(['notifications-unread', user?.id], ctx.prevUnread)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
      void queryClient.invalidateQueries({ queryKey: ['notifications-unread', user?.id] })
    },
  })

  const markAllRead = useMutation({
    mutationFn: async () => {
      try {
        await notificationApi.markAllAsRead(user!.id)
      } catch (err) {
        console.warn('markAllAsRead failed (silenced):', err)
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications', user?.id] })
      await queryClient.cancelQueries({ queryKey: ['notifications-unread', user?.id] })

      const prevAll = queryClient.getQueryData<Notification[]>(['notifications', user?.id])
      const prevUnread = queryClient.getQueryData<Notification[]>(['notifications-unread', user?.id])

      queryClient.setQueryData<Notification[]>(
        ['notifications', user?.id],
        (old = []) => old.map((n) => ({ ...n, isRead: true }))
      )
      queryClient.setQueryData<Notification[]>(
        ['notifications-unread', user?.id],
        []
      )

      return { prevAll, prevUnread }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevAll) {
        queryClient.setQueryData(['notifications', user?.id], ctx.prevAll)
      }
      if (ctx?.prevUnread) {
        queryClient.setQueryData(['notifications-unread', user?.id], ctx.prevUnread)
      }
    },
    onSettled: () => {
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
              <span className="absolute right-0 top-0 flex h-2 w-2 rounded-full bg-red-500">
                {/* ✅ Pulsing dot for unread */}
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
            ) : null}
          </span>
          {/* ✅ Unread count badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1">
          <DropdownMenuLabel>
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-xs text-red-500 font-normal">({unreadCount} unread)</span>
            )}
          </DropdownMenuLabel>
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
        {sortedNotifications.length === 0 ? (
          <div className="py-4">
            <p className="text-center text-sm text-slate-500">All caught up! 🎉</p>
          </div>
        ) : (
          <>
            {sortedNotifications.slice(0, 5).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  'flex cursor-pointer flex-col items-start gap-1 p-3',
                  !notification.isRead && 'bg-brand-50/50',
                )}
                onClick={() => !notification.isRead && markRead.mutate(notification.id)}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <span className="font-medium text-slate-900 text-sm">{notification.title}</span>
                  {!notification.isRead && (
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                  )}
                </div>
                <span className="text-xs text-slate-500 line-clamp-2">{notification.message}</span>
                <span className="text-xs text-slate-400">
                  {formatDistanceToNow(new Date(notification.sentAt), { addSuffix: true })}
                </span>
              </DropdownMenuItem>
            ))}
            {/* ✅ View All link */}
            {sortedNotifications.length > 5 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-center text-xs text-brand-600 cursor-pointer justify-center py-2"
                  onClick={() => (window.location.href = '/notifications')}
                >
                  View all {sortedNotifications.length} notifications →
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}