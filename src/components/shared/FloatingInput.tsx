import * as React from 'react'
import { Check, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  success?: boolean
  helperText?: string
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  onRightIconClick?: () => void
}

export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  (
    {
      label,
      error,
      success,
      helperText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      onRightIconClick,
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
    const hasError = Boolean(error)

    return (
      <div className="relative w-full">
        <div className="relative">
          {LeftIcon ? (
            <LeftIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          ) : null}
          <Input
            ref={ref}
            id={inputId}
            placeholder=" "
            className={cn(
              'peer pt-5',
              LeftIcon && 'pl-10',
              (RightIcon || success) && 'pr-10',
              hasError && 'border-red-500 focus-visible:ring-red-500',
              success && 'border-green-500 focus-visible:ring-green-500',
              className,
            )}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          <label
            htmlFor={inputId}
            className={cn(
              'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 transition-all',
              'peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-brand-600',
              'peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs',
              LeftIcon && 'left-10',
              hasError && 'text-red-500 peer-focus:text-red-500',
            )}
          >
            {label}
          </label>
          {success ? (
            <Check className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-green-500" />
          ) : RightIcon ? (
            <button
              type="button"
              onClick={onRightIconClick}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              <RightIcon className="h-5 w-5" />
            </button>
          ) : null}
        </div>
        {hasError ? (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-500" role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-slate-500">
            {helperText}
          </p>
        ) : null}
      </div>
    )
  },
)
FloatingInput.displayName = 'FloatingInput'
