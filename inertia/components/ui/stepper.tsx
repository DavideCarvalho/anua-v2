'use client'

import { cn } from '~/lib/utils'

interface Step {
  title: string
  description?: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-center gap-32">
        {steps.map((step, index) => (
          <div key={step.title} className="relative flex flex-col items-center">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium',
                currentStep > index
                  ? 'border-primary bg-primary text-primary-foreground'
                  : currentStep === index
                    ? 'border-primary text-primary'
                    : 'border-muted-foreground/30 text-muted-foreground/50'
              )}
            >
              {index + 1}
            </div>
            <div className="mt-2 text-center">
              <div
                className={cn(
                  'text-sm font-medium',
                  currentStep >= index ? 'text-foreground' : 'text-muted-foreground/50'
                )}
              >
                {step.title}
              </div>
              {step.description && (
                <div
                  className={cn(
                    'text-xs',
                    currentStep >= index ? 'text-muted-foreground' : 'text-muted-foreground/50'
                  )}
                >
                  {step.description}
                </div>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'absolute left-full top-4 h-0.5 w-32 -translate-y-1/2',
                  currentStep > index ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
