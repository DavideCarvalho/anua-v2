import { Check } from 'lucide-react'
import { cn } from '~/lib/utils'

interface Step {
  title: string
  description: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (stepIndex: number) => void
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="flex items-center justify-center">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep

        return (
          <div key={step.title} className="flex items-center">
            <button
              type="button"
              onClick={() => onStepClick?.(index)}
              disabled={!onStepClick || isCurrent}
              className="flex flex-col items-center disabled:cursor-default"
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
                  isCompleted && 'border-primary bg-primary text-primary-foreground',
                  isCurrent && 'border-primary text-primary',
                  !isCompleted && !isCurrent && 'border-muted-foreground/25 text-muted-foreground',
                  onStepClick && !isCurrent && 'hover:border-primary hover:text-primary'
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    'text-sm font-medium',
                    (isCompleted || isCurrent) && 'text-foreground',
                    !isCompleted && !isCurrent && 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </button>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'mx-4 h-0.5 w-16',
                  index < currentStep ? 'bg-primary' : 'bg-muted-foreground/25'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
