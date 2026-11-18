import { memo, useCallback, useState, type ReactNode } from 'react'
import { AlertCircle, Calculator, CheckCircle2, Check, Eye } from 'lucide-react'
import type { ICalculationState } from '../../../../../core/interfaces/ICalculationState'
import { FORMAT_ARS, FORMAT_MISSING_FIELDS, FORMAT_PERCENT, HAS_RESULT } from './calculation.utils'
import CalculationReceiptModal from './CalculationReceiptModal'

interface ICalculationCardProps {
  calculation: ICalculationState
  conversationId: string
  canConfirm: boolean
  confirmDisabled: boolean
  onConfirm: (conversationId: string) => Promise<boolean>
  onSave: (calculation: ICalculationState) => void
  isSaved: boolean
}

interface ISummaryRowProps {
  label: string
  value: string
  valueClassName?: string
}

// FILA COMPACTA DE RESUMEN DENTRO DE LA BURBUJA.
const SummaryRow = ({ label, value, valueClassName = 'text-text-primary' }: ISummaryRowProps): ReactNode => (
  <div className="flex items-center justify-between gap-3 py-0.5">
    <span className="text-xs text-text-secondary">{label}</span>
    <span className={`text-xs font-semibold font-display ${valueClassName}`}>{value}</span>
  </div>
)

// LISTA DE DATOS FALTANTES PARA GUIAR AL USUARIO.
const MissingFields = ({ fields }: { fields: string[] }): ReactNode => {
  const labels: string[] = FORMAT_MISSING_FIELDS(fields)
  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-accent-red/90 font-display">
        Datos necesarios
      </span>
      <ul className="flex flex-wrap gap-1.5">
        {labels.map((label) => (
          <li
            key={label}
            className="rounded-full border border-accent-red/25 bg-accent-red/10 px-2 py-0.5 text-[11px] font-medium text-accent-red"
          >
            {label}
          </li>
        ))}
      </ul>
    </div>
  )
}

// TARJETA DE CALCULO ASOCIADA A UN MENSAJE DEL ASISTENTE.
const CalculationCard = ({
  calculation,
  conversationId,
  canConfirm,
  confirmDisabled,
  onConfirm,
  onSave,
  isSaved,
}: ICalculationCardProps): ReactNode => {
  const [isConfirming, setIsConfirming] = useState<boolean>(false)
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false)

  const HANDLE_OPEN_RECEIPT = useCallback((): void => setIsReceiptOpen(true), [])
  const HANDLE_CLOSE_RECEIPT = useCallback((): void => setIsReceiptOpen(false), [])

  const HANDLE_CONFIRM = useCallback(async (): Promise<void> => {
    if (confirmDisabled || isConfirming) return
    setIsConfirming(true)
    try {
      await onConfirm(conversationId)
    } finally {
      setIsConfirming(false)
    }
  }, [confirmDisabled, isConfirming, onConfirm, conversationId])

  const HANDLE_CONFIRM_CLICK = (): void => {
    void HANDLE_CONFIRM()
  }

  const { input } = calculation
  const showVehicle: boolean = input.vehicleRented === true && input.vehiclePercentage !== undefined

  if (calculation.status === 'needs_data') {
    return (
      <div className="mt-3 rounded-xl border border-accent-red/20 bg-accent-red/5 p-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-accent-red" aria-hidden="true" />
          <span className="text-xs font-bold text-accent-red font-display">Faltan datos para calcular</span>
        </div>
        <MissingFields fields={calculation.missingFields} />
      </div>
    )
  }

  if (calculation.status === 'offer') {
    return (
      <div className="mt-3 rounded-xl border border-accent-violet/25 bg-accent-violet/10 p-3">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-accent-violet" aria-hidden="true" />
          <span className="text-xs font-bold text-accent-violet font-display">Cálculo listo para confirmar</span>
        </div>

        <div className="mt-2 space-y-0.5">
          {input.totalInvoiced !== undefined && (
            <SummaryRow label="Total facturado" value={FORMAT_ARS(input.totalInvoiced)} />
          )}
          {input.agencyPercentage !== undefined && (
            <SummaryRow label="Agencia" value={FORMAT_PERCENT(input.agencyPercentage)} />
          )}
          {input.driverPercentage !== undefined && (
            <SummaryRow label="Conductor" value={FORMAT_PERCENT(input.driverPercentage)} />
          )}
          {showVehicle && (
            <SummaryRow label="Vehículo" value={FORMAT_PERCENT(input.vehiclePercentage)} />
          )}
          {(input.gas ?? 0) > 0 && <SummaryRow label="Gas" value={FORMAT_ARS(input.gas)} />}
          {(input.fuel ?? 0) > 0 && <SummaryRow label="Nafta" value={FORMAT_ARS(input.fuel)} />}
        </div>

        {canConfirm ? (
          <button
            type="button"
            onClick={HANDLE_CONFIRM_CLICK}
            disabled={confirmDisabled || isConfirming}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-accent-violet px-3 py-2 text-xs font-bold text-white shadow-glow-violet transition-colors cursor-pointer hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            {isConfirming ? 'Confirmando...' : 'Confirmar cálculo'}
          </button>
        ) : (
          <p className="mt-2 text-[11px] text-text-muted">Esta oferta fue reemplazada por un cálculo más reciente.</p>
        )}
      </div>
    )
  }

  if (calculation.status === 'completed' && HAS_RESULT(calculation)) {
    const { result } = calculation
    return (
      <>
        <div className="mt-3 rounded-xl border border-accent-teal/25 bg-accent-teal/5 p-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-accent-teal" aria-hidden="true" />
            <span className="text-xs font-bold text-accent-teal font-display">Cálculo completado</span>
          </div>

          <div className="mt-2 rounded-lg bg-bg-input px-2.5 py-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-text-secondary">Ganancia del día</span>
              <span className="text-base font-black text-text-primary font-display">{FORMAT_ARS(result.profit)}</span>
            </div>
          </div>

          <div className="mt-2 space-y-0.5">
            <SummaryRow label="Agencia" value={FORMAT_ARS(result.agency)} valueClassName="text-accent-amber" />
            <SummaryRow label="Conductor" value={FORMAT_ARS(result.driver)} valueClassName="text-accent-teal" />
            {result.vehicle !== null && (
              <SummaryRow
                label="Vehículo"
                value={FORMAT_ARS(result.vehicle)}
                valueClassName={result.vehicle >= 0 ? 'text-accent-teal' : 'text-accent-red'}
              />
            )}
          </div>

          <button
            type="button"
            onClick={HANDLE_OPEN_RECEIPT}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-accent-teal/30 bg-accent-teal/10 px-3 py-2 text-xs font-bold text-accent-teal transition-colors cursor-pointer hover:bg-accent-teal/20"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            Ver recibo
          </button>
        </div>

        <CalculationReceiptModal
          calculation={calculation}
          isOpen={isReceiptOpen}
          onClose={HANDLE_CLOSE_RECEIPT}
          onSave={onSave}
          isSaved={isSaved}
        />
      </>
    )
  }

  return null
}

export default memo(CalculationCard)
