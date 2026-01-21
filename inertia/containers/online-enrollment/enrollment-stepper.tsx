import { Check } from 'lucide-react'
import { cn } from '../../lib/utils'

interface Step {
  id: number
  title: string
  description: string
}

interface EnrollmentStepperProps {
  steps: Step[]
  currentStep: number
}

export function EnrollmentStepper({ steps, currentStep }: EnrollmentStepperProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => (
          <li key={step.id} className="relative flex flex-col items-center flex-1">
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'absolute top-4 left-1/2 w-full h-0.5',
                  currentStep > step.id ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}

            {/* Step circle */}
            <div
              className={cn(
                'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
                currentStep > step.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : currentStep === step.id
                    ? 'border-primary bg-background text-primary'
                    : 'border-muted bg-background text-muted-foreground'
              )}
            >
              {currentStep > step.id ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-sm font-medium">{step.id}</span>
              )}
            </div>

            {/* Step label */}
            <div className="mt-2 text-center">
              <p
                className={cn(
                  'text-xs font-medium',
                  currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {step.title}
              </p>
              <p className="text-xs text-muted-foreground hidden sm:block">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}
