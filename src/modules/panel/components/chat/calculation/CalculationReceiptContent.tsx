import type { ReactNode } from 'react'
import { FORMAT_ARS, FORMAT_PERCENT, HAS_RESULT } from './calculation.utils'
import type { ICalculationState } from '../../../../../core/interfaces/ICalculationState'

interface ICalculationReceiptContentProps {
  calculation: ICalculationState
  elementId: string
}

interface IReceiptRowProps {
  label: string
  value: string
  valueClassName?: string
}

// FILA REUTILIZABLE DEL RECIBO.
const ReceiptRow = ({ label, value, valueClassName = 'text-text-primary' }: IReceiptRowProps): ReactNode => (
  <div className="flex justify-between p-2 rounded-lg hover:bg-bg-input/50 transition-colors">
    <span className="text-text-secondary">{label}</span>
    <span className={`font-semibold font-display ${valueClassName}`}>{value}</span>
  </div>
)

// RECIBO IMPRIMIBLE ARMADO A PARTIR DEL RESULTADO QUE ENTREGA EL BACKEND.
const CalculationReceiptContent = ({ calculation, elementId }: ICalculationReceiptContentProps): ReactNode => {
  if (!HAS_RESULT(calculation)) return null

  const { input, result } = calculation
  const hasVouchers: boolean = result ? result.factoryVoucherInvoiced !== 0 || result.factoryVoucherFixed !== 0 || result.otherVoucherTotal !== 0 : false
  const hasExpenses: boolean = (input.gas ?? 0) > 0 || (input.fuel ?? 0) > 0

  return (
    <div id={elementId} className="w-full bg-bg-card p-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <img src="/logo.png" alt="LiquidChofer" className="h-11 w-11 rounded-xl" />
        </div>
        <h1 className="text-2xl font-black text-text-primary font-display tracking-tight">LiquidChofer</h1>
        <p className="text-xs text-text-muted mt-1 font-display">Resumen de jornada</p>
        <div className="subtle-divider mt-4" />
      </div>

      <div className="border border-border-subtle rounded-xl p-4 space-y-3 text-sm bg-bg-card-subtle">
        <div className="flex justify-between items-baseline p-2 rounded-lg bg-bg-input">
          <span className="text-text-secondary font-medium">Ganancia del día</span>
          <span className="text-xl font-black text-text-primary font-display">{FORMAT_ARS(result?.profit ?? 0)}</span>
        </div>

        <ReceiptRow label="Total facturado" value={FORMAT_ARS(result?.totalInvoiced ?? 0)} />

        <div className="subtle-divider" />

        <div className="space-y-2">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider font-display pl-2">
            Distribución
          </span>
          <ReceiptRow
            label={`Agencia (${FORMAT_PERCENT(input.agencyPercentage)})`}
            value={FORMAT_ARS(result?.agency ?? 0)}
            valueClassName="text-accent-amber"
          />
          <ReceiptRow
            label={`Conductor (${FORMAT_PERCENT(input.driverPercentage)})`}
            value={FORMAT_ARS(result?.driver ?? 0)}
            valueClassName="text-accent-teal"
          />
          {result?.vehicle !== null && (
            <ReceiptRow
              label={`Vehículo (${FORMAT_PERCENT(input.vehiclePercentage)})`}
              value={FORMAT_ARS(result?.vehicle)}
              valueClassName={result ? result.vehicle >= 0 ? 'text-accent-teal' : 'text-accent-red' : 'text-accent-red'}
            />
          )}
        </div>

        {hasVouchers && (
          <>
            <div className="subtle-divider" />
            <div className="space-y-2">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider font-display pl-2">
                Vales
              </span>
              <ReceiptRow label="Facturación fábrica" value={FORMAT_ARS(result?.factoryVoucherInvoiced)} />
              <ReceiptRow label="Fijo planilla" value={FORMAT_ARS(result?.factoryVoucherFixed)} />
              <ReceiptRow label="Otros vales" value={FORMAT_ARS(result?.otherVoucherTotal)} />
            </div>
          </>
        )}

        {hasExpenses && (
          <>
            <div className="subtle-divider" />
            <div className="space-y-2">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider font-display pl-2">
                Gastos
              </span>
              {(input.gas ?? 0) > 0 && (
                <ReceiptRow label="Gas" value={FORMAT_ARS(input.gas)} valueClassName="text-accent-red" />
              )}
              {(input.fuel ?? 0) > 0 && (
                <ReceiptRow label="Nafta" value={FORMAT_ARS(input.fuel)} valueClassName="text-accent-red" />
              )}
            </div>
          </>
        )}
      </div>

      <div className="mt-5 text-center text-xs text-text-muted font-display">
        Generado por LiquidChofer &mdash; {new Date().toLocaleDateString('es-AR')}
      </div>
    </div>
  )
}

export default CalculationReceiptContent
