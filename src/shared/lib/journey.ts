import type { ICalculatorState } from '../../core/interfaces/ICalculatorState'

// INDICO SI LA JORNADA TIENE DATOS CARGADOS POR EL USUARIO (NO SOLO PORCENTAJES)
export const HAS_ACTIVE_JOURNEY = (state: ICalculatorState): boolean =>
  state.total !== 0 ||
  state.gas !== 0 ||
  state.petrol !== 0 ||
  state.vouchers.length > 0

// FECHA LOCAL DE HOY EN FORMATO AAAA-MM-DD (SIN DESFASE UTC)
export const TODAY_LOCAL_DATE = (): string => {
  const now: Date = new Date()
  const year: string = String(now.getFullYear())
  const month: string = String(now.getMonth() + 1).padStart(2, '0')
  const day: string = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// FORMATEO LA FECHA DE LA JORNADA (AAAA-MM-DD) SIN CORRERME DE DIA POR LA ZONA HORARIA
export const FORMAT_JOURNEY_DATE = (value: string): string => {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return value
  return new Date(year, month - 1, day).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// FORMATEO LA FECHA DE UN TIMESTAMP ISO (EJ: deletedAt) EN LA ZONA HORARIA DEL DISPOSITIVO
export const FORMAT_TIMESTAMP_DATE = (value: string): string => {
  const date: Date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// ZONA HORARIA DE LA APP: EL BACKEND GUARDA LA FECHA DE LA JORNADA CON ESTA MISMA ZONA.
const APP_TIME_ZONE: string = import.meta.env.VITE_ZONE

// FORMATEO UN TIMESTAMP ISO (EJ: createdAt DEL 409) EN FECHA Y HORA DE ARGENTINA.
// USO timeZone EXPLICITO PARA NO DEPENDER DE LA ZONA DEL DISPOSITIVO.
const APP_DATE_TIME_FORMATTER = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: APP_TIME_ZONE,
})

export const FORMAT_TIMESTAMP_DATE_TIME = (value: string): string => {
  const date: Date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return APP_DATE_TIME_FORMATTER.format(date)
}
