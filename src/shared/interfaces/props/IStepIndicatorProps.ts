export interface IStepIndicatorProps {
  currentStep: number
  totalSteps: number
  labels: string[]
  // RECIBO EL PASO (1-BASED) QUE DEBE PULSAR; SOLO EL ACTUAL LLEVA ANIMACION
  attentionStep?: number | null
  // RECIBO LA VALIDACION DEL PASO ACTUAL PARA EL PULSO DEL SIGUIENTE INMEDIATO
  isCurrentStepValid?: boolean
  // SOLO HABILITA SALTO HACIA ADELANTE SI LOS PASOS INTERMEDIOS SON VALIDOS
  canSkipToStep?: (step: number) => boolean
  // RECIBO EL PASO DESTINO (1-BASED) PARA VOLVER DESDE CUALQUIER PASO PREVIO
  onPreviousStepClick?: (step: number) => void
  // RECIBO EL PASO DESTINO (1-BASED) PARA AVANZAR DESDE EL PROPIO NUMERO
  onNextStepClick?: (step: number) => void
}