const ARS_FORMATTER = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

// FORMATEO SEGURO DE MONTOS EN ARS CON DOS DECIMALES.
export const FORMAT_ARS = (value?: number | null): string =>
  typeof value === 'number' && Number.isFinite(value) ? ARS_FORMATTER.format(value) : '—'
