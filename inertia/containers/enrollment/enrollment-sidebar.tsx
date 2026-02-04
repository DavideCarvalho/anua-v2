import { Check, AlertCircle } from 'lucide-react'
import { cn } from '~/lib/utils'

export type StepStatus = 'pending' | 'success' | 'error' | 'disabled'

export interface EnrollmentStep {
  title: string
  description: string
  status: StepStatus
}

interface EnrollmentSidebarProps {
  steps: EnrollmentStep[]
  currentStep: number
  onStepClick: (index: number) => void
}

export function EnrollmentSidebar({ steps, currentStep, onStepClick }: EnrollmentSidebarProps) {
  return (
    <>
      {/* Mobile: compact top bar */}
      <div className="flex items-center gap-2 border-b px-4 py-3 lg:hidden">
        <span className="text-sm font-medium text-muted-foreground">
          Etapa {currentStep + 1} de {steps.length}
        </span>
        <span className="text-sm font-medium">{steps[currentStep]?.title}</span>
      </div>

      {/* Desktop: vertical sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-muted/30 p-6 lg:block">
        <nav aria-label="Etapas da matrícula">
          <ol className="flex flex-col gap-1">
            {steps.map((step, index) => {
              const isActive = index === currentStep
              const isDisabled = step.status === 'disabled'

              return (
                <li key={step.title}>
                  <button
                    type="button"
                    onClick={() => onStepClick(index)}
                    disabled={isDisabled}
                    aria-current={isActive ? 'step' : undefined}
                    aria-label={`Ir para etapa ${index + 1}: ${step.title}`}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors',
                      isActive && 'bg-primary/10',
                      isDisabled && 'opacity-40 cursor-not-allowed',
                      !isActive && !isDisabled && 'hover:bg-muted/50'
                    )}
                  >
                    <StepCircle index={index} status={step.status} isActive={isActive} />
                    <div className="min-w-0 pt-0.5">
                      <p
                        className={cn(
                          'text-sm font-medium leading-tight',
                          isDisabled && 'text-muted-foreground'
                        )}
                      >
                        {step.title}
                      </p>
                      <p
                        className={cn(
                          'mt-0.5 text-xs leading-tight',
                          isDisabled ? 'text-muted-foreground/60' : 'text-muted-foreground'
                        )}
                      >
                        {step.description}
                      </p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>
      </aside>
    </>
  )
}

function StepCircle({
  index,
  status,
  isActive,
}: {
  index: number
  status: StepStatus
  isActive: boolean
}) {
  return (
    <div
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold',
        status === 'success' && 'border-primary bg-primary text-primary-foreground',
        status === 'error' && 'border-destructive bg-destructive text-destructive-foreground',
        status !== 'success' && status !== 'error' && isActive && 'border-primary text-primary',
        status !== 'success' &&
          status !== 'error' &&
          !isActive &&
          'border-muted-foreground/30 text-muted-foreground/50'
      )}
    >
      {status === 'success' && <Check className="h-4 w-4" />}
      {status === 'error' && <AlertCircle className="h-4 w-4" />}
      {status !== 'success' && status !== 'error' && index + 1}
    </div>
  )
}
