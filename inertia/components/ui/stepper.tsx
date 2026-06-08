'use client'

import { Check } from 'lucide-react'

import { cn } from '~/lib/utils'

interface Step {
  title: string
  description?: string
}

interface StepperProps {
  steps: Step[]
  /** Index do step atual (0-based). */
  currentStep: number
  /** Quando true, steps concluídos mostram check em vez do número. */
  showCompletedCheckmark?: boolean
  className?: string
  onStepClick?: (stepIndex: number) => void
}

export function Stepper({
  steps,
  currentStep,
  showCompletedCheckmark = false,
  className,
  onStepClick,
}: StepperProps) {
  const currentStepTitle = steps[currentStep]?.title ?? ''
  return (
    <nav aria-label="Progress" className={cn('w-full', className)}>
      <div
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuetext={`Passo ${currentStep + 1} de ${steps.length}: ${currentStepTitle}`}
        className="sr-only"
      >
        {`Passo ${currentStep + 1} de ${steps.length}: ${currentStepTitle}`}
      </div>
      <ol className="flex items-start justify-between gap-2">
        {steps.map((step, index) => {
          const isComplete = currentStep > index
          const isCurrent = currentStep === index
          const isFuture = currentStep < index
          return (
            <li key={step.title} className="relative flex flex-1 flex-col items-center min-w-0">
              {/* Connector line — fica atrás do círculo (z-0) */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'absolute top-4 left-[calc(50%+1rem)] right-[calc(-50%+1rem)] h-px transition-colors',
                    isComplete ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}

              <button
                type="button"
                onClick={() => onStepClick?.(index)}
                disabled={!onStepClick}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors bg-background',
                  isComplete && 'border-primary bg-primary text-primary-foreground',
                  isCurrent && 'border-primary text-primary',
                  isFuture && 'border-border text-muted-foreground',
                  onStepClick && 'cursor-pointer hover:border-primary hover:text-primary'
                )}
              >
                {isComplete && showCompletedCheckmark ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : (
                  index + 1
                )}
              </button>

              <div className="mt-2 text-center">
                <p
                  className={cn(
                    'text-xs font-medium truncate',
                    isFuture ? 'text-muted-foreground' : 'text-foreground'
                  )}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p
                    className={cn(
                      'text-xs hidden sm:block truncate',
                      isFuture ? 'text-muted-foreground/70' : 'text-muted-foreground'
                    )}
                  >
                    {step.description}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
