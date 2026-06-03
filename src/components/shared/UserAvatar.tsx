import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
  showOnline?: boolean
  className?: string
}

export function UserAvatar({ name, src, size = 'md', showOnline, className }: UserAvatarProps) {
  return (
    <div className={cn('relative inline-block', className)}>
      <Avatar size={size}>
        {src ? <AvatarImage src={src} alt={name} /> : null}
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      {showOnline ? (
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
      ) : null}
    </div>
  )
}
