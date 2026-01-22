import { AlertCircle, Check } from 'lucide-react'
import { cn } from '~/lib/utils'
import { Button } from '~/components/ui/button'

export interface Step {
  title: string
  description: string
  status: 'pending' | 'success' | 'error' | 'disabled'
}

interface StepperProps {
  currentStep: number
  onStepClick: (step: number) => void
  steps: Step[]
}

export function Stepper({ currentStep, onStepClick, steps }: StepperProps) {
  return (
    <div className="w-full">
      <div className="relative mt-6">
        <div className="absolute left-0 top-[15px] h-0.5 w-full bg-muted" />
        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <div key={step.title} className="flex flex-col items-center">
              <Button
                variant="ghost"
                type="button"
                onClick={() => onStepClick(index)}
                disabled={step.status === 'disabled'}
                className={cn(
                  'relative flex h-8 w-8 items-center justify-center rounded-full border-2 p-0 focus:ring-2',
                  {
                    'border-destructive bg-destructive text-destructive-foreground focus:ring-destructive':
                      step.status === 'error',
                    'border-primary bg-primary text-primary-foreground focus:ring-primary':
                      index <= currentStep && step.status !== 'disabled' && step.status !== 'error',
                    'border-muted-foreground/30 bg-background focus:ring-muted-foreground/30':
                      index > currentStep && step.status !== 'disabled' && step.status !== 'error',
                    'cursor-not-allowed border-muted bg-muted text-muted-foreground':
                      step.status === 'disabled',
                  }
                )}
                aria-current={index === currentStep ? 'step' : undefined}
                aria-label={`Ir para o passo ${index + 1}: ${step.title}`}
              >
                {step.status === 'success' && <Check className="h-4 w-4" />}
                {step.status === 'error' && <AlertCircle className="h-4 w-4" />}
                {(step.status === 'pending' || step.status === 'disabled') && index + 1}
              </Button>
              <div className="mt-2 text-center">
                <div
                  className={cn('text-sm font-medium', {
                    'text-muted-foreground': step.status === 'disabled',
                  })}
                >
                  {step.title}
                </div>
                <div
                  className={cn('text-xs', {
                    'text-muted-foreground': step.status !== 'disabled',
                    'text-muted-foreground/60': step.status === 'disabled',
                  })}
                >
                  {step.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
