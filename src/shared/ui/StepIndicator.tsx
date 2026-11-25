import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import type { IStepIndicatorProps } from '../interfaces/props/IStepIndicatorProps'

const StepIndicator = ({
  currentStep,
  totalSteps,
  labels,
  attentionStep,
  isCurrentStepValid = false,
  canSkipToStep,
  onPreviousStepClick,
  onNextStepClick,
}: IStepIndicatorProps): ReactNode => {
  return (
    <div className="flex items-center justify-center gap-1 md:gap-2 mb-6">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step: number = i + 1
        const isRouteCurrent: boolean = step === currentStep
        // VERDE SOLO PARA PASOS YA VISITADOS; EL CHECK NO APARECE EN EL PASO ACTUAL
        const isCompleted: boolean = step < currentStep
        // VIOLETA SIEMPRE EN EL PASO DONDE ESTAMOS PARADOS
        const isHighlighted: boolean = step === currentStep
        const isPulsing: boolean = step === attentionStep
        // CUALQUIER PASO PREVIO ES NAVEGABLE, SIN IMPORTAR EL ORDEN
        const isPreviousClickable: boolean = step < currentStep && Boolean(onPreviousStepClick)
        // AVANZAR A CUALQUIER NUMERO SOLO SI LOS PASOS INTERMEDIOS YA SON VALIDOS
        const isForwardClickable: boolean = step > currentStep && Boolean(onNextStepClick) && (
          canSkipToStep ? canSkipToStep(step) : step === currentStep + 1 && isCurrentStepValid
        )
        // EL ANILLO DEL PULSO SIEMPRE ES VIOLETA PORQUE SOLO PULSA EL PASO ACTUAL
        const pulseRingClass: string = isPulsing ? '[--step-pulse-ring:var(--color-accent-violet)]' : ''

        // CONSTRUYO EL CIRCULO UNA SOLA VEZ Y LO ENVUELVO EN BOTON SOLO SI ES NAVEGABLE
        const circleClassName = `flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full text-xs md:text-sm font-bold font-display transition-all duration-300 ${
          isCompleted
            ? `bg-accent-green text-white ${isPreviousClickable ? 'ring-1 ring-accent-green/40 group-hover:ring-accent-green/70 group-active:ring-accent-green group-active:brightness-110' : ''}`
            : isHighlighted
              ? 'bg-accent-violet text-white shadow-glow-violet ring-2 ring-accent-violet/40'
              : isForwardClickable
                ? 'border border-accent-blue-soft/60 bg-bg-hover text-accent-blue-soft group-hover:border-accent-blue-soft group-hover:bg-accent-blue-soft/10 group-active:border-accent-blue-soft group-active:bg-accent-blue-soft/20'
                : 'border border-border-subtle bg-bg-hover text-text-muted'
        } ${isPulsing ? 'animate-step-pulse' : ''} ${pulseRingClass}`
        const circle: ReactNode = (
          <div className={circleClassName} aria-current={isRouteCurrent ? 'step' : undefined}>
            {isCompleted ? (
              <Check className="h-4 w-4 md:h-4.5 md:w-4.5" aria-hidden="true" />
            ) : (
              step
            )}
          </div>
        )
        const clickHandler: (() => void) | undefined = isPreviousClickable
          ? () => onPreviousStepClick?.(step)
          : isForwardClickable
            ? () => onNextStepClick?.(step)
            : undefined
        const clickLabel: string = `${isPreviousClickable ? 'Volver' : 'Ir'} al paso ${step}: ${labels[i]}`

        return (
          <div key={step} className="flex items-center gap-1 md:gap-2">
            <div className="flex flex-col items-center gap-1">
              {isPreviousClickable || isForwardClickable ? (
                <button
                  type="button"
                  onClick={clickHandler}
                  aria-label={clickLabel}
                  className={`-m-1.5 flex min-h-11 min-w-11 touch-manipulation cursor-pointer items-center justify-center rounded-full transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 md:-m-1 group ${
                    isPreviousClickable ? 'focus-visible:ring-accent-green/70' : 'focus-visible:ring-accent-blue-soft/70'
                  }`}
                >
                  {circle}
                </button>
              ) : circle}
              <span
                className={`hidden md:block text-[11px] font-medium font-display transition-colors duration-300 ${
                  isHighlighted
                    ? 'text-accent-violet'
                    : isCompleted
                      ? 'text-accent-green'
                      : isForwardClickable
                        ? 'text-accent-blue-soft'
                        : 'text-text-muted'
                }`}
              >
                {labels[i]}
              </span>
            </div>
            {step < totalSteps && (
              <div
                className={`h-0.5 w-6 md:w-10 rounded-full transition-all duration-300 ${
                  isCompleted ? 'bg-accent-green' : 'bg-border-subtle'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default StepIndicator
