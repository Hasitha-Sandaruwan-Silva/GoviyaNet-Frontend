import { cn } from '@/lib/utils'

interface StepProgressProps {
  steps: string[]
  currentStep: number
  className?: string
}

export function StepProgress({ steps, currentStep, className }: StepProgressProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isActive = stepNumber === currentStep
          const isComplete = stepNumber < currentStep

          return (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                    isComplete && 'bg-brand-500 text-white',
                    isActive && 'bg-brand-500 text-white ring-4 ring-brand-100',
                    !isComplete && !isActive && 'bg-slate-200 text-slate-500',
                  )}
                >
                  {isComplete ? '✓' : stepNumber}
                </div>
                <span
                  className={cn(
                    'mt-2 hidden text-xs sm:block',
                    isActive ? 'font-medium text-brand-600' : 'text-slate-500',
                  )}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <div
                  className={cn(
                    'mx-2 h-0.5 flex-1 transition-colors',
                    isComplete ? 'bg-brand-500' : 'bg-slate-200',
                  )}
                />
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
