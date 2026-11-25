import { useState, type ReactNode } from 'react'
import {
  Building2,
  CarFront,
  ChevronDown,
  Clock,
  Info,
  RotateCcw,
  ShieldCheck,
  Ticket,
  Trash,
  UserRound,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import type { IVoucherDetail } from '../../../core/interfaces/IVoucherDetail'
import type {
  IJourneyVerificationAmounts,
  IJourneyVerificationResponse,
  TJourneyVerificationStatus,
} from '../../../core/types/journeyHistory'
import { FORMAT_JOURNEY_DATE, FORMAT_TIMESTAMP_DATE_TIME } from '../../../shared/lib/journey'

const ARS_FORMATTER = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const FORMAT_ARS = (value: number): string => ARS_FORMATTER.format(value)

interface IStatusMeta {
  label: string
  detail: string
  icon: LucideIcon
  tone: string
}

const STATUS_META: Record<TJourneyVerificationStatus, IStatusMeta> = {
  active: {
    label: 'Constancia vigente',
    detail: 'Esta constancia es la vigente para la jornada.',
    icon: ShieldCheck,
    tone: 'text-accent-teal border-accent-teal/30 bg-accent-teal/10',
  },
  replaced: {
    label: 'Constancia reemplazada',
    detail:
      'Existe una constancia más reciente para la misma fecha. Estos importes son de una versión anterior.',
    icon: RotateCcw,
    tone: 'text-accent-amber border-accent-amber/30 bg-accent-amber/10',
  },
  deleted: {
    label: 'Constancia eliminada',
    detail: 'El autor dio de baja esta constancia. Los importes se conservan solo para auditoría.',
    icon: Trash,
    tone: 'text-accent-red border-accent-red/30 bg-accent-red/10',
  },
}

interface IDeductions {
  total: number
  vouchers: number | null
  fuel: number | null
}

interface IDistributionRow {
  icon: LucideIcon
  label: string
  value: number
  tone: string
}

// EL DESCUENTO DE VALES ES EL FIJO DE FABRICA MAS EL TOTAL DE VALES "OTRO".
const VOUCHER_DEDUCTION = (vouchers: IVoucherDetail[]): number =>
  vouchers.reduce(
    (sum, voucher) =>
      sum + (voucher.type === 'factory' ? voucher.fixedFeeSubtotal : voucher.subtotal),
    0,
  )

// SI EL BACKEND NO MANDA EL DETALLE, NO INVENTO ORIGEN: SOLO CONOZCO EL DESCUENTO TOTAL.
const BUILD_DEDUCTIONS = (amounts: IJourneyVerificationAmounts): IDeductions => {
  const total: number = Math.max(0, amounts.agencyAmount - amounts.finalAgency)
  const hasVoucherDetail: boolean = Array.isArray(amounts.vouchers)
  const vouchers: number | null = hasVoucherDetail ? VOUCHER_DEDUCTION(amounts.vouchers ?? []) : null
  const fuel: number | null =
    typeof amounts.fuelFromAgency === 'number' && Number.isFinite(amounts.fuelFromAgency)
      ? Math.max(0, amounts.fuelFromAgency)
      : hasVoucherDetail
        ? Math.max(0, total - (vouchers ?? 0))
        : null

  return { total, vouchers, fuel }
}

const DISTRIBUTION_ROWS = (amounts: IJourneyVerificationAmounts): IDistributionRow[] => {
  const rows: IDistributionRow[] = [
    {
      icon: Building2,
      label: `Agencia (${amounts.agencyPercent}%)`,
      value: amounts.finalAgency,
      tone: amounts.finalAgency >= 0 ? 'text-accent-amber' : 'text-accent-red',
    },
    {
      icon: UserRound,
      label: `Conductor (${amounts.driverPercent}%)`,
      value: amounts.driverAmount,
      tone: amounts.driverAmount >= 0 ? 'text-accent-teal' : 'text-accent-red',
    },
  ]

  if (amounts.carPercent !== null && amounts.carAmount !== null) {
    rows.push({
      icon: CarFront,
      label: `Vehículo (${amounts.carPercent}%)`,
      value: amounts.carAmount,
      tone: amounts.carAmount >= 0 ? 'text-accent-violet' : 'text-accent-red',
    })
  }

  return rows
}

// DETALLE DE UNA CONSTANCIA: JERARQUIA CLARA, LENGUAJE SIMPLE Y DESGLOSE OPCIONAL.
const VerificationDetails = ({ result }: { result: IJourneyVerificationResponse }): ReactNode => {
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false)
  const statusMeta: IStatusMeta = STATUS_META[result.status]
  const StatusIcon: LucideIcon = statusMeta.icon
  const amounts: IJourneyVerificationAmounts | null = result.amounts
  const deductions: IDeductions | null = amounts ? BUILD_DEDUCTIONS(amounts) : null
  const distributionRows: IDistributionRow[] = amounts ? DISTRIBUTION_ROWS(amounts) : []
  const vouchers: IVoucherDetail[] = amounts?.vouchers ?? []

  return (
    <div className="card-glass rounded-xl overflow-hidden animate-fade-in-up">
      <div className={`flex items-start gap-3 border-b p-5 ${statusMeta.tone}`}>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-bg-deep/20">
          <StatusIcon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-bold font-display">{statusMeta.label}</h2>
          <p className="mt-1 text-sm opacity-90">{statusMeta.detail}</p>
        </div>
      </div>

      <div className="p-5">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border-subtle bg-bg-card-subtle p-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-text-muted font-display">
              Fecha de la jornada
            </dt>
            <dd className="mt-1 text-sm font-semibold text-text-primary">
              {FORMAT_JOURNEY_DATE(result.journeyDate)}
            </dd>
          </div>
          <div className="rounded-lg border border-border-subtle bg-bg-card-subtle p-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-text-muted font-display">
              Emitida
            </dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-text-primary">
              <Clock className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
              {FORMAT_TIMESTAMP_DATE_TIME(result.createdAt)}
            </dd>
          </div>
          {result.deletedAt && (
            <div className="rounded-lg border border-border-subtle bg-bg-card-subtle p-3 sm:col-span-2">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-text-muted font-display">
                Dada de baja
              </dt>
              <dd className="mt-1 text-sm font-semibold text-text-primary">
                {FORMAT_TIMESTAMP_DATE_TIME(result.deletedAt)}
              </dd>
            </div>
          )}
        </dl>

        {amounts ? (
          <>
            <div className="mt-5 rounded-xl border border-accent-teal/25 bg-accent-teal/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
                  <Wallet className="h-4 w-4 text-accent-teal" aria-hidden="true" />
                  Ganancia del día
                </span>
                <span className="font-mono text-xl font-black text-text-primary">
                  {FORMAT_ARS(amounts.adjustedTotal)}
                </span>
              </div>
              <p className="mt-2 flex items-start gap-2 text-xs text-text-muted">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Total cobrado: {FORMAT_ARS(amounts.total)}. Los porcentajes se aplican sobre la
                ganancia del día.
              </p>
            </div>

            <div className="mt-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted font-display">
                Reparto
              </h3>
              <dl className="divide-y divide-border-subtle rounded-lg border border-border-subtle">
                {distributionRows.map(({ icon: RowIcon, label, value, tone }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                  >
                    <dt className="flex items-center gap-2 text-text-secondary">
                      <RowIcon className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
                      {label}
                    </dt>
                    <dd className={`font-mono font-bold ${tone}`}>{FORMAT_ARS(value)}</dd>
                  </div>
                ))}
              </dl>

              {deductions && deductions.total > 0 && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setShowBreakdown((prev) => !prev)}
                    aria-expanded={showBreakdown}
                    aria-controls="verification-deductions"
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-accent-teal transition-colors hover:bg-accent-teal/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal/50"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${showBreakdown ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                    Ver desglose de descuentos
                  </button>
                  {showBreakdown && (
                    <div
                      id="verification-deductions"
                      className="mt-1 space-y-1 rounded-lg border border-border-subtle bg-bg-card-subtle px-3 py-2 text-xs text-text-secondary"
                    >
                      {deductions.vouchers !== null && deductions.vouchers > 0 && (
                        <p className="flex justify-between gap-3">
                          <span>Vales descontados</span>
                          <span className="font-mono font-semibold">
                            {FORMAT_ARS(deductions.vouchers)}
                          </span>
                        </p>
                      )}
                      {deductions.fuel !== null && deductions.fuel > 0 && (
                        <p className="flex justify-between gap-3">
                          <span>Combustible a cargo de la agencia</span>
                          <span className="font-mono font-semibold">
                            {FORMAT_ARS(deductions.fuel)}
                          </span>
                        </p>
                      )}
                      {deductions.vouchers === null && deductions.fuel === null && (
                        <p className="flex justify-between gap-3">
                          <span>Descuentos aplicados</span>
                          <span className="font-mono font-semibold">
                            {FORMAT_ARS(deductions.total)}
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {vouchers.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted font-display">
                  <Ticket className="h-4 w-4" aria-hidden="true" />
                  Vales del día ({vouchers.length})
                </h3>
                <ul className="divide-y divide-border-subtle rounded-lg border border-border-subtle">
                  {vouchers.map((voucher) => (
                    <li key={voucher.id} className="px-3 py-2 text-sm">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-medium text-text-primary">
                          {voucher.name}
                          <span className="ml-1 text-[11px] font-normal text-text-muted">
                            {voucher.type === 'factory' ? 'Fábrica' : 'Otro'}
                          </span>
                        </span>
                        <span className="font-mono font-semibold text-accent-teal">
                          {FORMAT_ARS(voucher.subtotal)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {voucher.trips} viajes × {FORMAT_ARS(voucher.pricePerTrip)}
                      </p>
                      {voucher.type === 'factory' && voucher.fixedFeeSubtotal > 0 && (
                        <p className="mt-0.5 flex justify-between gap-3 text-xs text-text-muted">
                          <span>
                            Fijo planilla: {voucher.trips} × {FORMAT_ARS(voucher.fixedFeePerTrip)}
                          </span>
                          <span className="font-mono">{FORMAT_ARS(voucher.fixedFeeSubtotal)}</span>
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
                {deductions && deductions.vouchers !== null && deductions.vouchers > 0 && (
                  <p className="mt-2 flex justify-between gap-3 px-3 text-xs font-semibold text-text-secondary">
                    <span>Total descontado por vales</span>
                    <span className="font-mono">{FORMAT_ARS(deductions.vouchers)}</span>
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="mt-5 flex items-start gap-2 rounded-lg border border-border-subtle bg-bg-card-subtle p-3 text-sm text-text-muted">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Los importes ya no están disponibles. La constancia se conserva únicamente con sus datos
            de auditoría.
          </div>
        )}

        <p className="mt-5 text-xs text-text-muted">
          Los importes son los de la constancia emitida el{' '}
          {FORMAT_TIMESTAMP_DATE_TIME(result.createdAt)}. Para validar el comprobante impreso,
          comparalos con los que figuran ahí.
        </p>
      </div>
    </div>
  )
}

export default VerificationDetails
