import type { ICalculationResult } from '../../../../../core/interfaces/ICalculationResult '
import type { ICalculationState } from '../../../../../core/interfaces/ICalculationState'

const ARS_FORMATTER = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

// FORMATEO SEGURO DE MONTOS EN ARS CON DOS DECIMALES.
export const FORMAT_ARS = (value?: number | null): string =>
  typeof value === 'number' && Number.isFinite(value) ? ARS_FORMATTER.format(value) : '—'

// FORMATEO SEGURO DE PORCENTAJES.
export const FORMAT_PERCENT = (value?: number | null): string =>
  typeof value === 'number' && Number.isFinite(value) ? `${value}%` : '—'

// ETIQUETAS LEGIBLES PARA LOS CAMPOS QUE EL BACKEND INFORMA COMO FALTANTES.
const MISSING_FIELD_LABELS: Record<string, string> = {
  totalInvoiced: 'Total facturado',
  vouchers: 'Vales',
  agencyPercentage: 'Porcentaje de agencia',
  driverPercentage: 'Porcentaje del conductor',
  vehicleRented: 'Alquiler del vehículo',
  vehiclePercentage: 'Porcentaje del vehículo',
  carOwner: 'Dueño del auto',
  gas: 'Gasto de gas',
  fuel: 'Gasto de nafta',
  percentages: 'Porcentajes (deben sumar 100%)',
}

// ETIQUETA GENERICA PARA CLAVES INTERNAS QUE NO TENGAN TRADUCCION CONOCIDA.
const FALLBACK_MISSING_FIELD: string = 'Otro dato'

// TRADUZCO LAS CLAVES FALTANTES Y EVITO DUPLICADOS.
export const FORMAT_MISSING_FIELDS = (fields: string[] = []): string[] =>
  Array.from(new Set(fields.map((field) => MISSING_FIELD_LABELS[field] ?? FALLBACK_MISSING_FIELD)))

// VALIDO QUE EL CALCULO TENGA UN RESULTADO LISTO PARA MOSTRAR.
export const HAS_RESULT = (
  calculation: ICalculationState,
): calculation is ICalculationState & { result: ICalculationResult } =>
  calculation.status === 'completed' && Boolean(calculation.result)
